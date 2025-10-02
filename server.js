const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve all static files from current directory

let exchangeRates = {};
let lastUpdated = null;

// ... (keep all your existing currency mapping and conversion logic here)

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Currency Converter API',
        lastUpdated: lastUpdated
    });
});

// Serve the main page for ALL routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Currency Converter running on port ${PORT}`);
    console.log(`🌍 Frontend served from backend`);
    console.log(`📊 Access at: https://currency-converter-api-egqi.onrender.com`);
});
