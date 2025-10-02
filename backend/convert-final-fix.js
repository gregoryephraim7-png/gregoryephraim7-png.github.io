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

        // Use FreeCurrencyAPI - currency codes must be lowercase
        const fromLower = from.toLowerCase();
        const toLower = to.toLowerCase();
        
        console.log(`Converting ${numericAmount} ${from} to ${to} (API: ${fromLower} to ${toLower})`);
        
        const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromLower}.json`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Debug: log available currencies
        const availableCurrencies = Object.keys(data[fromLower] || {});
        console.log(`Found ${len(availableCurrencies)} currencies for ${fromLower}`);
        
        if (!data[fromLower] || !data[fromLower][toLower]) {
            return res.status(400).json({ 
                error: `Currency pair ${from}-${to} not supported`,
                hint: `Make sure both currencies are in the 339 supported currencies`
            });
        }

        const rate = data[fromLower][toLower];
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
