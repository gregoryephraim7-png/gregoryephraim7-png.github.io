#!/bin/bash
echo "Searching for registration-related files..."
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) \
  -exec grep -l "username\|register\|Registration" {} \; | grep -v node_modules
