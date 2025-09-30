const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = 'your-super-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Currency Converter API is running!',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      convert: '/api/convert',
      profile: '/api/profile'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Enhanced user storage with roles and permissions
let users = [
    {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@currencyconverter.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users', 'view_analytics'],
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    },
    {
        id: 'user-1001',
        name: 'Premium User',
        email: 'premium@example.com', 
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'premium',
        permissions: ['read', 'write', 'export_data'],
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    },
    {
        id: 'user-1002',
        name: 'Standard User',
        email: 'user@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        permissions: ['read', 'write'],
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    }
];

let conversionHistory = [];
let favorites = [];
let systemLogs = [];

// Exchange rates
const exchangeRates = {
    USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, USD: 1 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 162.50, EUR: 1 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 189.00, GBP: 1 },
    JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053, JPY: 1 }
};

// AUTHORIZATION MIDDLEWARE

// Basic authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// Role-based authorization
function requireRole(role) {
    return (req, res, next) => {
        const user = users.find(u => u.id === req.user.userId);
        if (!user || user.role !== role) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

// Permission-based authorization  
function requirePermission(permission) {
    return (req, res, next) => {
        const user = users.find(u => u.id === req.user.userId);
        if (!user || !user.permissions.includes(permission)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

// Log system activity
function logActivity(userId, action, details) {
    systemLogs.push({
        id: 'log-' + Date.now(),
        userId,
        action,
        details,
        timestamp: new Date().toISOString(),
        ipAddress: "127.0.0.1"
    });
    if (systemLogs.length > 1000) systemLogs.shift();
}

// PUBLIC ENDPOINTS (No authentication required)

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Authorization Server is running',
        features: ['role-based-auth', 'permission-system', 'admin-panel']
    });
});

app.get('/api/convert', (req, res) => {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    if (!exchangeRates[from] || !exchangeRates[from][to]) {
        return res.status(400).json({ error: 'Invalid currency pair' });
    }

    const rate = exchangeRates[from][to];
    const result = (parseFloat(amount) * rate).toFixed(2);
    
    const conversionData = {
        from,
        to,
        amount: parseFloat(amount),
        rate,
        result: parseFloat(result),
        timestamp: new Date().toISOString()
    };

    conversionHistory.push(conversionData);
    if (conversionHistory.length > 1000) conversionHistory.shift();

    res.json(conversionData);
});

// AUTH ENDPOINTS

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: 'user-' + Date.now(),
            name,
            email,
            password: hashedPassword,
            role: 'user', // Default role
            permissions: ['read', 'write'], // Default permissions
            isVerified: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        users.push(user);
        logActivity(user.id, 'USER_REGISTERED', { email: user.email });

        const token = jwt.sign({ 
            userId: user.id, 
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }, JWT_SECRET);

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed: " + error.message });
        res.status(500).json({ error: "Registration failed: " + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        logActivity(user.id, 'USER_LOGIN', { email: user.email });

        const token = jwt.sign({ 
            userId: user.id, 
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }, JWT_SECRET);

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// USER PROFILE & BASIC FEATURES (Authenticated users)

app.get('/api/auth/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userConversions = conversionHistory.length;
    const userFavorites = favorites.filter(f => f.userId === user.id).length;
    const memberSince = new Date(user.createdAt);
    const memberDays = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24));

    res.json({ 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        statistics: {
            totalConversions: userConversions,
            favoritesCount: userFavorites,
            memberDays: memberDays
        }
    });
});

// PREMIUM FEATURES (Premium users only)

app.get('/api/premium/analytics', authenticateToken, requirePermission('export_data'), (req, res) => {
    const userConversions = conversionHistory.filter(c => 
        conversionHistory.slice(-100) // Last 100 conversions
    );
    
    res.json({
        userAnalytics: {
            totalConversions: conversionHistory.length,
            favoritePairs: calculateFavoritePairs(),
            conversionTrends: getConversionTrends()
        },
        exportUrl: `/api/premium/export?token=${req.query.token}`
    });
});

app.get('/api/premium/export', authenticateToken, requirePermission('export_data'), (req, res) => {
    const userData = {
        profile: users.find(u => u.id === req.user.userId),
        conversions: conversionHistory,
        favorites: favorites.filter(f => f.userId === req.user.userId),
        exportedAt: new Date().toISOString()
    };
    
    res.json({
        message: 'Data export ready',
        data: userData,
        downloadUrl: '#', // In production, generate actual file
        format: 'JSON'
    });
});

// ADMIN FEATURES (Admin users only)

app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
    const usersList = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
    }));
    
    res.json({
        totalUsers: users.length,
        users: usersList,
        roles: {
            admin: users.filter(u => u.role === 'admin').length,
            premium: users.filter(u => u.role === 'premium').length,
            user: users.filter(u => u.role === 'user').length
        }
    });
});

app.get('/api/admin/system-logs', authenticateToken, requireRole('admin'), (req, res) => {
    res.json({
        totalLogs: systemLogs.length,
        logs: systemLogs.slice(-100).reverse() // Last 100 logs
    });
});

app.post('/api/admin/users/:userId/role', authenticateToken, requireRole('admin'), (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const validRoles = ['user', 'premium', 'admin'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    
    user.role = role;
    
    // Update permissions based on role
    switch(role) {
        case 'admin':
            user.permissions = ['read', 'write', 'delete', 'manage_users', 'view_analytics'];
            break;
        case 'premium':
            user.permissions = ['read', 'write', 'export_data'];
            break;
        case 'user':
            user.permissions = ['read', 'write'];
            break;
    }
    
    logActivity(req.user.userId, 'USER_ROLE_UPDATED', { targetUserId: userId, newRole: role });
    
    res.json({ 
        success: true, 
        message: `User role updated to ${role}`,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }
    });
});

// FAVORITES (All authenticated users)

app.post('/api/favorites', authenticateToken, (req, res) => {
    const { from, to } = req.body;
    const favorite = { 
        id: 'fav-' + Date.now(),
        userId: req.user.userId, 
        from, 
        to, 
        createdAt: new Date().toISOString() 
    };
    
    favorites.push(favorite);
    logActivity(req.user.userId, 'FAVORITE_ADDED', { from, to });
    
    res.json({ message: 'Added to favorites', favorite });
});

app.get('/api/favorites', authenticateToken, (req, res) => {
    const userFavorites = favorites.filter(f => f.userId === req.user.userId);
    res.json(userFavorites);
});

// HELPER FUNCTIONS

function calculateFavoritePairs() {
    const pairCount = {};
    conversionHistory.forEach(conv => {
        const pair = `${conv.from}-${conv.to}`;
        pairCount[pair] = (pairCount[pair] || 0) + 1;
    });
    return Object.entries(pairCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pair, count]) => ({ pair, count }));
}

function getConversionTrends() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentConversions = conversionHistory.filter(conv => 
        new Date(conv.timestamp) > lastWeek
    );
    
    return {
        conversionsLast7Days: recentConversions.length,
        averageDaily: Math.round(recentConversions.length / 7)
    };
}

app.listen(PORT, () => {
    console.log(`🚀 Authorization Server running on port ${PORT}`);
    console.log(`🔐 Authentication: Enabled`);
    console.log(`🎯 Authorization: Role-based & Permission-based`);
    console.log(`👑 Admin Features: Enabled`);
    console.log(`💎 Premium Features: Enabled`);
    console.log(`📊 User Roles: ${users.length} users loaded`);
});

