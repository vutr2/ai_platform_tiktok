import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { deductCredits } from '@/lib/credits';

const CREDIT_COST = 2;

export async function POST(request) {
  try {
    const user = await getAuthUser(request);

    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json(
        { error: 'image file is required' },
        { status: 400 }
      );
    }

    const remainingCredits = await deductCredits(user.id, CREDIT_COST);

    const removeBgForm = new FormData();
    removeBgForm.append('image_file', imageFile);
    removeBgForm.append('size', 'auto');

    const removeBgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      body: removeBgForm,
    });

    if (!removeBgRes.ok) {
      const errText = await removeBgRes.text();
      console.error('remove.bg error:', errText);
      return NextResponse.json(
        { error: 'Background removal failed' },
        { status: 502 }
      );
    }

    const arrayBuffer = await removeBgRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({
      data: {
        imageBase64: base64,
        mimeType: 'image/png',
        remainingCredits,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 }
    );
  }
}
