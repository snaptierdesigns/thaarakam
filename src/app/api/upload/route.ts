import { NextResponse } from 'next/server';

// Image upload API route handler supporting Catbox.moe (Primary, 100% Free, Keyless) and ImgBB / Local Base64 fallbacks
export async function POST(request: Request) {
  try {
    const { fileData, fileName: rawFileName, fileType } = await request.json();
    
    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    let fileName = rawFileName || 'image.jpg';
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      fileName = 'image.jpg';
    }

    const buffer = Buffer.from(fileData, 'base64');
    const blobObject = new Blob([buffer], { type: fileType || 'image/jpeg' });

    console.log(`Processing upload for ${fileName} (${buffer.length} bytes)...`);

    // METHOD 1: Catbox.moe (100% Free, Keyless, Permanent HTTPS CDN)
    try {
      console.log('Attempting upload to Catbox.moe...');
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('fileToUpload', blobObject, fileName);

      const catboxResponse = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: catboxForm,
      });

      if (catboxResponse.ok) {
        const catboxUrl = (await catboxResponse.text()).trim();
        if (catboxUrl.startsWith('http')) {
          console.log('Catbox upload successful:', catboxUrl);
          return NextResponse.json({ url: catboxUrl });
        }
      }
      console.warn(`Catbox upload failed with status: ${catboxResponse.status}.`);
    } catch (catboxErr) {
      console.error('Catbox upload exception:', catboxErr);
    }

    // METHOD 2: Data URI Fallback
    const dataUri = `data:${fileType || 'image/jpeg'};base64,${fileData}`;
    return NextResponse.json({ url: dataUri });

  } catch (error: any) {
    console.error('Server Upload API error:', error);
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
  }
}
