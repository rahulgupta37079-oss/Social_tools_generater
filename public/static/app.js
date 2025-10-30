// AutoSocial AI - Frontend Application

// State management
const state = {
    currentUser: null,
    currentView: 'login',
    posts: [],
    settings: null,
    analytics: [],
    templates: [],
    dashboardData: null
}

// API Base URL
const API_BASE = '/api'

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('autosocial_user')
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser)
        loadUserData()
        renderDashboard()
    } else {
        renderLogin()
    }
})

// ==================== RENDER FUNCTIONS ====================

function renderLogin() {
    state.currentView = 'login'
    const app = document.getElementById('app')
    app.innerHTML = `
        <div class="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-robot text-purple-600"></i> AutoSocial AI
                    </h1>
                    <p class="text-gray-600">Your AI-Powered Content Studio</p>
                </div>
                
                <div id="auth-tabs" class="flex mb-6 border-b">
                    <button onclick="showLoginTab()" id="login-tab" class="flex-1 py-3 px-4 font-semibold border-b-2 border-purple-600 text-purple-600">
                        Login
                    </button>
                    <button onclick="showRegisterTab()" id="register-tab" class="flex-1 py-3 px-4 font-semibold text-gray-500">
                        Register
                    </button>
                </div>
                
                <!-- Login Form -->
                <div id="login-form">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2 font-semibold">Email</label>
                        <input type="email" id="login-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="you@example.com">
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2 font-semibold">Password</label>
                        <input type="password" id="login-password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="••••••••">
                    </div>
                    <button onclick="handleLogin()" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                        <i class="fas fa-sign-in-alt mr-2"></i> Login
                    </button>
                    <div class="mt-4 text-center">
                        <p class="text-sm text-gray-600">Demo: demo@autosocial.ai / demo123</p>
                    </div>
                </div>
                
                <!-- Register Form -->
                <div id="register-form" class="hidden">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2 font-semibold">Full Name</label>
                        <input type="text" id="register-name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="John Doe">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2 font-semibold">Email</label>
                        <input type="email" id="register-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="you@example.com">
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2 font-semibold">Password</label>
                        <input type="password" id="register-password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="••••••••">
                    </div>
                    <button onclick="handleRegister()" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                        <i class="fas fa-user-plus mr-2"></i> Create Account
                    </button>
                </div>
                
                <div id="auth-message" class="mt-4 text-center text-sm"></div>
            </div>
        </div>
    `
}

function renderDashboard() {
    state.currentView = 'dashboard'
    const app = document.getElementById('app')
    app.innerHTML = `
        <!-- Navigation -->
        <nav class="gradient-bg text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-robot text-3xl"></i>
                        <h1 class="text-2xl font-bold">AutoSocial AI</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm">👋 ${state.currentUser.name}</span>
                        <button onclick="handleLogout()" class="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Tab Navigation -->
            <div class="flex space-x-2 mb-6 border-b overflow-x-auto">
                <button onclick="showTab('dashboard')" id="tab-dashboard" class="px-6 py-3 font-semibold border-b-2 border-purple-600 text-purple-600">
                    <i class="fas fa-home mr-2"></i> Dashboard
                </button>
                <button onclick="showTab('generate')" id="tab-generate" class="px-6 py-3 font-semibold text-gray-600 hover:text-purple-600">
                    <i class="fas fa-magic mr-2"></i> Generate
                </button>
                <button onclick="showTab('library')" id="tab-library" class="px-6 py-3 font-semibold text-gray-600 hover:text-purple-600">
                    <i class="fas fa-folder mr-2"></i> Library
                </button>
                <button onclick="showTab('analytics')" id="tab-analytics" class="px-6 py-3 font-semibold text-gray-600 hover:text-purple-600">
                    <i class="fas fa-chart-line mr-2"></i> Analytics
                </button>
                <button onclick="showTab('settings')" id="tab-settings" class="px-6 py-3 font-semibold text-gray-600 hover:text-purple-600">
                    <i class="fas fa-cog mr-2"></i> Settings
                </button>
            </div>
            
            <!-- Tab Content -->
            <div id="tab-content"></div>
        </div>
    `
    
    showTab('dashboard')
}

function renderDashboardTab() {
    const content = document.getElementById('tab-content')
    const data = state.dashboardData || {}
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Stats Cards -->
            <div class="bg-white rounded-xl shadow-md p-6 card-hover">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-gray-600 font-semibold">Total Posts</h3>
                    <i class="fas fa-file-alt text-3xl text-blue-500"></i>
                </div>
                <p class="text-4xl font-bold text-gray-800">${data.totalPosts || 0}</p>
            </div>
            
            <div class="bg-white rounded-xl shadow-md p-6 card-hover">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-gray-600 font-semibold">Published</h3>
                    <i class="fas fa-check-circle text-3xl text-green-500"></i>
                </div>
                <p class="text-4xl font-bold text-gray-800">${data.publishedPosts || 0}</p>
            </div>
            
            <div class="bg-white rounded-xl shadow-md p-6 card-hover">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-gray-600 font-semibold">Drafts</h3>
                    <i class="fas fa-edit text-3xl text-yellow-500"></i>
                </div>
                <p class="text-4xl font-bold text-gray-800">${data.draftPosts || 0}</p>
            </div>
            
            <div class="bg-white rounded-xl shadow-md p-6 card-hover">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-gray-600 font-semibold">Avg Engagement</h3>
                    <i class="fas fa-heart text-3xl text-red-500"></i>
                </div>
                <p class="text-4xl font-bold text-gray-800">${(data.avgEngagement || 0).toFixed(1)}%</p>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-bolt text-yellow-500 mr-2"></i> Quick Actions
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onclick="showTab('generate')" class="gradient-bg text-white p-4 rounded-lg hover:opacity-90 transition">
                    <i class="fas fa-magic text-2xl mb-2"></i>
                    <p class="font-semibold">Generate New Content</p>
                </button>
                <button onclick="showTab('library')" class="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition">
                    <i class="fas fa-folder-open text-2xl mb-2"></i>
                    <p class="font-semibold">View Library</p>
                </button>
                <button onclick="showTab('analytics')" class="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition">
                    <i class="fas fa-chart-bar text-2xl mb-2"></i>
                    <p class="font-semibold">View Analytics</p>
                </button>
            </div>
        </div>
        
        <!-- Recent Posts -->
        <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-clock text-blue-500 mr-2"></i> Recent Posts
            </h2>
            <div id="recent-posts-list" class="space-y-4">
                ${renderRecentPosts(data.recentPosts || [])}
            </div>
        </div>
    `
}

function renderRecentPosts(posts) {
    if (posts.length === 0) {
        return '<p class="text-gray-500 text-center py-8">No posts yet. Start generating content!</p>'
    }
    
    return posts.map(post => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-400 transition">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-purple-600">${getPlatformIcon(post.platform)} ${post.platform}</span>
                <span class="text-xs text-gray-500">${formatDate(post.created_at)}</span>
            </div>
            <p class="text-gray-700 line-clamp-2">${post.content}</p>
            <div class="mt-2 flex items-center justify-between">
                <span class="text-xs px-2 py-1 rounded ${getStatusColor(post.status)}">${post.status}</span>
                <button onclick="viewPost(${post.id})" class="text-sm text-purple-600 hover:text-purple-800">
                    View Details <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
    `).join('')
}

function renderGenerateTab() {
    const content = document.getElementById('tab-content')
    const settings = state.settings || {}
    
    content.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-xl shadow-md p-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-magic text-purple-600 mr-2"></i> Generate AI Content
                </h2>
                
                <div class="space-y-6">
                    <!-- Platform Selection -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Platform</label>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <button onclick="selectPlatform('instagram')" class="platform-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-600 transition" data-platform="instagram">
                                <i class="fab fa-instagram text-3xl text-pink-600 mb-2"></i>
                                <p class="font-semibold">Instagram</p>
                            </button>
                            <button onclick="selectPlatform('linkedin')" class="platform-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-600 transition" data-platform="linkedin">
                                <i class="fab fa-linkedin text-3xl text-blue-700 mb-2"></i>
                                <p class="font-semibold">LinkedIn</p>
                            </button>
                            <button onclick="selectPlatform('twitter')" class="platform-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-600 transition" data-platform="twitter">
                                <i class="fab fa-x-twitter text-3xl text-gray-800 mb-2"></i>
                                <p class="font-semibold">Twitter/X</p>
                            </button>
                            <button onclick="selectPlatform('facebook')" class="platform-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-600 transition" data-platform="facebook">
                                <i class="fab fa-facebook text-3xl text-blue-600 mb-2"></i>
                                <p class="font-semibold">Facebook</p>
                            </button>
                            <button onclick="selectPlatform('youtube')" class="platform-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-600 transition" data-platform="youtube">
                                <i class="fab fa-youtube text-3xl text-red-600 mb-2"></i>
                                <p class="font-semibold">YouTube</p>
                            </button>
                            <button onclick="selectPlatform('tiktok')" class="platform-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-600 transition" data-platform="tiktok">
                                <i class="fab fa-tiktok text-3xl text-gray-900 mb-2"></i>
                                <p class="font-semibold">TikTok</p>
                            </button>
                        </div>
                        <input type="hidden" id="selected-platform" value="${settings.default_platform || 'instagram'}">
                    </div>
                    
                    <!-- Topic Input -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Topic / Description</label>
                        <textarea id="topic-input" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="What would you like to post about? E.g., 'Share tips about productivity and AI tools'"></textarea>
                    </div>
                    
                    <!-- Options -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">Tone</label>
                            <select id="tone-select" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="funny">Funny</option>
                                <option value="inspirational">Inspirational</option>
                                <option value="educational">Educational</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">Length</label>
                            <select id="length-select" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                                <option value="short">Short</option>
                                <option value="medium" selected>Medium</option>
                                <option value="long">Long</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">AI Provider</label>
                            <select id="provider-select" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                                <option value="gemini" selected>Gemini (Fast & Free)</option>
                                <option value="groq">Groq (Super Fast)</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Generate Button -->
                    <button onclick="generateContent()" id="generate-btn" class="w-full gradient-bg text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition">
                        <i class="fas fa-sparkles mr-2"></i> Generate with AI
                    </button>
                </div>
            </div>
            
            <!-- Generated Content -->
            <div id="generated-content" class="hidden mt-8 bg-white rounded-xl shadow-md p-8">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i> Generated Content
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Caption</label>
                        <textarea id="generated-caption" rows="8" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Hashtags</label>
                        <input type="text" id="generated-hashtags" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Image Prompt (for AI image generation)</label>
                        <textarea id="generated-image-prompt" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Best Time to Post</label>
                        <input type="text" id="generated-best-time" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readonly>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="copyContent()" class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
                            <i class="fas fa-copy mr-2"></i> Copy All
                        </button>
                        <button onclick="saveContent()" class="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                            <i class="fas fa-save mr-2"></i> Save to Library
                        </button>
                        <button onclick="regenerateContent()" class="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition">
                            <i class="fas fa-sync mr-2"></i> Regenerate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
    
    // Set default platform selection
    selectPlatform(settings.default_platform || 'instagram')
}

function renderLibraryTab() {
    const content = document.getElementById('tab-content')
    
    content.innerHTML = `
        <div class="bg-white rounded-xl shadow-md p-8">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-folder-open text-purple-600 mr-2"></i> Content Library
                </h2>
                <button onclick="showTab('generate')" class="gradient-bg text-white px-6 py-2 rounded-lg hover:opacity-90 transition">
                    <i class="fas fa-plus mr-2"></i> Generate New
                </button>
            </div>
            
            <!-- Filter -->
            <div class="mb-6 flex space-x-3">
                <select id="filter-platform" onchange="filterPosts()" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    <option value="">All Platforms</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                </select>
                
                <select id="filter-status" onchange="filterPosts()" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                </select>
            </div>
            
            <!-- Posts Grid -->
            <div id="posts-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${renderPostsGrid(state.posts)}
            </div>
        </div>
    `
}

function renderPostsGrid(posts) {
    if (posts.length === 0) {
        return '<div class="col-span-full text-center py-12"><i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i><p class="text-gray-500">No posts found. Start generating content!</p></div>'
    }
    
    return posts.map(post => `
        <div class="border-2 border-gray-200 rounded-lg p-5 hover:border-purple-400 transition card-hover">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-bold text-purple-600">${getPlatformIcon(post.platform)} ${post.platform.toUpperCase()}</span>
                <span class="text-xs px-2 py-1 rounded ${getStatusColor(post.status)}">${post.status}</span>
            </div>
            <p class="text-gray-700 text-sm mb-3 line-clamp-4">${post.content}</p>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span><i class="far fa-clock mr-1"></i> ${formatDate(post.created_at)}</span>
            </div>
            <div class="flex space-x-2">
                <button onclick="viewPost(${post.id})" class="flex-1 bg-purple-100 text-purple-600 py-2 rounded hover:bg-purple-200 transition text-sm font-semibold">
                    <i class="fas fa-eye mr-1"></i> View
                </button>
                <button onclick="deletePost(${post.id})" class="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 transition">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('')
}

function renderAnalyticsTab() {
    const content = document.getElementById('tab-content')
    
    content.innerHTML = `
        <div class="bg-white rounded-xl shadow-md p-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-chart-line text-purple-600 mr-2"></i> Analytics Dashboard
            </h2>
            
            <div class="mb-8">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-blue-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        <strong>Manual Entry:</strong> Since this is a demo app, analytics are entered manually. In production, these would sync automatically from social media platforms.
                    </p>
                </div>
            </div>
            
            <div class="space-y-6">
                ${renderAnalyticsList(state.analytics)}
            </div>
        </div>
    `
}

function renderAnalyticsList(analytics) {
    if (analytics.length === 0) {
        return '<p class="text-gray-500 text-center py-8">No analytics data yet.</p>'
    }
    
    return analytics.map(item => `
        <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="text-sm font-semibold text-purple-600">${getPlatformIcon(item.platform)} ${item.platform}</span>
                    <p class="text-xs text-gray-500">${formatDate(item.recorded_at)}</p>
                </div>
                <span class="text-2xl font-bold text-purple-600">${item.engagement_rate.toFixed(1)}%</span>
            </div>
            <div class="grid grid-cols-4 gap-4 text-center">
                <div>
                    <p class="text-2xl font-bold text-blue-600">${item.views || 0}</p>
                    <p class="text-xs text-gray-600">Views</p>
                </div>
                <div>
                    <p class="text-2xl font-bold text-red-600">${item.likes || 0}</p>
                    <p class="text-xs text-gray-600">Likes</p>
                </div>
                <div>
                    <p class="text-2xl font-bold text-green-600">${item.comments || 0}</p>
                    <p class="text-xs text-gray-600">Comments</p>
                </div>
                <div>
                    <p class="text-2xl font-bold text-purple-600">${item.shares || 0}</p>
                    <p class="text-xs text-gray-600">Shares</p>
                </div>
            </div>
        </div>
    `).join('')
}

function renderSettingsTab() {
    const content = document.getElementById('tab-content')
    const settings = state.settings || {}
    
    content.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-cog text-purple-600 mr-2"></i> Settings
            </h2>
            
            <div class="space-y-6">
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Default Platform</label>
                    <select id="settings-platform" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option value="instagram" ${settings.default_platform === 'instagram' ? 'selected' : ''}>Instagram</option>
                        <option value="linkedin" ${settings.default_platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                        <option value="twitter" ${settings.default_platform === 'twitter' ? 'selected' : ''}>Twitter/X</option>
                        <option value="facebook" ${settings.default_platform === 'facebook' ? 'selected' : ''}>Facebook</option>
                        <option value="youtube" ${settings.default_platform === 'youtube' ? 'selected' : ''}>YouTube</option>
                        <option value="tiktok" ${settings.default_platform === 'tiktok' ? 'selected' : ''}>TikTok</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Default Tone</label>
                    <select id="settings-tone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option value="professional" ${settings.default_tone === 'professional' ? 'selected' : ''}>Professional</option>
                        <option value="casual" ${settings.default_tone === 'casual' ? 'selected' : ''}>Casual</option>
                        <option value="funny" ${settings.default_tone === 'funny' ? 'selected' : ''}>Funny</option>
                        <option value="inspirational" ${settings.default_tone === 'inspirational' ? 'selected' : ''}>Inspirational</option>
                        <option value="educational" ${settings.default_tone === 'educational' ? 'selected' : ''}>Educational</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Preferred AI Provider</label>
                    <select id="settings-ai" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option value="gemini" ${settings.ai_provider === 'gemini' ? 'selected' : ''}>Google Gemini (Free, High Quality)</option>
                        <option value="groq" ${settings.ai_provider === 'groq' ? 'selected' : ''}>Groq (Free, Super Fast)</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Timezone</label>
                    <select id="settings-timezone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option value="UTC" ${settings.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
                        <option value="America/New_York" ${settings.timezone === 'America/New_York' ? 'selected' : ''}>Eastern Time (US)</option>
                        <option value="America/Los_Angeles" ${settings.timezone === 'America/Los_Angeles' ? 'selected' : ''}>Pacific Time (US)</option>
                        <option value="Europe/London" ${settings.timezone === 'Europe/London' ? 'selected' : ''}>London</option>
                        <option value="Asia/Dubai" ${settings.timezone === 'Asia/Dubai' ? 'selected' : ''}>Dubai</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Language</label>
                    <select id="settings-language" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="es" ${settings.language === 'es' ? 'selected' : ''}>Español</option>
                        <option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>Français</option>
                        <option value="de" ${settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                        <option value="ar" ${settings.language === 'ar' ? 'selected' : ''}>العربية</option>
                    </select>
                </div>
                
                <button onclick="saveSettings()" class="w-full gradient-bg text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
                    <i class="fas fa-save mr-2"></i> Save Settings
                </button>
            </div>
        </div>
    `
}

// ==================== EVENT HANDLERS ====================

function showLoginTab() {
    document.getElementById('login-tab').className = 'flex-1 py-3 px-4 font-semibold border-b-2 border-purple-600 text-purple-600'
    document.getElementById('register-tab').className = 'flex-1 py-3 px-4 font-semibold text-gray-500'
    document.getElementById('login-form').classList.remove('hidden')
    document.getElementById('register-form').classList.add('hidden')
}

function showRegisterTab() {
    document.getElementById('register-tab').className = 'flex-1 py-3 px-4 font-semibold border-b-2 border-purple-600 text-purple-600'
    document.getElementById('login-tab').className = 'flex-1 py-3 px-4 font-semibold text-gray-500'
    document.getElementById('register-form').classList.remove('hidden')
    document.getElementById('login-form').classList.add('hidden')
}

async function handleLogin() {
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    
    if (!email || !password) {
        showMessage('Please fill all fields', 'error')
        return
    }
    
    try {
        const response = await axios.post(`${API_BASE}/auth/login`, { email, password })
        state.currentUser = response.data
        localStorage.setItem('autosocial_user', JSON.stringify(response.data))
        await loadUserData()
        renderDashboard()
    } catch (error) {
        showMessage('Invalid credentials', 'error')
    }
}

async function handleRegister() {
    const name = document.getElementById('register-name').value
    const email = document.getElementById('register-email').value
    const password = document.getElementById('register-password').value
    
    if (!name || !email || !password) {
        showMessage('Please fill all fields', 'error')
        return
    }
    
    try {
        const response = await axios.post(`${API_BASE}/auth/register`, { email, password, name })
        state.currentUser = response.data
        localStorage.setItem('autosocial_user', JSON.stringify(response.data))
        await loadUserData()
        renderDashboard()
    } catch (error) {
        showMessage(error.response?.data?.error || 'Registration failed', 'error')
    }
}

function handleLogout() {
    state.currentUser = null
    state.posts = []
    state.settings = null
    state.analytics = []
    state.dashboardData = null
    localStorage.removeItem('autosocial_user')
    renderLogin()
}

function showTab(tabName) {
    // Update tab buttons
    const tabs = ['dashboard', 'generate', 'library', 'analytics', 'settings']
    tabs.forEach(tab => {
        const button = document.getElementById(`tab-${tab}`)
        if (button) {
            if (tab === tabName) {
                button.className = 'px-6 py-3 font-semibold border-b-2 border-purple-600 text-purple-600'
            } else {
                button.className = 'px-6 py-3 font-semibold text-gray-600 hover:text-purple-600'
            }
        }
    })
    
    // Render content
    state.currentView = tabName
    switch (tabName) {
        case 'dashboard':
            renderDashboardTab()
            break
        case 'generate':
            renderGenerateTab()
            break
        case 'library':
            renderLibraryTab()
            break
        case 'analytics':
            renderAnalyticsTab()
            break
        case 'settings':
            renderSettingsTab()
            break
    }
}

function selectPlatform(platform) {
    document.getElementById('selected-platform').value = platform
    document.querySelectorAll('.platform-btn').forEach(btn => {
        if (btn.dataset.platform === platform) {
            btn.className = 'platform-btn border-2 border-purple-600 bg-purple-50 rounded-lg p-4 transition'
        } else {
            btn.className = 'platform-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-600 transition'
        }
    })
}

async function generateContent() {
    const platform = document.getElementById('selected-platform').value
    const topic = document.getElementById('topic-input').value
    const tone = document.getElementById('tone-select').value
    const length = document.getElementById('length-select').value
    const provider = document.getElementById('provider-select').value
    
    if (!topic) {
        alert('Please enter a topic or description')
        return
    }
    
    const btn = document.getElementById('generate-btn')
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...'
    
    try {
        const response = await axios.post(`${API_BASE}/generate`, {
            platform,
            topic,
            tone,
            length,
            provider
        })
        
        // Show generated content
        document.getElementById('generated-content').classList.remove('hidden')
        document.getElementById('generated-caption').value = response.data.content
        document.getElementById('generated-hashtags').value = response.data.hashtags
        document.getElementById('generated-image-prompt').value = response.data.imagePrompt
        document.getElementById('generated-best-time').value = response.data.bestTime
        
        // Scroll to result
        document.getElementById('generated-content').scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
        alert('Generation failed: ' + (error.response?.data?.error || error.message))
    } finally {
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-sparkles mr-2"></i> Generate with AI'
    }
}

function copyContent() {
    const caption = document.getElementById('generated-caption').value
    const hashtags = document.getElementById('generated-hashtags').value
    const fullContent = `${caption}\n\n${hashtags}`
    
    navigator.clipboard.writeText(fullContent).then(() => {
        alert('✅ Content copied to clipboard!')
    })
}

async function saveContent() {
    const platform = document.getElementById('selected-platform').value
    const content = document.getElementById('generated-caption').value
    const hashtags = document.getElementById('generated-hashtags').value
    const imagePrompt = document.getElementById('generated-image-prompt').value
    const tone = document.getElementById('tone-select').value
    
    try {
        await axios.post(`${API_BASE}/posts`, {
            user_id: state.currentUser.id,
            platform,
            content,
            hashtags,
            image_prompt: imagePrompt,
            tone,
            status: 'draft'
        })
        
        alert('✅ Content saved to library!')
        await loadPosts()
    } catch (error) {
        alert('Failed to save: ' + (error.response?.data?.error || error.message))
    }
}

function regenerateContent() {
    generateContent()
}

async function saveSettings() {
    const settings = {
        default_platform: document.getElementById('settings-platform').value,
        default_tone: document.getElementById('settings-tone').value,
        ai_provider: document.getElementById('settings-ai').value,
        timezone: document.getElementById('settings-timezone').value,
        language: document.getElementById('settings-language').value
    }
    
    try {
        await axios.put(`${API_BASE}/settings/${state.currentUser.id}`, settings)
        state.settings = settings
        alert('✅ Settings saved successfully!')
    } catch (error) {
        alert('Failed to save settings')
    }
}

function filterPosts() {
    const platform = document.getElementById('filter-platform').value
    const status = document.getElementById('filter-status').value
    
    let filtered = state.posts
    
    if (platform) {
        filtered = filtered.filter(p => p.platform === platform)
    }
    
    if (status) {
        filtered = filtered.filter(p => p.status === status)
    }
    
    document.getElementById('posts-grid').innerHTML = renderPostsGrid(filtered)
}

async function viewPost(postId) {
    const post = state.posts.find(p => p.id === postId)
    if (!post) return
    
    alert(`Platform: ${post.platform}\n\n${post.content}\n\n${post.hashtags}`)
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
        await axios.delete(`${API_BASE}/posts/${postId}`)
        await loadPosts()
        showTab('library')
    } catch (error) {
        alert('Failed to delete post')
    }
}

// ==================== DATA LOADING ====================

async function loadUserData() {
    await Promise.all([
        loadSettings(),
        loadPosts(),
        loadAnalytics(),
        loadDashboardData()
    ])
}

async function loadSettings() {
    try {
        const response = await axios.get(`${API_BASE}/settings/${state.currentUser.id}`)
        state.settings = response.data
    } catch (error) {
        console.error('Failed to load settings')
    }
}

async function loadPosts() {
    try {
        const response = await axios.get(`${API_BASE}/posts/${state.currentUser.id}`)
        state.posts = response.data
    } catch (error) {
        console.error('Failed to load posts')
    }
}

async function loadAnalytics() {
    try {
        const response = await axios.get(`${API_BASE}/analytics/${state.currentUser.id}`)
        state.analytics = response.data
    } catch (error) {
        console.error('Failed to load analytics')
    }
}

async function loadDashboardData() {
    try {
        const response = await axios.get(`${API_BASE}/dashboard/${state.currentUser.id}`)
        state.dashboardData = response.data
    } catch (error) {
        console.error('Failed to load dashboard data')
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showMessage(message, type) {
    const msgEl = document.getElementById('auth-message')
    msgEl.textContent = message
    msgEl.className = `mt-4 text-center text-sm ${type === 'error' ? 'text-red-600' : 'text-green-600'}`
}

function getPlatformIcon(platform) {
    const icons = {
        instagram: '<i class="fab fa-instagram"></i>',
        linkedin: '<i class="fab fa-linkedin"></i>',
        twitter: '<i class="fab fa-x-twitter"></i>',
        facebook: '<i class="fab fa-facebook"></i>',
        youtube: '<i class="fab fa-youtube"></i>',
        tiktok: '<i class="fab fa-tiktok"></i>'
    }
    return icons[platform] || '<i class="fas fa-share-alt"></i>'
}

function getStatusColor(status) {
    const colors = {
        draft: 'bg-yellow-100 text-yellow-800',
        scheduled: 'bg-blue-100 text-blue-800',
        published: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
