const express = require("express");
const path = require("path");

const app = express();

// serve static files
app.use(express.static(path.join(__dirname, ".")));

// route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// listen on port 3001
app.listen(3001, () => {
  console.log("Frontend running on port 3001");
});

// Add to script section
function setupOfflineSupport() {
    // Cache important rates locally
    const cachedRates = JSON.parse(localStorage.getItem('cachedRates') || '{}');
    
    // Basic offline conversion using cached rates
    window.convertOffline = function(amount, from, to) {
        const rateKey = `${from}_${to}`;
        if (cachedRates[rateKey] && Date.now() - cachedRates[rateKey].timestamp < 24 * 60 * 60 * 1000) {
            const result = amount * cachedRates[rateKey].rate;
            showResult(
                `${amount} ${from} = <strong>${result.toFixed(2)} ${to}</strong><br>
                <small>📱 Using cached rate (offline)</small>`
            );
            return true;
        }
        return false;
    };
    
    // Update cache on successful online conversions
    window.updateRateCache = function(from, to, rate) {
        const cachedRates = JSON.parse(localStorage.getItem('cachedRates') || '{}');
        cachedRates[`${from}_${to}`] = { rate, timestamp: Date.now() };
        localStorage.setItem('cachedRates', JSON.stringify(cachedRates));
    };
}

// Modify convertCurrency function
async function convertCurrency() {
    // ... existing code ...
    
    // Try offline first
    if (!navigator.onLine) {
        if (convertOffline(amount, from, to)) {
            return;
        } else {
            showResult('You are offline and no cached rate is available', true);
            return;
        }
    }
    
    // Online conversion
    try {
        const response = await fetch(/* ... */);
        const data = await response.json();
        
        if (data.success) {
            // Update cache
            updateRateCache(from, to, data.rate);
            // ... show result
        }
    } catch (error) {
        // Fallback to offline if online fails
        if (convertOffline(amount, from, to)) {
            return;
        }
        showResult('Network error: ' + error.message, true);
    }
}
