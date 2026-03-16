'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, useDescope } from '@descope/nextjs-sdk/client';
import { FileText, Video, ImageIcon, Zap, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import useAuthStore from '@/store/useAuthStore';

const TOOLS = [
  {
    href: '/tools/caption',
    icon: FileText,
    title: 'Caption Generator',
    description: 'Generate viral TikTok captions with hashtags & CTA',
    cost: '1 credit',
    color: 'text-orange-500',
  },
  {
    href: '/tools/hooks',
    icon: Video,
    title: 'Video Hook Generator',
    description: 'Create 5 viral hooks that stop the scroll',
    cost: '1 credit',
    color: 'text-pink-500',
  },
  {
    href: '/tools/background',
    icon: ImageIcon,
    title: 'Background Remover',
    description: 'Remove background from product images instantly',
    cost: '2 credits',
    color: 'text-blue-500',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { logout } = useDescope();
  const { user, credits, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isSessionLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[var(--foreground)]">TikTok AI Tools</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/credits/topup"
            className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            {credits} credits
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-[var(--foreground-secondary)] mt-1">
            Choose a tool to generate your TikTok content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOOLS.map(({ href, icon: Icon, title, description, cost, color }) => (
            <Link key={href} href={href}>
              <Card className="hover:border-[var(--primary)] transition-colors cursor-pointer h-full">
                <div className={`w-10 h-10 rounded-xl bg-[var(--card-border)] flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h2 className="font-semibold text-[var(--foreground)] mb-1">{title}</h2>
                <p className="text-sm text-[var(--foreground-secondary)] mb-3">{description}</p>
                <span className="text-xs font-medium text-[var(--primary)] bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">
                  {cost}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
