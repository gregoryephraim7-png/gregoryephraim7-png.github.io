#!/bin/bash

echo "🚀 Deploying Currency Converter Updates..."
echo "==========================================="

# Make scripts executable
chmod +x create-updated-currency-converter.sh

# Run the creation script
./create-updated-currency-converter.sh

echo ""
echo "✅ All files created successfully!"
echo ""
echo "📁 Files created:"
echo "   - currency-mapping.js"
echo "   - dashboard-with-country-names.html" 
echo "   - server-with-country-names.js"
echo "   - deploy-updates.sh"
echo ""
echo "🎯 Next steps:"
echo "   1. Update your Render backend with server-with-country-names.js"
echo "   2. Replace your frontend dashboard with dashboard-with-country-names.html"
echo "   3. Upload currency-mapping.js to your frontend"
echo "   4. Test the currency dropdowns to see country names"
echo ""
echo "🌍 Your currency converter now shows: 'Nigeria (NGN)' instead of just 'NGN'!"
