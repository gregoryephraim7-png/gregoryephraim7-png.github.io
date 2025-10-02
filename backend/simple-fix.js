// Simple fix for FreeCurrencyAPI - use lowercase for API calls
app.get('/api/convert', async (req, res) => {
    const { from, to, amount } = req.query;
    
    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        // Use lowercase for API call
        const fromLower = from.toLowerCase();
        const toLower = to.toLowerCase();
        
        const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromLower}.json`);
        
        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        
        if (!data[fromLower] || !data[fromLower][toLower]) {
            return res.status(400).json({ error: 'Currency pair not supported' });
        }

        const rate = data[fromLower][toLower];
        const result = numericAmount * rate;

        const conversionData = {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            amount: numericAmount,
            rate: parseFloat(rate.toFixed(6)),
            result: parseFloat(result.toFixed(4)),
            timestamp: new Date().toISOString(),
            apiSource: 'FreeCurrencyAPI.com'
        };

        conversionHistory.push(conversionData);
        if (conversionHistory.length > 1000) conversionHistory.shift();

        res.json(conversionData);

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Conversion failed' });
    }
});
