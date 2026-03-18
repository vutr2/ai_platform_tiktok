import { NextResponse } from 'next/server';
import { SePayPgClient } from 'sepay-pg-node';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const PACKAGES = {
  1: { credits: 20,  amountVnd: 10000  },
  2: { credits: 120, amountVnd: 50000  },
  3: { credits: 260, amountVnd: 100000 },
};

const client = new SePayPgClient({
  env: process.env.SEPAY_ENV || 'sandbox',
  merchant_id: process.env.SEPAY_MERCHANT_ID,
  secret_key: process.env.SEPAY_SECRET_KEY,
});

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    const { packageId } = await request.json();

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Generate a unique invoice number
    const invoiceNumber = `TOPUP-${Date.now()}-${user.id.slice(-6)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Store pending transaction in Supabase
    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        id: invoiceNumber,
        user_id: user.id,
        amount_vnd: pkg.amountVnd,
        credits_to_add: pkg.credits,
        status: 'pending',
      });

    if (txError) {
      console.error('Transaction insert error:', txError);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    const checkoutUrl = client.checkout.initCheckoutUrl();
    const formFields = client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: invoiceNumber,
      order_amount: pkg.amountVnd,
      currency: 'VND',
      order_description: `Nạp ${pkg.credits} credits - TikTok AI Tools`,
      customer_id: user.id,
      success_url: `${appUrl}/credits/topup?status=success&inv=${invoiceNumber}`,
      error_url: `${appUrl}/credits/topup?status=error`,
      cancel_url: `${appUrl}/credits/topup?status=cancelled`,
    });

    return NextResponse.json({ data: { checkoutUrl, formFields } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}
