const express = require('express');
const app = express();
const PORT = 10000;

app.use(express.json());
app.use(express.static('.'));

// NO AUTHENTICATION - redirect ALL routes to our main page
app.get('*', (req, res) => {
    if (req.path === '/' || req.path === '/index.html') {
        res.sendFile(__dirname + '/open-converter.html');
    } else {
        // Redirect any other path (like /login.html) to the main page
        res.redirect('/');
    }
});

// Conversion endpoint - NO AUTH
app.post('/convert', (req, res) => {
    const { amount, from, to } = req.body;
    
    const rates = {
        "NGN": 1500, "USD": 1, "EUR": 0.85, "GBP": 0.75,
        "KES": 150, "GHS": 12, "ZAR": 18, "JPY": 150
    };
    
    const convertedAmount = amount * (rates[to] / rates[from]);
    const rate = rates[to] / rates[from];
    
    res.json({
        convertedAmount: convertedAmount,
        rate: rate
    });
});

app.listen(PORT, () => {
    console.log('🚀 Server running: http://localhost:10000/');
    console.log('✅ NO AUTHENTICATION - All routes go to main page');
    console.log('❌ /login.html will be redirected to main page');
});
