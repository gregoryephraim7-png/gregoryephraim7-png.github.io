const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const FREECURRENCYAPI_KEY = process.env.FREECURRENCYAPI_KEY || 'fca_live_1234567890abcdef';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let users = [];
let exchangeRates = {};
let lastUpdated = null;

// Currency mapping for display names
const currencyMapping = {
    "AED": "United Arab Emirates (AED)",
    "AFN": "Afghanistan (AFN)",
    "ALL": "Albania (ALL)",
    "AMD": "Armenia (AMD)",
    "ANG": "Netherlands Antilles (ANG)",
    "AOA": "Angola (AOA)",
    "ARS": "Argentina (ARS)",
    "AUD": "Australia (AUD)",
    "AWG": "Aruba (AWG)",
    "AZN": "Azerbaijan (AZN)",
    "BAM": "Bosnia-Herzegovina (BAM)",
    "BBD": "Barbados (BBD)",
    "BDT": "Bangladesh (BDT)",
    "BGN": "Bulgaria (BGN)",
    "BHD": "Bahrain (BHD)",
    "BIF": "Burundi (BIF)",
    "BMD": "Bermuda (BMD)",
    "BND": "Brunei (BND)",
    "BOB": "Bolivia (BOB)",
    "BRL": "Brazil (BRL)",
    "BSD": "Bahamas (BSD)",
    "BTC": "Bitcoin (BTC)",
    "BTN": "Bhutan (BTN)",
    "BWP": "Botswana (BWP)",
    "BYN": "Belarus (BYN)",
    "BZD": "Belize (BZD)",
    "CAD": "Canada (CAD)",
    "CDF": "Congo (CDF)",
    "CHF": "Switzerland (CHF)",
    "CLF": "Chile (CLF)",
    "CLP": "Chile (CLP)",
    "CNY": "China (CNY)",
    "COP": "Colombia (COP)",
    "CRC": "Costa Rica (CRC)",
    "CUC": "Cuba (CUC)",
    "CUP": "Cuba (CUP)",
    "CVE": "Cape Verde (CVE)",
    "CZK": "Czech Republic (CZK)",
    "DJF": "Djibouti (DJF)",
    "DKK": "Denmark (DKK)",
    "DOP": "Dominican Republic (DOP)",
    "DZD": "Algeria (DZD)",
    "EGP": "Egypt (EGP)",
    "ERN": "Eritrea (ERN)",
    "ETB": "Ethiopia (ETB)",
    "EUR": "European Union (EUR)",
    "FJD": "Fiji (FJD)",
    "FKP": "Falkland Islands (FKP)",
    "GBP": "United Kingdom (GBP)",
    "GEL": "Georgia (GEL)",
    "GGP": "Guernsey (GGP)",
    "GHS": "Ghana (GHS)",
    "GIP": "Gibraltar (GIP)",
    "GMD": "Gambia (GMD)",
    "GNF": "Guinea (GNF)",
    "GTQ": "Guatemala (GTQ)",
    "GYD": "Guyana (GYD)",
    "HKD": "Hong Kong (HKD)",
    "HNL": "Honduras (HNL)",
    "HRK": "Croatia (HRK)",
    "HTG": "Haiti (HTG)",
    "HUF": "Hungary (HUF)",
    "IDR": "Indonesia (IDR)",
    "ILS": "Israel (ILS)",
    "IMP": "Isle of Man (IMP)",
    "INR": "India (INR)",
    "IQD": "Iraq (IQD)",
    "IRR": "Iran (IRR)",
    "ISK": "Iceland (ISK)",
    "JEP": "Jersey (JEP)",
    "JMD": "Jamaica (JMD)",
    "JOD": "Jordan (JOD)",
    "JPY": "Japan (JPY)",
    "KES": "Kenya (KES)",
    "KGS": "Kyrgyzstan (KGS)",
    "KHR": "Cambodia (KHR)",
    "KMF": "Comoros (KMF)",
    "KPW": "North Korea (KPW)",
    "KRW": "South Korea (KRW)",
    "KWD": "Kuwait (KWD)",
    "KYD": "Cayman Islands (KYD)",
    "KZT": "Kazakhstan (KZT)",
    "LAK": "Laos (LAK)",
    "LBP": "Lebanon (LBP)",
    "LKR": "Sri Lanka (LKR)",
    "LRD": "Liberia (LRD)",
    "LSL": "Lesotho (LSL)",
    "LTL": "Lithuania (LTL)",
    "LVL": "Latvia (LVL)",
    "LYD": "Libya (LYD)",
    "MAD": "Morocco (MAD)",
    "MDL": "Moldova (MDL)",
    "MGA": "Madagascar (MGA)",
    "MKD": "Macedonia (MKD)",
    "MMK": "Myanmar (MMK)",
    "MNT": "Mongolia (MNT)",
    "MOP": "Macau (MOP)",
    "MRU": "Mauritania (MRU)",
    "MUR": "Mauritius (MUR)",
    "MVR": "Maldives (MVR)",
    "MWK": "Malawi (MWK)",
    "MXN": "Mexico (MXN)",
    "MYR": "Malaysia (MYR)",
    "MZN": "Mozambique (MZN)",
    "NAD": "Namibia (NAD)",
    "NGN": "Nigeria (NGN)",
    "NIO": "Nicaragua (NIO)",
    "NOK": "Norway (NOK)",
    "NPR": "Nepal (NPR)",
    "NZD": "New Zealand (NZD)",
    "OMR": "Oman (OMR)",
    "PAB": "Panama (PAB)",
    "PEN": "Peru (PEN)",
    "PGK": "Papua New Guinea (PGK)",
    "PHP": "Philippines (PHP)",
    "PKR": "Pakistan (PKR)",
    "PLN": "Poland (PLN)",
    "PYG": "Paraguay (PYG)",
    "QAR": "Qatar (QAR)",
    "RON": "Romania (RON)",
    "RSD": "Serbia (RSD)",
    "RUB": "Russia (RUB)",
    "RWF": "Rwanda (RWF)",
    "SAR": "Saudi Arabia (SAR)",
    "SBD": "Solomon Islands (SBD)",
    "SCR": "Seychelles (SCR)",
    "SDG": "Sudan (SDG)",
    "SEK": "Sweden (SEK)",
    "SGD": "Singapore (SGD)",
    "SHP": "Saint Helena (SHP)",
    "SLL": "Sierra Leone (SLL)",
    "SOS": "Somalia (SOS)",
    "SRD": "Suriname (SRD)",
    "STN": "Sao Tome & Principe (STN)",
    "SVC": "El Salvador (SVC)",
    "SYP": "Syria (SYP)",
    "SZL": "Eswatini (SZL)",
    "THB": "Thailand (THB)",
    "TJS": "Tajikistan (TJS)",
    "TMT": "Turkmenistan (TMT)",
    "TND": "Tunisia (TND)",
    "TOP": "Tonga (TOP)",
    "TRY": "Turkey (TRY)",
    "TTD": "Trinidad & Tobago (TTD)",
    "TWD": "Taiwan (TWD)",
    "TZS": "Tanzania (TZS)",
    "UAH": "Ukraine (UAH)",
    "UGX": "Uganda (UGX)",
    "USD": "United States (USD)",
    "UYU": "Uruguay (UYU)",
    "UZS": "Uzbekistan (UZS)",
    "VEF": "Venezuela (VEF)",
    "VES": "Venezuela (VES)",
    "VND": "Vietnam (VND)",
    "VUV": "Vanuatu (VUV)",
    "WST": "Samoa (WST)",
    "XAF": "Central Africa (XAF)",
    "XAG": "Silver (XAG)",
    "XAU": "Gold (XAU)",
    "XCD": "East Caribbean (XCD)",
    "XDR": "IMF Special Drawing Rights (XDR)",
    "XOF": "West Africa (XOF)",
    "XPF": "CFP Franc (XPF)",
    "YER": "Yemen (YER)",
    "ZAR": "South Africa (ZAR)",
    "ZMW": "Zambia (ZMW)",
    "ZWL": "Zimbabwe (ZWL)"
};

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Admin middleware
function requireAdmin(req, res, next) {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Fetch exchange rates from FreeCurrencyAPI
async function fetchExchangeRates(baseCurrency = 'USD') {
    try {
        const response = await axios.get(`https://api.freecurrencyapi.com/v1/latest`, {
            params: {
                apikey: FREECURRENCYAPI_KEY,
                base_currency: baseCurrency
            }
        });

        if (response.data && response.data.data) {
            exchangeRates = response.data.data;
            lastUpdated = new Date();
            return exchangeRates;
        } else {
            throw new Error('Invalid response from currency API');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        throw new Error('Failed to fetch exchange rates');
    }
}

// Initialize exchange rates
fetchExchangeRates().catch(console.error);

// Routes

// Get all currencies with display names
app.get('/currencies', (req, res) => {
    const currenciesWithNames = Object.keys(currencyMapping).map(code => ({
        code: code,
        name: currencyMapping[code],
        country: currencyMapping[code].split(' (')[0],
        displayName: currencyMapping[code]
    }));
    
    res.json({
        currencies: currenciesWithNames,
        count: currenciesWithNames.length
    });
});

// User registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            isAdmin: users.length === 0, // First user is admin
            createdAt: new Date()
        };

        users.push(user);

        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'User registered successfully',
            token,
            user: { username: user.username, isAdmin: user.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = users.find(u => u.username === username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { username: user.username, isAdmin: user.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Currency conversion
app.post('/convert', authenticateToken, async (req, res) => {
    try {
        const { amount, from, to } = req.body;

        if (!amount || !from || !to) {
            return res.status(400).json({ error: 'Amount, from currency, and to currency are required' });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Refresh rates if they're stale (older than 10 minutes)
        if (!lastUpdated || (new Date() - lastUpdated) > 10 * 60 * 1000) {
            await fetchExchangeRates();
        }

        if (from === to) {
            return res.json({
                amount: numericAmount,
                from,
                to,
                convertedAmount: numericAmount,
                rate: 1
            });
        }

        if (from === 'USD') {
            const rate = exchangeRates[to];
            if (!rate) {
                return res.status(400).json({ error: 'Invalid target currency' });
            }
            return res.json({
                amount: numericAmount,
                from,
                to,
                convertedAmount: numericAmount * rate,
                rate: rate
            });
        } else {
            // Convert via USD
            const fromRate = exchangeRates[from];
            const toRate = exchangeRates[to];

            if (!fromRate || !toRate) {
                return res.status(400).json({ error: 'Invalid currency pair' });
            }

            const amountInUSD = numericAmount / fromRate;
            const convertedAmount = amountInUSD * toRate;
            const rate = toRate / fromRate;

            return res.json({
                amount: numericAmount,
                from,
                to,
                convertedAmount: convertedAmount,
                rate: rate
            });
        }
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Conversion failed' });
    }
});

// Admin routes
app.post('/admin/refresh-rates', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await fetchExchangeRates();
        res.json({ 
            message: 'Exchange rates refreshed successfully',
            lastUpdated: lastUpdated
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to refresh exchange rates' });
    }
});

app.get('/admin/users', authenticateToken, requireAdmin, (req, res) => {
    const usersWithoutPasswords = users.map(user => ({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
    }));
    res.json({ users: usersWithoutPasswords });
});

// Get current rates
app.get('/rates', authenticateToken, (req, res) => {
    res.json({
        rates: exchangeRates,
        lastUpdated: lastUpdated,
        baseCurrency: 'USD'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Currency Converter API',
        currenciesSupported: Object.keys(currencyMapping).length,
        lastUpdated: lastUpdated
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Supported currencies: ${Object.keys(currencyMapping).length}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
