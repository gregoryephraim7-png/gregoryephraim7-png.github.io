import re

# Read the formatted currency options
with open('currencies_formatted.txt', 'r') as f:
    currency_options = f.read().strip()

# Files to update
files = ['dashboard-fixed-339.html', 'dashboard-local-fixed-339.html']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Replace from-currency dropdown (lines 332-337)
    from_old = '''                            <select id="from-currency">
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                            </select>'''
    
    from_new = f'''                            <select id="from-currency">
{currency_options}
                            </select>'''
    
    content = content.replace(from_old, from_new)
    
    # Replace to-currency dropdown (lines 344-349)  
    to_old = '''                            <select id="to-currency">
                                <option value="EUR">EUR - Euro</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                            </select>'''
    
    to_new = f'''                            <select id="to-currency">
{currency_options}
                            </select>'''
    
    content = content.replace(to_old, to_new)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"✅ Fixed {file_path}")

