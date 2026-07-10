const fs = require('fs');
const path = require('path');

const htmlPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\live_shop_cache.html';

function extractProductsFromHtml() {
  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    console.log(`Analyzing HTML (${html.length} chars)...`);

    // 1. Search for JSON arrays in Next.js data scripts
    // Let's find self.__next_f.push lines or script content
    const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
    let match;
    const allScriptContents = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      allScriptContents.push(match[1]);
    }
    
    console.log(`Found ${allScriptContents.length} script blocks.`);

    // 2. Let's scan for product data patterns
    // The data might be inside a string like: "price", "is_featured", "category"
    // Let's search all scripts for occurrences of products
    let foundRawJson = null;
    allScriptContents.forEach((scriptText, idx) => {
      if (scriptText.includes('name') && scriptText.includes('price') && scriptText.includes('category')) {
        console.log(`Script ${idx} seems to contain product data fields!`);
      }
    });

    // Let's find the products list inside the HTML using a regex on HTML product cards
    // In our shop client, a product card looks like:
    // href="/product/UUID" ... product name ... price
    // Let's search for /product/ followed by UUID and collect them
    const productCardRegex = /href="\/product\/([a-f0-9-]{36})"[^>]*>([\s\S]*?)<\/a>/g;
    const cards = [];
    let cardMatch;
    while ((cardMatch = productCardRegex.exec(html)) !== null) {
      cards.push({
        id: cardMatch[1],
        content: cardMatch[2]
      });
    }

    console.log(`Found ${cards.length} product links in the HTML page!`);
    
    // Let's extract names and prices from the card content
    const products = [];
    cards.forEach(card => {
      // Clean up HTML tags from content to find name and price
      const cleanContent = card.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Look for a price pattern like "369" or "Rs. 369"
      const priceMatch = cleanContent.match(/(\d+)/);
      const price = priceMatch ? parseInt(priceMatch[1]) : 0;
      
      // The product name is usually at the beginning of the card content before the price
      // Let's try to extract the clean name
      console.log(`Link: /product/${card.id} -> ${cleanContent}`);
    });

    // 3. Let's look for the Next.js RSC payload which is a goldmine.
    // Next.js serializes data as: self.__next_f.push([1, "JSON_STRING"])
    // Let's extract all the string literals passed to self.__next_f.push
    const nextFRegex = /self\.__next_f\.push\(\[1,\s*"([\s\S]*?)"\]\)/g;
    let nextFMatch;
    let fullRscText = '';
    while ((nextFMatch = nextFRegex.exec(html)) !== null) {
      // Decode escaped quotes and slashes
      const chunk = nextFMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
      fullRscText += chunk;
    }

    if (fullRscText) {
      console.log(`Successfully merged RSC payload (${fullRscText.length} chars).`);
      fs.writeFileSync('c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\raw_rsc_payload.txt', fullRscText);
      
      // Let's search the RSC text for product JSON records!
      // In Next.js RSC, JSON data is often stored as strings inside arrays
      // Let's look for UUID patterns and extract the adjacent strings
      const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g;
      const uuids = fullRscText.match(uuidRegex) || [];
      console.log(`Found ${uuids.length} UUID references in the RSC payload.`);
      
      // Let's write a parser to extract product JSON blocks from the RSC stream.
      // RSC payload has blocks like: {"id":"UUID","name":"...","price":...}
      // Let's search for any JSON objects starting with product keys
      const jsonObjectRegex = /\{"id":"[a-f0-9-]{36}","name":.*?\}/g;
      const jsonObjects = fullRscText.match(jsonObjectRegex) || [];
      console.log(`Found ${jsonObjects.length} JSON product objects in the RSC stream!`);
      
      if (jsonObjects.length > 0) {
        const parsedProducts = [];
        jsonObjects.forEach(objStr => {
          try {
            // RSC strings might contain double-escaped characters or extra garbage, let's clean it up
            const obj = JSON.parse(objStr);
            if (obj.name && obj.price) {
              parsedProducts.push(obj);
            }
          } catch (e) {
            // Try cleaning up the string
            try {
              // Sometimes it has escaped characters like \", let's fix it
              const cleaned = objStr.replace(/\\/g, '');
              const obj = JSON.parse(cleaned);
              if (obj.name && obj.price) {
                parsedProducts.push(obj);
              }
            } catch (err) {
              // Skip if not clean JSON
            }
          }
        });

        console.log(`Successfully parsed ${parsedProducts.length} clean products from RSC!`);
        if (parsedProducts.length > 0) {
          // Remove duplicates (same ID)
          const uniqueProducts = [];
          const seenIds = new Set();
          parsedProducts.forEach(p => {
            if (!seenIds.has(p.id)) {
              seenIds.add(p.id);
              uniqueProducts.push(p);
            }
          });
          
          console.log(`Found ${uniqueProducts.length} UNIQUE products in the RSC stream.`);
          fs.writeFileSync('c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\rsc_recovered_products.json', JSON.stringify(uniqueProducts, null, 2));
          console.log('Saved to scratch/rsc_recovered_products.json');
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

extractProductsFromHtml();
