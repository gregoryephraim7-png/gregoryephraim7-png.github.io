const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware - Allow CORS for all origins since frontend might be anywhere
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false
}));

app.use(express.json());
app.use(express.static('.'));

// ... (keep the rest of your server code the same)

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
