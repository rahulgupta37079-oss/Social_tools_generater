import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
  GEMINI_API_KEY: string
  GROQ_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== AI HELPER FUNCTIONS ====================

async function generateWithGemini(prompt: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    }
  )

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid Gemini API response: ' + JSON.stringify(data))
  }
  
  return data.candidates[0].content.parts[0].text
}

async function generateWithGroq(prompt: string, apiKey: string) {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 2048
      })
    }
  )

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid Groq API response: ' + JSON.stringify(data))
  }
  
  return data.choices[0].message.content
}

function buildContentPrompt(platform: string, topic: string, tone: string, length: string) {
  const platformGuides = {
    instagram: 'Instagram post with emojis, engaging hooks, max 2200 characters. Focus on visual storytelling.',
    linkedin: 'LinkedIn professional post, thought-leadership style, 1300-1500 characters. Be insightful and value-driven.',
    twitter: 'Twitter/X tweet, max 280 characters, punchy and engaging. Use line breaks for readability.',
    facebook: 'Facebook post, conversational and engaging, 400-800 characters. Encourage interaction.',
    youtube: 'YouTube video description, compelling hook, keywords, timestamps, 800-1500 characters.',
    tiktok: 'TikTok caption, short and catchy with trending hashtags, max 150 characters.'
  }

  const toneGuides = {
    professional: 'Use professional, authoritative language.',
    casual: 'Use casual, friendly, conversational tone.',
    funny: 'Use humor, wit, and playful language.',
    inspirational: 'Use motivational, uplifting, and inspiring language.',
    educational: 'Use clear, informative, teaching-focused language.'
  }

  const lengthGuides = {
    short: 'Keep it brief and concise.',
    medium: 'Use moderate length with good detail.',
    long: 'Provide comprehensive detail and depth.'
  }

  return `You are an expert social media content creator. Generate a ${platform} post about: "${topic}"

Platform Guidelines: ${platformGuides[platform] || platformGuides.instagram}
Tone: ${toneGuides[tone] || toneGuides.professional}
Length: ${lengthGuides[length] || lengthGuides.medium}

Requirements:
1. Create engaging, platform-optimized content
2. Include relevant hashtags (5-10 for Instagram, 3-5 for others)
3. Use emojis appropriately for the platform
4. Make it actionable and valuable
5. Include a clear call-to-action

Format your response as JSON:
{
  "content": "the main post content",
  "hashtags": "hashtag1 hashtag2 hashtag3",
  "imagePrompt": "detailed prompt for AI image generation",
  "bestTime": "suggested posting time (e.g., 'Today at 2:00 PM')"
}

Only return the JSON, no other text.`
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// User authentication (simple version without JWT)
app.post('/api/auth/register', async (c) => {
  const { email, password, name } = await c.req.json()
  const db = c.env.DB

  try {
    // Check if user exists
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (existing) {
      return c.json({ error: 'User already exists' }, 400)
    }

    // Insert user (in production, hash the password!)
    const result = await db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    ).bind(email, password, name).run()

    // Create default settings
    await db.prepare(
      'INSERT INTO user_settings (user_id) VALUES (?)'
    ).bind(result.meta.last_row_id).run()

    return c.json({ 
      id: result.meta.last_row_id,
      email,
      name,
      message: 'User registered successfully'
    })
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500)
  }
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const db = c.env.DB

  try {
    const user = await db.prepare(
      'SELECT id, email, name FROM users WHERE email = ? AND password = ?'
    ).bind(email, password).first()

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    return c.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      message: 'Login successful'
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Get user settings
app.get('/api/settings/:userId', async (c) => {
  const userId = c.req.param('userId')
  const db = c.env.DB

  try {
    const settings = await db.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(userId).first()

    if (!settings) {
      return c.json({ error: 'Settings not found' }, 404)
    }

    return c.json(settings)
  } catch (error) {
    return c.json({ error: 'Failed to fetch settings' }, 500)
  }
})

// Update user settings
app.put('/api/settings/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { default_platform, default_tone, ai_provider, timezone, language } = await c.req.json()
  const db = c.env.DB

  try {
    await db.prepare(`
      UPDATE user_settings 
      SET default_platform = ?, default_tone = ?, ai_provider = ?, timezone = ?, language = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(default_platform, default_tone, ai_provider, timezone, language, userId).run()

    return c.json({ message: 'Settings updated successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to update settings' }, 500)
  }
})

// Generate content with AI
app.post('/api/generate', async (c) => {
  const { platform, topic, tone, length, provider } = await c.req.json()
  
  const prompt = buildContentPrompt(platform, topic, tone, length)
  const aiProvider = provider || 'gemini'

  try {
    let generatedText = ''
    
    if (aiProvider === 'gemini') {
      generatedText = await generateWithGemini(prompt, c.env.GEMINI_API_KEY)
    } else if (aiProvider === 'groq') {
      generatedText = await generateWithGroq(prompt, c.env.GROQ_API_KEY)
    } else {
      return c.json({ error: 'Invalid AI provider' }, 400)
    }

    // Try to parse JSON response
    let result
    try {
      // Remove markdown code blocks if present
      const cleanText = generatedText.replace(/```json\n?|\n?```/g, '').trim()
      result = JSON.parse(cleanText)
    } catch (parseError) {
      // If parsing fails, return raw text
      result = {
        content: generatedText,
        hashtags: '',
        imagePrompt: '',
        bestTime: 'Today at 2:00 PM'
      }
    }

    return c.json(result)
  } catch (error) {
    return c.json({ 
      error: 'AI generation failed',
      details: error.message 
    }, 500)
  }
})

// Save generated content
app.post('/api/posts', async (c) => {
  const { user_id, platform, content, hashtags, image_prompt, tone, status, scheduled_at } = await c.req.json()
  const db = c.env.DB

  try {
    const result = await db.prepare(`
      INSERT INTO posts (user_id, platform, content, hashtags, image_prompt, tone, status, scheduled_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(user_id, platform, content, hashtags, image_prompt, tone, status || 'draft', scheduled_at).run()

    return c.json({ 
      id: result.meta.last_row_id,
      message: 'Post saved successfully'
    })
  } catch (error) {
    return c.json({ error: 'Failed to save post' }, 500)
  }
})

// Get user's posts
app.get('/api/posts/:userId', async (c) => {
  const userId = c.req.param('userId')
  const db = c.env.DB

  try {
    const posts = await db.prepare(
      'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()

    return c.json(posts.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch posts' }, 500)
  }
})

// Get single post
app.get('/api/posts/:userId/:postId', async (c) => {
  const userId = c.req.param('userId')
  const postId = c.req.param('postId')
  const db = c.env.DB

  try {
    const post = await db.prepare(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?'
    ).bind(postId, userId).first()

    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    return c.json(post)
  } catch (error) {
    return c.json({ error: 'Failed to fetch post' }, 500)
  }
})

// Update post
app.put('/api/posts/:postId', async (c) => {
  const postId = c.req.param('postId')
  const { content, hashtags, image_prompt, status, scheduled_at } = await c.req.json()
  const db = c.env.DB

  try {
    await db.prepare(`
      UPDATE posts 
      SET content = ?, hashtags = ?, image_prompt = ?, status = ?, scheduled_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(content, hashtags, image_prompt, status, scheduled_at, postId).run()

    return c.json({ message: 'Post updated successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to update post' }, 500)
  }
})

// Delete post
app.delete('/api/posts/:postId', async (c) => {
  const postId = c.req.param('postId')
  const db = c.env.DB

  try {
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run()
    return c.json({ message: 'Post deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete post' }, 500)
  }
})

// Get analytics for user
app.get('/api/analytics/:userId', async (c) => {
  const userId = c.req.param('userId')
  const db = c.env.DB

  try {
    const analytics = await db.prepare(`
      SELECT a.*, p.platform, p.content, p.published_at
      FROM analytics a
      JOIN posts p ON a.post_id = p.id
      WHERE a.user_id = ?
      ORDER BY a.recorded_at DESC
    `).bind(userId).all()

    return c.json(analytics.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// Add analytics for a post
app.post('/api/analytics', async (c) => {
  const { post_id, user_id, views, likes, comments, shares } = await c.req.json()
  const db = c.env.DB

  try {
    const engagement_rate = ((likes + comments + shares) / views * 100).toFixed(2)
    
    const result = await db.prepare(`
      INSERT INTO analytics (post_id, user_id, views, likes, comments, shares, engagement_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(post_id, user_id, views, likes, comments, shares, engagement_rate).run()

    return c.json({ 
      id: result.meta.last_row_id,
      engagement_rate,
      message: 'Analytics saved successfully'
    })
  } catch (error) {
    return c.json({ error: 'Failed to save analytics' }, 500)
  }
})

// Get user templates
app.get('/api/templates/:userId', async (c) => {
  const userId = c.req.param('userId')
  const db = c.env.DB

  try {
    const templates = await db.prepare(
      'SELECT * FROM templates WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()

    return c.json(templates.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch templates' }, 500)
  }
})

// Save template
app.post('/api/templates', async (c) => {
  const { user_id, name, platform, template_content, tone } = await c.req.json()
  const db = c.env.DB

  try {
    const result = await db.prepare(`
      INSERT INTO templates (user_id, name, platform, template_content, tone)
      VALUES (?, ?, ?, ?, ?)
    `).bind(user_id, name, platform, template_content, tone).run()

    return c.json({ 
      id: result.meta.last_row_id,
      message: 'Template saved successfully'
    })
  } catch (error) {
    return c.json({ error: 'Failed to save template' }, 500)
  }
})

// Get dashboard stats
app.get('/api/dashboard/:userId', async (c) => {
  const userId = c.req.param('userId')
  const db = c.env.DB

  try {
    // Get total posts
    const totalPosts = await db.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?'
    ).bind(userId).first()

    // Get published posts
    const publishedPosts = await db.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = ?'
    ).bind(userId, 'published').first()

    // Get draft posts
    const draftPosts = await db.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = ?'
    ).bind(userId, 'draft').first()

    // Get average engagement
    const avgEngagement = await db.prepare(
      'SELECT AVG(engagement_rate) as avg FROM analytics WHERE user_id = ?'
    ).bind(userId).first()

    // Get total views
    const totalViews = await db.prepare(
      'SELECT SUM(views) as total FROM analytics WHERE user_id = ?'
    ).bind(userId).first()

    // Get recent posts
    const recentPosts = await db.prepare(
      'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 5'
    ).bind(userId).all()

    return c.json({
      totalPosts: totalPosts.count || 0,
      publishedPosts: publishedPosts.count || 0,
      draftPosts: draftPosts.count || 0,
      avgEngagement: avgEngagement.avg || 0,
      totalViews: totalViews.total || 0,
      recentPosts: recentPosts.results || []
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
})

// ==================== FRONTEND ====================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AutoSocial AI - Your AI Content Studio</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .card-hover {
                transition: all 0.3s ease;
            }
            .card-hover:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
