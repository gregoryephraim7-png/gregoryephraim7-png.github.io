const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';

app.use(cors());
app.use(express.json());

// Enhanced user storage with better error handling
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

// Authentication middleware
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

// FIXED REGISTRATION ENDPOINT
app.post('/api/auth/register', async (req, res) => {
    console.log('Registration attempt:', req.body);
    
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
        console.log('Missing fields:', { name, email, password: !!password });
        return res.status(400).json({ 
            success: false,
            error: 'All fields are required',
            missing: {
                name: !name,
                email: !email, 
                password: !password
            }
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    // Password strength
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long'
        });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        console.log('User already exists:', email);
        return res.status(400).json({
            success: false,
            error: 'User already exists with this email'
        });
    }

    try {
        console.log('Creating new user for:', email);
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user object
        const user = {
            id: 'user-' + Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'user',
            permissions: ['read', 'write'],
            isVerified: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        console.log('User created:', { id: user.id, email: user.email });

        // Add to users array
        users.push(user);
        console.log('Total users now:', users.length);

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('JWT token generated successfully');

        // Success response
        res.json({
            success: true,
            message: 'Registration successful!',
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

        console.log('Registration completed successfully for:', email);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed due to server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// FIXED LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({
            success: false,
            error: 'Invalid email or password'
        });
    }

    try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for:', email);
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful!',
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

        console.log('Login successful for:', email);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed due to server error'
        });
    }
});

// Keep all other endpoints from the authorization server
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Fixed Registration Server is running',
        users: users.length,
        features: ['fixed-registration', 'better-error-handling']
    });
});

app.get('/api/convert', async (req, res) => {
    const { from, to, amount } = req.query;
    
    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters: from, to, amount' });
    }

    try {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        // Use FreeCurrencyAPI - currency codes must be lowercase
        const fromLower = from.toLowerCase();
        const toLower = to.toLowerCase();
        
        console.log(`Converting ${numericAmount} ${from} to ${to} (API: ${fromLower} to ${toLower})`);
        
        const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromLower}.json`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Debug: log available currencies
        const availableCurrencies = Object.keys(data[fromLower] || {});
        console.log(`Found ${len(availableCurrencies)} currencies for ${fromLower}`);
        
        if (!data[fromLower] || !data[fromLower][toLower]) {
            return res.status(400).json({ 
                error: `Currency pair ${from}-${to} not supported`,
                hint: `Make sure both currencies are in the 339 supported currencies`
            });
        }

        const rate = data[fromLower][toLower];
        const convertedAmount = numericAmount * rate;

        // Log conversion activity
        if (req.user && req.user.userId) {
            logActivity(req.user.userId, 'CURRENCY_CONVERSION', {
                from: from.toUpperCase(),
                to: to.toUpperCase(), 
                amount: numericAmount, 
                convertedAmount: convertedAmount.toFixed(4),
                rate: rate.toFixed(6)
            });
        }

        const conversionData = {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            amount: numericAmount,
            rate: parseFloat(rate.toFixed(6)),
            result: parseFloat(convertedAmount.toFixed(4)),
            timestamp: new Date().toISOString(),
            apiSource: 'FreeCurrencyAPI.com'
        };

        conversionHistory.push(conversionData);
        if (conversionHistory.length > 1000) conversionHistory.shift();

        res.json(conversionData);

    } catch (error) {
        console.error('Currency conversion error:', error);
        res.status(500).json({ 
            error: 'Currency conversion service unavailable',
            details: error.message 
        });
    }
});
        }

        const conversionData = {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            amount: numericAmount,
            rate: parseFloat(rate.toFixed(6)),
            result: parseFloat(convertedAmount.toFixed(4)),
            timestamp: new Date().toISOString(),
            apiSource: 'FreeCurrencyAPI.com'
        };

        conversionHistory.push(conversionData);
        if (conversionHistory.length > 1000) conversionHistory.shift();

        res.json(conversionData);

    } catch (error) {
        console.error('Currency conversion error:', error);
        res.status(500).json({ 
            error: 'Currency conversion service unavailable',
            details: error.message 
        });
    }
});
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

app.listen(PORT, () => {
    console.log(`🚀 Fixed Registration Server running on port ${PORT}`);
    console.log(`🔐 Registration: Fixed with better error handling`);
    console.log(`📧 Email validation: Enabled`);
    console.log(`🔒 Password validation: Enabled`);
    console.log(`👥 Users: ${users.length} users loaded`);
});
