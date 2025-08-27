#!/bin/bash

# Get current date in YYYY.MM.DD format
VERSION=$(date +%Y.%m.%d)

# Path to your admin directory
ADMIN_DIR="/Users/fttg/fttg_workspace/admin"

# Find all HTML files and update versions for CSS and JS files
find "$ADMIN_DIR" -name "*.html" -type f | while read -r file; do
    echo "📝 Processing $file..."
    
    # Update CSS and JS links without version
    sed -i '' -E \
        -e 's/(href="[^"]+\.(css|js))"/\1?v='$VERSION'"/g' \
        -e 's/(src="[^"]+\.js)"/\1?v='$VERSION'"/g' \
        "$file"
        
    # Don't modify CDN links
    sed -i '' -E \
        -e 's/(cdn[^"]+\.(?:css|js))\?v='$VERSION'"/\1"/g' \
        "$file"
    
    echo "✅ Updated versions in $file"
done

echo "🎉 Version update complete!"