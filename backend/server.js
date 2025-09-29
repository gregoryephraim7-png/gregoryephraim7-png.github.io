const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Currency Converter API is running!',
        timestamp: new Date().toISOString()
    });
});

// Comprehensive currency support with multiple fallbacks
const comprehensiveRates = {
    // Major currencies (accurate rates)
    'USD': { 
        'EUR': 0.92, 'GBP': 0.79, 'JPY': 148.50, 'CAD': 1.36, 'AUD': 1.52, 
        'CHF': 0.90, 'CNY': 7.25, 'NGN': 1500, 'GHS': 12.8, 'KES': 157, 
        'ZAR': 18.9, 'INR': 83.2, 'BRL': 5.05, 'MXN': 17.2, 'SGD': 1.35,
        'HKD': 7.82, 'NZD': 1.66, 'SEK': 10.65, 'NOK': 10.85, 'DKK': 6.92,
        'PLN': 4.02, 'TRY': 32.8, 'RUB': 92.5, 'KRW': 1330, 'AED': 3.67,
        'SAR': 3.75, 'THB': 36.1, 'MYR': 4.74, 'IDR': 15600, 'PHP': 56.8,
        'VND': 24750, 'PKR': 278, 'BDT': 109.5, 'EGP': 30.9, 'MAD': 10.05
    },
    'EUR': {
        'USD': 1.09, 'GBP': 0.86, 'JPY': 161.5, 'CAD': 1.48, 'AUD': 1.65,
        'CHF': 0.98, 'CNY': 7.88, 'NGN': 1635, 'GHS': 13.9, 'KES': 171,
        'ZAR': 20.6, 'INR': 90.5, 'BRL': 5.50, 'MXN': 18.7, 'SGD': 1.47
    },
    'GBP': {
        'USD': 1.27, 'EUR': 1.16, 'JPY': 187.5, 'CAD': 1.72, 'AUD': 1.92,
        'CHF': 1.14, 'CNY': 9.15, 'NGN': 1900, 'GHS': 16.2, 'KES': 199,
        'ZAR': 23.9, 'INR': 105.2, 'BRL': 6.39, 'MXN': 21.7, 'SGD': 1.71
    },
    // African currencies
    'NGN': {
        'USD': 0.00067, 'EUR': 0.00061, 'GBP': 0.00053, 'GHS': 0.0085,
        'KES': 0.105, 'ZAR': 0.0126, 'CAD': 0.00091, 'AUD': 0.00101
    },
    'GHS': {
        'USD': 0.078, 'EUR': 0.072, 'GBP': 0.062, 'NGN': 117.6,
        'KES': 12.3, 'ZAR': 1.48, 'CAD': 0.106, 'AUD': 0.119
    },
    'KES': {
        'USD': 0.00637, 'EUR': 0.00585, 'GBP': 0.00503, 'NGN': 9.52,
        'GHS': 0.081, 'ZAR': 0.120, 'CAD': 0.00866, 'AUD': 0.00968
    },
    'ZAR': {
        'USD': 0.053, 'EUR': 0.0485, 'GBP': 0.0418, 'NGN': 79.4,
        'GHS': 0.676, 'KES': 8.33, 'CAD': 0.072, 'AUD': 0.080
    },
    // Asian currencies
    'JPY': {
        'USD': 0.00673, 'EUR': 0.00619, 'GBP': 0.00533, 'CNY': 0.0488,
        'KRW': 8.96, 'SGD': 0.00908, 'INR': 0.560, 'AUD': 0.0102
    },
    'CNY': {
        'USD': 0.138, 'EUR': 0.127, 'GBP': 0.109, 'JPY': 20.5,
        'KRW': 183.4, 'SGD': 0.186, 'INR': 11.48, 'AUD': 0.210
    },
    'INR': {
        'USD': 0.0120, 'EUR': 0.0110, 'GBP': 0.0095, 'JPY': 1.79,
        'CNY': 0.087, 'SGD': 0.0162, 'PKR': 3.34, 'BDT': 1.32
    },
    // Middle East
    'AED': { 'USD': 0.272, 'EUR': 0.250, 'GBP': 0.215, 'SAR': 1.02 },
    'SAR': { 'USD': 0.267, 'EUR': 0.245, 'GBP': 0.211, 'AED': 0.98 },
    // Add more currencies as needed...
};

// Get supported currencies
app.get('/api/currencies', (req, res) => {
    const currencies = {
        'USD': 'US Dollar',
        'EUR': 'Euro', 
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'CAD': 'Canadian Dollar',
        'AUD': 'Australian Dollar',
        'CHF': 'Swiss Franc',
        'CNY': 'Chinese Yuan',
        'NGN': 'Nigerian Naira',
        'GHS': 'Ghanaian Cedi',
        'KES': 'Kenyan Shilling',
        'ZAR': 'South African Rand',
        'INR': 'Indian Rupee',
        'BRL': 'Brazilian Real',
        'MXN': 'Mexican Peso',
        'SGD': 'Singapore Dollar',
        'HKD': 'Hong Kong Dollar',
        'NZD': 'New Zealand Dollar',
        'SEK': 'Swedish Krona',
        'NOK': 'Norwegian Krone',
        'DKK': 'Danish Krone',
        'PLN': 'Polish Zloty',
        'TRY': 'Turkish Lira',
        'RUB': 'Russian Ruble',
        'KRW': 'South Korean Won',
        'AED': 'UAE Dirham',
        'SAR': 'Saudi Riyal',
        'THB': 'Thai Baht',
        'MYR': 'Malaysian Ringgit',
        'IDR': 'Indonesian Rupiah',
        'PHP': 'Philippine Peso',
        'VND': 'Vietnamese Dong',
        'PKR': 'Pakistani Rupee',
        'BDT': 'Bangladeshi Taka',
        'EGP': 'Egyptian Pound',
        'MAD': 'Moroccan Dirham'
    };
    res.json({ success: true, currencies });
});

// Enhanced convert endpoint with multiple fallbacks
app.get('/api/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.query;
        
        console.log(`Converting: ${amount} ${from} to ${to}`);
        
        if (!amount || !from || !to) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Try comprehensive rates first (our database)
        if (comprehensiveRates[from] && comprehensiveRates[from][to]) {
            const rate = comprehensiveRates[from][to];
            const result = numAmount * rate;
            
            return res.json({
                success: true,
                result: parseFloat(result.toFixed(4)),
                rate: rate,
                date: new Date().toISOString(),
                query: { amount: numAmount, from, to },
                source: 'comprehensive-database'
            });
        }

        // Try Frankfurter API for major currencies
        try {
            const response = await axios.get(
                `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
                { timeout: 5000 }
            );

            if (response.data.rates && response.data.rates[to]) {
                const rate = response.data.rates[to];
                const result = numAmount * rate;
                
                return res.json({
                    success: true,
                    result: parseFloat(result.toFixed(4)),
                    rate: rate,
                    date: response.data.date,
                    query: { amount: numAmount, from, to },
                    source: 'frankfurter-api'
                });
            }
        } catch (apiError) {
            console.log('Frankfurter API failed, trying fallback...');
        }

        // Final fallback: Calculate via USD if possible
        if (comprehensiveRates[from] && comprehensiveRates[from]['USD'] && 
            comprehensiveRates['USD'] && comprehensiveRates['USD'][to]) {
            
            const toUSD = comprehensiveRates[from]['USD'];
            const fromUSD = comprehensiveRates['USD'][to];
            const rate = toUSD * fromUSD;
            const result = numAmount * rate;
            
            return res.json({
                success: true,
                result: parseFloat(result.toFixed(4)),
                rate: rate,
                date: new Date().toISOString(),
                query: { amount: numAmount, from, to },
                source: 'usd-calculated-fallback'
            });
        }

        // If all else fails
        res.status(400).json({ 
            error: `Cannot convert ${from} to ${to}`,
            message: 'Currency pair not supported',
            supportedPairs: Object.keys(comprehensiveRates)
        });
        
    } catch (error) {
        console.error('Conversion error:', error.message);
        res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
});

// Historical data with comprehensive support
app.get('/api/historical', async (req, res) => {
    try {
        const { base, target } = req.query;
        
        if (!base || !target) {
            return res.status(400).json({ error: 'Base and target currencies required' });
        }

        // Generate realistic historical data
        const historicalData = {};
        const baseRate = comprehensiveRates[base] && comprehensiveRates[base][target] 
            ? comprehensiveRates[base][target] 
            : 1;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Add small random variation to simulate real market movements
            const variation = (Math.random() * 0.04) - 0.02; // ±2%
            const dailyRate = baseRate * (1 + variation);
            
            historicalData[dateStr] = { [target]: parseFloat(dailyRate.toFixed(6)) };
        }

        res.json({ 
            success: true, 
            base, 
            target, 
            rates: historicalData,
            source: 'simulated-historical'
        });
    } catch (error) {
        res.status(500).json({ error: 'Historical data unavailable' });
    }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Enhanced Backend running on http://localhost:${PORT}`);
    console.log(`✅ Supports ${Object.keys(comprehensiveRates).length} base currencies`);
    console.log(`🌍 Comprehensive currency coverage`);
});

// Comprehensive offline rates database
const comprehensiveOfflineRates = {
    'USD': { 'EUR': 0.92, 'GBP': 0.79, 'JPY': 148.5, 'NGN': 1500, 'CAD': 1.36, 'AUD': 1.52, 'CHF': 0.90, 'CNY': 7.25, 'GHS': 12.8, 'KES': 157, 'ZAR': 18.9 },
    'EUR': { 'USD': 1.09, 'GBP': 0.86, 'JPY': 161.5, 'NGN': 1635, 'CAD': 1.48, 'AUD': 1.65, 'CHF': 0.98, 'CNY': 7.88, 'GHS': 13.9, 'KES': 171, 'ZAR': 20.6 },
    'GBP': { 'USD': 1.27, 'EUR': 1.16, 'JPY': 187.5, 'NGN': 1900, 'CAD': 1.72, 'AUD': 1.92, 'CHF': 1.14, 'CNY': 9.15, 'GHS': 16.2, 'KES': 199, 'ZAR': 23.9 },
    'NGN': { 'USD': 0.00067, 'EUR': 0.00061, 'GBP': 0.00053, 'GHS': 0.0085, 'KES': 0.105, 'ZAR': 0.0126 },
    'GHS': { 'USD': 0.078, 'EUR': 0.072, 'GBP': 0.062, 'NGN': 117.6, 'KES': 12.3, 'ZAR': 1.48 },
    'KES': { 'USD': 0.00637, 'EUR': 0.00585, 'GBP': 0.00503, 'NGN': 9.52, 'GHS': 0.081, 'ZAR': 0.120 },
    'JPY': { 'USD': 0.00673, 'EUR': 0.00619, 'GBP': 0.00533, 'CNY': 0.0488, 'KRW': 8.96 }
};

// Add this endpoint for offline data
app.get('/api/offline-rates', (req, res) => {
    res.json({
        success: true,
        rates: comprehensiveOfflineRates,
        timestamp: new Date().toISOString(),
        message: 'Use these rates when offline'
    });
});
