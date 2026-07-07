import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('fileToUpload') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure the filename has a valid image extension, otherwise Catbox returns 412 Precondition Failed
    let fileName = file.name || 'image.jpg';
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      fileName = 'image.jpg';
    }

    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', file, fileName);

    console.log(`Forwarding image upload (${fileName}) to Catbox from server...`);
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxForm,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Upload server returned status ${response.status}` }, { status: 500 });
    }

    const imageUrl = await response.text();
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return NextResponse.json({ error: imageUrl || 'Failed to parse upload URL' }, { status: 500 });
    }

    console.log('Catbox upload successful:', imageUrl.trim());
    return NextResponse.json({ url: imageUrl.trim() });
  } catch (err: any) {
    console.error('Error in /api/upload route handler:', err);
    return NextResponse.json({ error: err?.message || 'Server upload failure' }, { status: 500 });
  }
}
