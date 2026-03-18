'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap, CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageShell from '@/components/layout/PageShell';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const PACKAGES = [
  { id: 1, credits: 20,  price: '10,000đ', label: '20 credits' },
  { id: 2, credits: 120, price: '50,000đ', label: '120 credits', badge: 'Phổ biến nhất', highlight: true },
  { id: 3, credits: 260, price: '100,000đ', label: '260 credits', badge: 'Tiết kiệm nhất' },
];

export default function TopUpPage() {
  const searchParams = useSearchParams();
  const { fetchUser } = useAuthStore();
  const [loadingPkg, setLoadingPkg] = useState(null);

  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => fetchUser(), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, fetchUser]);

  const handleTopUp = async (packageId) => {
    setLoadingPkg(packageId);
    try {
      const res = await fetch('/api/payments/sepay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to create payment');
        setLoadingPkg(null);
        return;
      }

      const { checkoutUrl, formFields } = json.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkoutUrl;

      Object.entries(formFields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch {
      toast.error('Network error. Please try again.');
      setLoadingPkg(null);
    }
  };

  return (
    <PageShell title="Top Up" backHref="/credits" backLabel="Credits" creditsBadgeLink={false}>
      <main className="max-w-3xl mx-auto px-6 py-10">

        {status === 'success' && (
          <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Payment received!</p>
                <p className="text-sm text-green-600 dark:text-green-500">Your credits will be added within a few seconds.</p>
              </div>
            </div>
          </Card>
        )}

        {status === 'error' && (
          <Card className="mb-6 border-red-400 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">Payment failed</p>
                <p className="text-sm text-red-600 dark:text-red-500">Something went wrong. Please try again.</p>
              </div>
            </div>
          </Card>
        )}

        {status === 'cancelled' && (
          <Card className="mb-6 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Payment cancelled.</p>
            </div>
          </Card>
        )}

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Top Up Credits</h1>
        <p className="text-[var(--foreground-secondary)] text-sm mb-8">
          Pay via bank transfer QR code. Credits are added instantly after payment is confirmed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className="relative">
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-[var(--primary)] text-white px-3 py-0.5 rounded-full z-10 whitespace-nowrap">
                  {pkg.badge}
                </span>
              )}
              <Card className={pkg.highlight ? 'border-[var(--primary)]' : ''}>
                <div className="text-center pt-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-2xl font-bold text-[var(--foreground)]">{pkg.credits}</span>
                    <span className="text-sm text-[var(--foreground-secondary)]">credits</span>
                  </div>
                  <p className="text-[var(--foreground-secondary)] text-xs mb-1">for</p>
                  <p className="text-xl font-semibold text-[var(--primary)] mb-4">{pkg.price}</p>
                  <button
                    onClick={() => handleTopUp(pkg.id)}
                    disabled={loadingPkg !== null}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPkg === pkg.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Pay {pkg.price}</>
                    )}
                  </button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[var(--foreground-secondary)] mt-8">
          Payments processed securely by <span className="font-medium">SePay</span> via bank transfer QR code.
        </p>
      </main>
    </PageShell>
  );
}
