const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// ADD TEST USERS HERE
let users = [
    {
        id: 'user-1001',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        createdAt: new Date().toISOString()
    },
    {
        id: 'user-1002', 
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    }
];

const JWT_SECRET = 'your-secret-key-change-in-production';

// Mock exchange rates
const exchangeRates = {
    'USD': { 'EUR': 0.92, 'GBP': 0.79, 'NGN': 1500, 'JPY': 148.5, 'CAD': 1.36, 'AUD': 1.52, 'CHF': 0.90, 'CNY': 7.25, 'GHS': 12.8, 'KES': 157, 'ZAR': 18.9 },
    'EUR': { 'USD': 1.09, 'GBP': 0.86, 'NGN': 1635, 'JPY': 161.5, 'CAD': 1.48, 'AUD': 1.65, 'CHF': 0.98, 'CNY': 7.88, 'GHS': 13.9, 'KES': 171, 'ZAR': 20.6 },
    'GBP': { 'USD': 1.27, 'EUR': 1.16, 'NGN': 1900, 'JPY': 187.5, 'CAD': 1.72, 'AUD': 1.92, 'CHF': 1.14, 'CNY': 9.15, 'GHS': 16.2, 'KES': 199, 'ZAR': 23.9 }
};

// Authentication Middleware
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server with test users is running' });
});

// Public conversion endpoint
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

    res.json({
        from,
        to,
        amount: parseFloat(amount),
        rate,
        result: parseFloat(result)
    });
});

// User registration
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
            createdAt: new Date().toISOString()
        };

        users.push(user);

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
        res.json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
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

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
        res.json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// User profile
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

app.listen(PORT, () => {
    console.log(`🚀 Auth Server with test users running on port ${PORT}`);
    console.log(`🔐 Authentication enabled`);
    console.log(`👥 Test users: ${users.length} users available`);
});
