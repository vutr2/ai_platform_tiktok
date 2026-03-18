import { NextResponse } from 'next/server';

// Sepay redirects to this URL after payment (success/error/cancel)
// We forward it to the topup page with the status param
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'success';
  const inv = searchParams.get('inv') || '';

  return NextResponse.redirect(
    new URL(`/credits/topup?status=${status}&inv=${inv}`, request.url)
  );
}
