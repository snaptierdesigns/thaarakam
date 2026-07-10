const fs = require('fs');
const path = require('path');

const cacheDir = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\.next\\cache\\fetch-cache';

function parseCacheFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Next.js fetch cache has a binary/JSON metadata header followed by the raw body.
    // Let's find if there is a JSON array or object in the content.
    const jsonStartIdx = content.indexOf('{"status"');
    if (jsonStartIdx !== -1) {
      // Sometimes it's a fetch cache structure: { tag: ..., value: { status: ..., body: ... } }
      // Let's try parsing the whole thing if it's JSON, or extract the JSON portion.
      const rawJson = content.substring(jsonStartIdx);
      try {
        const parsed = JSON.parse(rawJson);
        return parsed;
      } catch (e) {
        // Try finding standard JSON boundaries
        // Let's extract any substring that looks like a JSON array of products or similar
      }
    }

    // Alternative: search for strings like "General Store Review Placeholder" or product fields
    // Let's look for matching curly braces to extract JSON objects
    const matches = content.match(/\{"url":.*?\}/g);
    if (matches) {
      console.log(`Found image URLs or similar structures: ${matches.length}`);
    }
    
    return null;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

// Let's write a comprehensive scanner
function scanCache() {
  const files = fs.readdirSync(cacheDir);
  console.log(`Scanning ${files.length} cache files...`);

  files.forEach(file => {
    const fullPath = path.join(cacheDir, file);
    const stats = fs.statSync(fullPath);
    console.log(`\nFile: ${file} (${(stats.size / 1024).toFixed(1)} KB)`);

    try {
      const buf = fs.readFileSync(fullPath);
      // Next.js cache format:
      // Version: 1 or 2
      // Then some metadata, then the response body.
      // Let's search for JSON markers like "{" or "["
      const text = buf.toString('utf8');
      
      // Let's search for occurrences of product fields like "price", "category", "availability"
      const hasProducts = text.includes('"price"') && text.includes('"availability"');
      const hasSettings = text.includes('"shipping_kerala"') || text.includes('"default_description"');
      
      console.log(`- Contains product fields: ${hasProducts}`);
      console.log(`- Contains settings fields: ${hasSettings}`);

      if (hasProducts) {
        // Let's find the start of the product list array or object
        // Supabase REST returns array of objects: [{"id":...}]
        const startIdx = text.indexOf('[{"id":');
        if (startIdx !== -1) {
          const subText = text.substring(startIdx);
          // Find matching closing bracket
          let brackets = 0;
          let endIdx = -1;
          for (let i = 0; i < subText.length; i++) {
            if (subText[i] === '[') brackets++;
            if (subText[i] === ']') {
              brackets--;
              if (brackets === 0) {
                endIdx = i;
                break;
              }
            }
          }
          if (endIdx !== -1) {
            const jsonStr = subText.substring(0, endIdx + 1);
            try {
              const products = JSON.parse(jsonStr);
              console.log(`SUCCESS! Extracted ${products.length} products!`);
              // Save it!
              const backupPath = 'c:\\Users\\nonam\\OneDrive\Desktop\\thaarakam\\scratch\\recovered_products.json';
              fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
              console.log(`Saved backup to ${backupPath}`);
            } catch (err) {
              console.log('Failed to parse clean products JSON, error:', err.message);
              // Save raw snippet for debugging
              fs.writeFileSync('c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\raw_snippet.txt', subText.substring(0, 5000));
            }
          }
        }
      }

      if (hasSettings) {
        // Settings table has columns like logo_url, banner_url, etc.
        const startIdx = text.indexOf('{"id":1,');
        if (startIdx !== -1) {
          const subText = text.substring(startIdx);
          // Find matching closing brace
          let braces = 0;
          let endIdx = -1;
          for (let i = 0; i < subText.length; i++) {
            if (subText[i] === '{') braces++;
            if (subText[i] === '}') {
              braces--;
              if (braces === 0) {
                endIdx = i;
                break;
              }
            }
          }
          if (endIdx !== -1) {
            const jsonStr = subText.substring(0, endIdx + 1);
            try {
              const settings = JSON.parse(jsonStr);
              console.log(`SUCCESS! Extracted settings:`, settings);
              const backupPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_settings.json';
              fs.writeFileSync(backupPath, JSON.stringify(settings, null, 2));
              console.log(`Saved settings to ${backupPath}`);
            } catch (err) {
              console.log('Failed to parse settings JSON:', err.message);
            }
          }
        }
      }
    } catch (e) {
      console.log(`Failed to inspect file: ${e.message}`);
    }
  });
}

scanCache();
