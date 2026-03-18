import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { deductCredits } from '@/lib/credits';
import { generateCaption } from '@/lib/openai';

const CREDIT_COST = 1;

export async function POST(request) {
  try {
    const user = await getAuthUser(request);

    const { productName, price, description } = await request.json();

    if (!productName || !price) {
      return NextResponse.json(
        { error: 'productName and price are required' },
        { status: 400 }
      );
    }

    const remainingCredits = await deductCredits(user.id, CREDIT_COST);

    const result = await generateCaption({ productName, price, description });

    return NextResponse.json({
      data: { ...result, remainingCredits },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 }
    );
  }
}
