const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Mock exchange rates (works without external APIs)
const exchangeRates = {
    'USD': { 'EUR': 0.92, 'GBP': 0.79, 'NGN': 1500, 'JPY': 148.5, 'CAD': 1.36, 'AUD': 1.52, 'CHF': 0.90, 'CNY': 7.25, 'GHS': 12.8, 'KES': 157, 'ZAR': 18.9 },
    'EUR': { 'USD': 1.09, 'GBP': 0.86, 'NGN': 1635, 'JPY': 161.5, 'CAD': 1.48, 'AUD': 1.65, 'CHF': 0.98, 'CNY': 7.88, 'GHS': 13.9, 'KES': 171, 'ZAR': 20.6 },
    'GBP': { 'USD': 1.27, 'EUR': 1.16, 'NGN': 1900, 'JPY': 187.5, 'CAD': 1.72, 'AUD': 1.92, 'CHF': 1.14, 'CNY': 9.15, 'GHS': 16.2, 'KES': 199, 'ZAR': 23.9 }
};

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ message: 'Currency Converter API is running!', status: 'OK' });
});

app.get('/api/convert', (req, res) => {
    const { amount, from, to } = req.query;
    
    if (!amount || !from || !to) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    if (exchangeRates[from] && exchangeRates[from][to]) {
        const rate = exchangeRates[from][to];
        const result = parseFloat(amount) * rate;
        
        res.json({
            success: true,
            result: result,
            rate: rate,
            date: new Date().toISOString()
        });
    } else {
        res.status(400).json({ error: 'Unsupported currency pair' });
    }
});

app.get('/api/historical', (req, res) => {
    const { base, target } = req.query;
    
    // Mock historical data
    const historicalData = {};
    const baseRate = exchangeRates[base] && exchangeRates[base][target] ? exchangeRates[base][target] : 1;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const variation = (Math.random() * 0.04) - 0.02;
        const dailyRate = baseRate * (1 + variation);
        historicalData[dateStr] = { [target]: parseFloat(dailyRate.toFixed(6)) };
    }

    res.json({ success: true, base, target, rates: historicalData });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Access your app`);
});
