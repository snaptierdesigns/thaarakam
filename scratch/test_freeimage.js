async function testFreeImage() {
  try {
    console.log('Testing Freeimage.host upload...');
    
    // 1x1 black pixel JPEG base64 data
    const base64Data = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    
    // Freeimage.host API expects standard urlencoded or form-data POST
    const bodyParams = new URLSearchParams();
    bodyParams.append('key', '6d207e02198a847ba98d0a2341150537');
    bodyParams.append('action', 'upload');
    bodyParams.append('source', base64Data);

    const response = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: bodyParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    console.log('FreeImage Status:', response.status);
    const json = await response.json();
    console.log('FreeImage Success:', json.status_txt);
    if (json.status_code === 200) {
      console.log('FreeImage URL:', json.image.url);
    } else {
      console.log('FreeImage Error Details:', json);
    }
  } catch (err) {
    console.error('FreeImage test failed with exception:', err);
  }
}

testFreeImage();
