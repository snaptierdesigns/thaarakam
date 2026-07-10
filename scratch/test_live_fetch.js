const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve) => {
    console.log(`Fetching ${url}...`);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Status code: ${res.statusCode}`);
        resolve({ status: res.statusCode, html: data });
      });
    }).on('error', (err) => {
      console.log(`Error fetching ${url}: ${err.message}`);
      resolve({ status: 500, error: err.message });
    });
  });
}

async function run() {
  const domains = [
    'https://www.thaarakam.in/shop',
    'https://thaarakam.in/shop',
  ];

  for (const url of domains) {
    const res = await fetchUrl(url);
    if (res.status === 200 && res.html) {
      console.log(`Success fetching ${url}! Length: ${res.html.length} chars.`);
      
      // Let's search if the HTML contains product titles or data
      if (res.html.includes('Tulip') || res.html.includes('Neck') || res.html.includes('Anklet')) {
        console.log('Found product keywords in the live page HTML!');
        fs.writeFileSync('c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\live_shop_cache.html', res.html);
        console.log('Saved live HTML to scratch/live_shop_cache.html');
      }
    }
  }
}

run();
