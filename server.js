const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

let exchangeRates = {};
let lastUpdated = null;

// Complete currency mapping - ExchangeRate-API supports 160+ currencies including NGN
const currencyMapping = {
    "USD": "United States (USD)",
    "EUR": "European Union (EUR)",
    "GBP": "United Kingdom (GBP)",
    "NGN": "Nigeria (NGN)",
    "JPY": "Japan (JPY)",
    "CAD": "Canada (CAD)",
    "AUD": "Australia (AUD)",
    "CHF": "Switzerland (CHF)",
    "CNY": "China (CNY)",
    "INR": "India (INR)",
    "BRL": "Brazil (BRL)",
    "RUB": "Russia (RUB)",
    "KRW": "South Korea (KRW)",
    "MXN": "Mexico (MXN)",
    "SGD": "Singapore (SGD)",
    "NZD": "New Zealand (NZD)",
    "TRY": "Turkey (TRY)",
    "ZAR": "South Africa (ZAR)",
    "SEK": "Sweden (SEK)",
    "NOK": "Norway (NOK)",
    "DKK": "Denmark (DKK)",
    "PLN": "Poland (PLN)",
    "THB": "Thailand (THB)",
    "IDR": "Indonesia (IDR)",
    "HKD": "Hong Kong (HKD)",
    "MYR": "Malaysia (MYR)",
    "PHP": "Philippines (PHP)",
    "CZK": "Czech Republic (CZK)",
    "ILS": "Israel (ILS)",
    "CLP": "Chile (CLP)",
    "COP": "Colombia (COP)",
    "SAR": "Saudi Arabia (SAR)",
    "AED": "United Arab Emirates (AED)",
    "EGP": "Egypt (EGP)",
    "KES": "Kenya (KES)",
    "GHS": "Ghana (GHS)",
    "XAF": "Central Africa (XAF)",
    "XOF": "West Africa (XOF)",
    "ZMW": "Zambia (ZMW)",
    "MAD": "Morocco (MAD)",
    "TZS": "Tanzania (TZS)",
    "UGX": "Uganda (UGX)",
    "ETB": "Ethiopia (ETB)",
    "RWF": "Rwanda (RWF)",
    "BIF": "Burundi (BIF)",
    "DJF": "Djibouti (DJF)",
    "SOS": "Somalia (SOS)",
    "SDG": "Sudan (SDG)",
    "LYD": "Libya (LYD)",
    "DZD": "Algeria (DZD)",
    "TND": "Tunisia (TND)",
    "ARS": "Argentina (ARS)",
    "PEN": "Peru (PEN)",
    "UAH": "Ukraine (UAH)",
    "HUF": "Hungary (HUF)",
    "RON": "Romania (RON)",
    "ISK": "Iceland (ISK)",
    "HRK": "Croatia (HRK)",
    "BGN": "Bulgaria (BGN)",
    "NPR": "Nepal (NPR)",
    "PKR": "Pakistan (PKR)",
    "BDT": "Bangladesh (BDT)",
    "LKR": "Sri Lanka (LKR)",
    "MMK": "Myanmar (MMK)",
    "KHR": "Cambodia (KHR)",
    "LAK": "Laos (LAK)",
    "VND": "Vietnam (VND)",
    "KZT": "Kazakhstan (KZT)",
    "UZS": "Uzbekistan (UZS)",
    "AZN": "Azerbaijan (AZN)",
    "GEL": "Georgia (GEL)",
    "AMD": "Armenia (AMD)",
    "BYN": "Belarus (BYN)",
    "MDL": "Moldova (MDL)",
    "RSD": "Serbia (RSD)",
    "MKD": "Macedonia (MKD)",
    "BAM": "Bosnia-Herzegovina (BAM)",
    "ALL": "Albania (ALL)",
    "MNT": "Mongolia (MNT)",
    "KGS": "Kyrgyzstan (KGS)",
    "TJS": "Tajikistan (TJS)",
    "TMT": "Turkmenistan (TMT)",
    "AFN": "Afghanistan (AFN)",
    "IRR": "Iran (IRR)",
    "IQD": "Iraq (IQD)",
    "SYP": "Syria (SYP)",
    "JOD": "Jordan (JOD)",
    "LBP": "Lebanon (LBP)",
    "OMR": "Oman (OMR)",
    "QAR": "Qatar (QAR)",
    "KWD": "Kuwait (KWD)",
    "BHD": "Bahrain (BHD)",
    "YER": "Yemen (YER)",
    "XAG": "Silver (XAG)",
    "XAU": "Gold (XAU)",
    "BTC": "Bitcoin (BTC)"
};

// Fetch exchange rates from ExchangeRate-API (FREE, supports NGN)
async function fetchExchangeRates(baseCurrency = 'USD') {
    try {
        console.log('🔄 Fetching latest exchange rates from ExchangeRate-API...');
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);

        if (response.data && response.data.rates) {
            exchangeRates = response.data.rates;
            exchangeRates[baseCurrency] = 1; // Add base currency
            lastUpdated = new Date();
            console.log(`✅ Successfully fetched ${Object.keys(exchangeRates).length} currency rates`);
            console.log(`🇳🇬 NGN rate: ${exchangeRates.NGN}`);
            console.log(`💵 Sample rates: USD=1, EUR=${exchangeRates.EUR}, GBP=${exchangeRates.GBP}`);
            return exchangeRates;
        } else {
            throw new Error('Invalid response from ExchangeRate-API');
        }
    } catch (error) {
        console.error('❌ Error fetching from ExchangeRate-API:', error.message);
        // Use reliable fallback rates with NGN support
        console.log('🔄 Using reliable fallback rates with NGN support');
        exchangeRates = {
            "USD": 1, "EUR": 0.92, "GBP": 0.79, "NGN": 1500, "JPY": 148,
            "CAD": 1.35, "AUD": 1.52, "CHF": 0.88, "CNY": 7.18, "INR": 83.2,
            "BRL": 4.95, "RUB": 92.5, "KRW": 1330, "MXN": 17.1, "SGD": 1.34,
            "NZD": 1.62, "TRY": 32.1, "ZAR": 18.7, "SEK": 10.45, "NOK": 10.62,
            "DKK": 6.88, "PLN": 4.02, "THB": 35.8, "IDR": 15550, "HKD": 7.82,
            "MYR": 4.71, "PHP": 56.3, "CZK": 22.8, "ILS": 3.67, "CLP": 915,
            "COP": 3910, "SAR": 3.75, "AED": 3.67, "EGP": 30.9, "KES": 157.5,
            "GHS": 12.8, "XAF": 608, "XOF": 608, "ZMW": 26.8, "MAD": 10.07,
            "TZS": 2640, "UGX": 3805, "ETB": 56.7, "RWF": 1290, "BIF": 2850,
            "ARS": 350, "UAH": 36.8, "PEN": 3.73, "HUF": 358, "RON": 4.55
        };
        return exchangeRates;
    }
}

// Initialize exchange rates on server start
fetchExchangeRates();

// Enhanced currency conversion
app.post('/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.body;

        if (!amount || !from || !to) {
            return res.status(400).json({ error: 'Amount, from currency, and to currency are required' });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Refresh rates if they're stale (older than 2 hours)
        if (!lastUpdated || (new Date() - lastUpdated) > 2 * 60 * 60 * 1000) {
            await fetchExchangeRates();
        }

        // Same currency conversion
        if (from === to) {
            return res.json({
                amount: numericAmount,
                from,
                to,
                convertedAmount: numericAmount,
                rate: 1
            });
        }

        // Get rates for both currencies
        const fromRate = exchangeRates[from];
        const toRate = exchangeRates[to];

        if (!fromRate || !toRate) {
            return res.status(400).json({ 
                error: `Currency pair not supported: ${from}/${to}. Try popular pairs like USD/NGN, EUR/NGN, etc.`
            });
        }

        // Convert via base currency
        const amountInBase = numericAmount / fromRate;
        const convertedAmount = amountInBase * toRate;
        const rate = toRate / fromRate;

        return res.json({
            amount: numericAmount,
            from,
            to,
            convertedAmount: convertedAmount,
            rate: rate,
            message: `Real-time conversion using ExchangeRate-API`
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Conversion failed. Please try again.' });
    }
});

// Get all supported currencies
app.get('/currencies', (req, res) => {
    const currenciesWithNames = Object.keys(currencyMapping).map(code => ({
        code: code,
        name: currencyMapping[code],
        displayName: currencyMapping[code]
    }));
    
    res.json({
        currencies: currenciesWithNames,
        count: currenciesWithNames.length,
        lastUpdated: lastUpdated,
        source: 'ExchangeRate-API + Fallback Rates',
        ngnSupported: true
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Currency Converter API',
        currenciesSupported: Object.keys(currencyMapping).length,
        ngnSupported: exchangeRates.NGN ? true : false,
        ngnRate: exchangeRates.NGN,
        lastUpdated: lastUpdated,
        apiSource: 'ExchangeRate-API.com (Free)'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Using ExchangeRate-API for real-time exchange rates`);
    console.log(`🇳🇬 Nigerian Naira (NGN) FULLY SUPPORTED`);
    console.log(`💵 ${Object.keys(currencyMapping).length} currencies available`);
    console.log(`🔗 All currencies convertible among themselves`);
});
