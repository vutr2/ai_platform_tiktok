import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { deductCredits } from '@/lib/credits';
import { generateHooks } from '@/lib/openai';

const CREDIT_COST = 1;

export async function POST(request) {
  try {
    const user = await getAuthUser(request);

    const { productName, productType } = await request.json();

    if (!productName || !productType) {
      return NextResponse.json(
        { error: 'productName and productType are required' },
        { status: 400 }
      );
    }

    const remainingCredits = await deductCredits(user.id, CREDIT_COST);

    const result = await generateHooks({ productName, productType });

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
