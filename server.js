const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let exchangeRates = {};
let lastUpdated = null;

// Currency mapping
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
    "ARS": "Argentina (ARS)",
    "UAH": "Ukraine (UAH)",
    "PEN": "Peru (PEN)",
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

// Fetch exchange rates
async function fetchExchangeRates() {
    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.data && response.data.rates) {
            exchangeRates = response.data.rates;
            exchangeRates.USD = 1;
            lastUpdated = new Date();
            return exchangeRates;
        }
    } catch (error) {
        // Fallback rates
        exchangeRates = {
            "USD": 1, "EUR": 0.92, "GBP": 0.79, "NGN": 1500, "JPY": 148,
            "CAD": 1.35, "AUD": 1.52, "CHF": 0.88, "CNY": 7.18, "INR": 83.2,
            "BRL": 4.95, "RUB": 92.5, "KRW": 1330, "MXN": 17.1, "SGD": 1.34,
            "NZD": 1.62, "TRY": 32.1, "ZAR": 18.7, "SEK": 10.45, "NOK": 10.62
        };
        return exchangeRates;
    }
}

// Initialize rates
fetchExchangeRates();

// Conversion endpoint
app.post('/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.body;
        const numericAmount = parseFloat(amount);

        if (!lastUpdated) await fetchExchangeRates();

        if (from === to) {
            return res.json({ convertedAmount: numericAmount, rate: 1 });
        }

        const fromRate = exchangeRates[from];
        const toRate = exchangeRates[to];

        if (!fromRate || !toRate) {
            return res.status(400).json({ error: 'Currency not supported' });
        }

        const convertedAmount = (numericAmount / fromRate) * toRate;
        const rate = toRate / fromRate;

        res.json({ convertedAmount, rate });
    } catch (error) {
        res.status(500).json({ error: 'Conversion failed' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Serve frontend for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
