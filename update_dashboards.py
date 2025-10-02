import re

# Read the currency options
with open('all_currencies.txt', 'r') as f:
    currency_options = f.read()

# Function to update dropdown
def update_dropdown(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Replace from-currency dropdown
    from_pattern = r'<select id="from-currency">.*?</select>'
    from_replacement = f'<select id="from-currency">\n{currency_options}\n                            </select>'
    content = re.sub(from_pattern, from_replacement, content, flags=re.DOTALL)
    
    # Replace to-currency dropdown
    to_pattern = r'<select id="to-currency">.*?</select>'
    to_replacement = f'<select id="to-currency">\n{currency_options}\n                            </select>'
    content = re.sub(to_pattern, to_replacement, content, flags=re.DOTALL)
    
    # Write back
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✅ Updated {file_path}")

# Update both files
update_dropdown('dashboard-with-339-currencies.html')
update_dropdown('dashboard-local-339-currencies.html')
