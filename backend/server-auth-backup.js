const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in production, use MongoDB Atlas)
let users = [];
const JWT_SECRET = 'your-secret-key-change-in-production';

// Mock exchange rates
const exchangeRates = {
    'USD': { 'EUR': 0.92, 'GBP': 0.79, 'NGN': 1500, 'JPY': 148.5, 'CAD': 1.36, 'AUD': 1.52, 'CHF': 0.90, 'CNY': 7.25, 'GHS': 12.8, 'KES': 157, 'ZAR': 18.9 },
    'EUR': { 'USD': 1.09, 'GBP': 0.86, 'NGN': 1635, 'JPY': 161.5, 'CAD': 1.48, 'AUD': 1.65, 'CHF': 0.98, 'CNY': 7.88, 'GHS': 13.9, 'KES': 171, 'ZAR': 20.6 },
    'GBP': { 'USD': 1.27, 'EUR': 1.16, 'NGN': 1900, 'JPY': 187.5, 'CAD': 1.72, 'AUD': 1.92, 'CHF': 1.14, 'CNY': 9.15, 'GHS': 16.2, 'KES': 199, 'ZAR': 23.9 }
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            name,
            createdAt: new Date()
        };

        users.push(user);

        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'User registered successfully',
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected Routes
app.get('/api/health', authenticateToken, (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        user: req.user 
    });
});

// Protected currency conversion
app.get('/api/convert', authenticateToken, (req, res) => {
    const { from, to, amount } = req.query;
    
    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    if (!exchangeRates[from] || !exchangeRates[from][to]) {
        return res.status(400).json({ error: 'Invalid currency pair' });
    }

    const rate = exchangeRates[from][to];
    const result = (parseFloat(amount) * rate).toFixed(2);

    res.json({
        from,
        to,
        amount: parseFloat(amount),
        rate,
        result: parseFloat(result),
        user: req.user.email
    });
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Auth Server running on port ${PORT}`);
    console.log(`🔐 Authentication enabled`);
});
