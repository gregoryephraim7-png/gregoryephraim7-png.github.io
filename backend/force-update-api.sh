#!/bin/bash

# Find the convert endpoint
LINE=$(grep -n "app.get.*/api/convert" server-with-authz.js | cut -d: -f1)

# Create a completely new file with FreeCurrencyAPI
head -n $((LINE - 1)) server-with-authz.js > server-new-api.js

# Add the FreeCurrencyAPI endpoint
cat >> server-new-api.js << 'NEWCODE'
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

        // USE FreeCurrencyAPI - supports 339 currencies
        const fromLower = from.toLowerCase();
        const toLower = to.toLowerCase();
        
        const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromLower}.json`);
        
        if (!response.ok) {
            throw new Error(`FreeCurrencyAPI error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data[fromLower]) {
            throw new Error(`Currency ${from} not supported`);
        }
        
        if (!data[fromLower][toLower]) {
            throw new Error(`Currency ${to} not available for ${from}`);
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

        if (typeof conversionHistory !== 'undefined') {
            conversionHistory.push(conversionData);
            if (conversionHistory.length > 1000) conversionHistory.shift();
        }

        res.json(conversionData);

    } catch (error) {
        console.error('Conversion error:', error.message);
        res.status(500).json({ 
            error: 'Conversion failed',
            details: error.message
        });
    }
});
NEWCODE

# Find where to continue
TAIL_START=$(grep -n -A 100 "app.get.*/api/convert" server-with-authz.js | grep -E "^[0-9]+-app\." | head -1 | cut -d- -f1)
if [ -n "$TAIL_START" ]; then
    tail -n +$TAIL_START server-with-authz.js >> server-new-api.js
else
    echo "// Server startup" >> server-new-api.js
    echo "const PORT = process.env.PORT || 10000;" >> server-new-api.js
    echo "app.listen(PORT, () => console.log(\`Server on port \${PORT}\`));" >> server-new-api.js
fi

cp server-new-api.js server-with-authz.js
echo "✅ FORCED update to FreeCurrencyAPI!"
