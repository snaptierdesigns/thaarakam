async function testImgbbKey() {
  try {
    console.log('Testing ImgBB upload with your key...');
    
    // 1x1 black pixel JPEG base64 data
    const base64Data = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    
    const imgbbForm = new FormData();
    imgbbForm.append('image', base64Data);

    const response = await fetch('https://api.imgbb.com/1/upload?key=d3905eac5d51cfab6cde5c943670d3e0', {
      method: 'POST',
      body: imgbbForm,
    });

    console.log('ImgBB Status:', response.status);
    const json = await response.json();
    console.log('ImgBB Success:', json.success);
    if (json.success) {
      console.log('ImgBB URL:', json.data.url);
    } else {
      console.log('ImgBB Error Details:', json);
    }
  } catch (err) {
    console.error('ImgBB test failed with exception:', err);
  }
}

testImgbbKey();
