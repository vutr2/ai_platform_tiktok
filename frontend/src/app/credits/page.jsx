'use client';

import Link from 'next/link';
import { Zap, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageShell from '@/components/layout/PageShell';
import useAuthStore from '@/store/useAuthStore';

const PACKAGES = [
  { credits: 20,  price: '10,000đ',  label: '20 credits' },
  { credits: 120, price: '50,000đ',  label: '120 credits', badge: 'Most Popular', highlight: true },
  { credits: 260, price: '100,000đ', label: '260 credits', badge: 'Best Value' },
];

export default function CreditsPage() {
  const { credits } = useAuthStore();

  return (
    <PageShell title="Credits" backHref="/dashboard" backLabel="Dashboard" creditsBadgeLink={false}>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Card className="mb-8 text-center">
          <p className="text-sm text-[var(--foreground-secondary)] mb-1">Current Balance</p>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-4xl font-bold text-[var(--foreground)]">{credits}</span>
            <span className="text-lg text-[var(--foreground-secondary)]">credits</span>
          </div>
        </Card>

        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Top Up Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => (
            <div key={pkg.credits} className="relative">
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-[var(--primary)] text-white px-3 py-0.5 rounded-full z-10">
                  {pkg.badge}
                </span>
              )}
              <Card className={pkg.highlight ? 'border-[var(--primary)]' : ''}>
                <div className="text-center pt-2">
                  <p className="text-2xl font-bold text-[var(--foreground)]">{pkg.label}</p>
                  <p className="text-[var(--foreground-secondary)] text-sm my-1">for</p>
                  <p className="text-xl font-semibold text-[var(--primary)] mb-4">{pkg.price}</p>
                  <Link
                    href="/credits/topup"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors"
                  >
                    <CreditCard className="w-4 h-4" /> Top Up
                  </Link>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
}
