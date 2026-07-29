async function testFetchIndiaPost(consignment) {
  console.log('Testing India Post query for:', consignment);

  // Try postal tracking APIs or direct India Post query endpoints
  const urls = [
    `https://api.postalpincode.in/pincode/682001`,
    `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`URL: ${url} -> Status: ${res.status}`);
    } catch (e) {
      console.error(`URL: ${url} Error:`, e.message);
    }
  }
}

testFetchIndiaPost('EL736425200IN');
