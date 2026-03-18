'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, useDescope } from '@descope/nextjs-sdk/client';
import { ArrowLeft, Zap, LogOut } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

export default function PageShell({ title, backHref, backLabel, creditsBadgeLink = true, children }) {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { logout } = useDescope();
  const { credits, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isSessionLoading, router]);

  useEffect(() => {
    if (isAuthenticated) fetchUser();
  }, [isAuthenticated, fetchUser]);

  const handleLogout = async () => { await logout(); router.push('/login'); };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  const badgeClass = "flex items-center gap-1.5 bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="flex items-center gap-1.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          <span className="text-[var(--card-border)]">/</span>
          <span className="font-semibold text-[var(--foreground)]">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {creditsBadgeLink ? (
            <Link href="/credits/topup" className={badgeClass}>
              <Zap className="w-3.5 h-3.5" /> {credits} credits
            </Link>
          ) : (
            <div className={badgeClass}>
              <Zap className="w-3.5 h-3.5" /> {credits} credits
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
