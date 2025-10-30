-- Seed data for testing

-- Insert a demo user (password: demo123)
-- Note: In production, use proper password hashing (bcrypt)
INSERT OR IGNORE INTO users (id, email, password, name) VALUES 
  (1, 'demo@autosocial.ai', 'demo123', 'Demo User');

-- Insert user settings for demo user
INSERT OR IGNORE INTO user_settings (user_id, default_platform, default_tone, ai_provider) VALUES 
  (1, 'instagram', 'professional', 'gemini');

-- Insert sample posts
INSERT OR IGNORE INTO posts (user_id, platform, content, hashtags, tone, status) VALUES 
  (1, 'instagram', '🚀 Excited to share my journey in AI and automation! This is just the beginning of something amazing. Stay tuned for more updates!', '#AI #Automation #TechLife #Innovation #FutureIsNow', 'inspirational', 'published'),
  (1, 'linkedin', 'Thrilled to announce our latest project in AI-powered content creation. The future of social media marketing is here, and it''s automated, intelligent, and incredibly efficient.', '#ArtificialIntelligence #ContentMarketing #Innovation #DigitalTransformation', 'professional', 'published'),
  (1, 'twitter', 'Just launched AutoSocial AI! 🎉 Your personal AI content manager that generates, optimizes, and helps you schedule amazing social media posts. Check it out! 🚀', '#AI #SocialMedia #ContentCreation #Automation', 'casual', 'draft');

-- Insert sample analytics
INSERT OR IGNORE INTO analytics (post_id, user_id, views, likes, comments, shares, engagement_rate) VALUES 
  (1, 1, 1250, 87, 12, 5, 8.32),
  (2, 1, 3450, 234, 45, 23, 8.75);

-- Insert sample templates
INSERT OR IGNORE INTO templates (user_id, name, platform, template_content, tone) VALUES 
  (1, 'Product Launch', 'instagram', '🎉 Exciting news! We''re launching [PRODUCT_NAME]! [DESCRIPTION] Check it out at [LINK] #ProductLaunch #NewRelease', 'excited'),
  (1, 'Professional Update', 'linkedin', 'I''m pleased to share [ACHIEVEMENT/UPDATE]. [DETAILS] Looking forward to [FUTURE_PLANS]. #Professional #CareerGrowth', 'professional'),
  (1, 'Quick Tip', 'twitter', '💡 Pro tip: [TIP_CONTENT] Try it out and let me know how it goes! #Tips #Productivity', 'casual');
