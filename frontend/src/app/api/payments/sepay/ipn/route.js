import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    // Verify the request is from Sepay
    const secretKey = request.headers.get('X-Secret-Key');
    if (secretKey !== process.env.SEPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_type, order, transaction } = body;

    // Only process successful payments
    if (
      notification_type !== 'ORDER_PAID' ||
      order?.order_status !== 'CAPTURED' ||
      transaction?.transaction_status !== 'APPROVED'
    ) {
      return NextResponse.json({ success: true });
    }

    const invoiceNumber = order.order_invoice_number;

    // Look up the pending transaction (idempotency check)
    const { data: tx, error: txFetchError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', invoiceNumber)
      .single();

    if (txFetchError || !tx) {
      console.error('Transaction not found:', invoiceNumber);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Already processed — return 200 to prevent Sepay retries
    if (tx.status === 'completed') {
      return NextResponse.json({ success: true });
    }

    // Add credits to user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', tx.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: user.credits + tx.credits_to_add })
      .eq('id', tx.user_id);

    if (updateError) {
      console.error('Failed to add credits:', updateError);
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
    }

    // Mark transaction as completed
    await supabaseAdmin
      .from('transactions')
      .update({
        status: 'completed',
        sepay_transaction_id: transaction.transaction_id,
        completed_at: new Date().toISOString(),
      })
      .eq('id', invoiceNumber);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('IPN error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
