app.get('/api/convert', async (req, res) => {
    const { from, to, amount } = req.query;
    
    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters: from, to, amount' });
    }

    try {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        // Use FreeCurrencyAPI (completely free, supports 339 currencies including NGN)
        const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.toLowerCase()}.json`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        const fromKey = from.toLowerCase();
        const toKey = to.toLowerCase();
        
        if (!data[fromKey] || !data[fromKey][toKey]) {
            return res.status(400).json({ error: `Currency pair ${from}-${to} not supported` });
        }

        const rate = data[fromKey][toKey];
        const convertedAmount = numericAmount * rate;

        // Log conversion activity
        if (req.user && req.user.userId) {
            logActivity(req.user.userId, 'CURRENCY_CONVERSION', {
                from: from.toUpperCase(),
                to: to.toUpperCase(), 
                amount: numericAmount, 
                convertedAmount: convertedAmount.toFixed(4),
                rate: rate.toFixed(6)
            });
        }

        const conversionData = {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            amount: numericAmount,
            rate: parseFloat(rate.toFixed(6)),
            result: parseFloat(convertedAmount.toFixed(4)),
            timestamp: new Date().toISOString(),
            lastUpdated: data.date,
            apiSource: 'FreeCurrencyAPI.com'
        };

        conversionHistory.push(conversionData);
        if (conversionHistory.length > 1000) conversionHistory.shift();

        res.json(conversionData);

    } catch (error) {
        console.error('Currency conversion error:', error);
        res.status(500).json({ 
            error: 'Currency conversion service unavailable',
            details: error.message 
        });
    }
});
