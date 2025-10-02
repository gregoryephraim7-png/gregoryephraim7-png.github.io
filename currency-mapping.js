// Currency code to country/currency name mapping
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

// Function to get display name for currency code
function getCurrencyDisplayName(currencyCode) {
    return currencyMapping[currencyCode] || currencyCode;
}

// Function to populate dropdown with formatted names
function populateCurrencyDropdowns() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    if (fromCurrency && toCurrency) {
        // Clear existing options
        fromCurrency.innerHTML = '';
        toCurrency.innerHTML = '';
        
        // Add options with formatted names
        Object.keys(currencyMapping).forEach(currencyCode => {
            const displayName = currencyMapping[currencyCode];
            
            // Add to "from" dropdown
            const fromOption = document.createElement('option');
            fromOption.value = currencyCode;
            fromOption.textContent = displayName;
            fromCurrency.appendChild(fromOption);
            
            // Add to "to" dropdown
            const toOption = document.createElement('option');
            toOption.value = currencyCode;
            toOption.textContent = displayName;
            toCurrency.appendChild(toOption);
        });
        
        // Set default values
        fromCurrency.value = 'USD';
        toCurrency.value = 'NGN';
    }
}
