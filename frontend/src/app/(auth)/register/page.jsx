'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Descope } from '@descope/nextjs-sdk';
import { Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function Register() {
  const router = useRouter();

  const handleSuccess = useCallback(
    async (e) => {
      toast.success('Account created!');

      try {
        await fetch('/api/auth/descope-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: e.detail.user.userId,
            email: e.detail.user.email,
            name: e.detail.user.name || e.detail.user.email?.split('@')[0],
            picture: e.detail.user.picture,
          }),
        });
      } catch (err) {
        console.error('Error syncing user:', err);
      }

      router.push('/dashboard');
    },
    [router]
  );

  const handleError = useCallback((e) => {
    console.error('Register error:', e);
    toast.error('Registration failed. Please try again.');
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </Link>

        <Card>
          <h1 className="text-2xl font-bold text-center text-[var(--foreground)] mb-2">
            Create Account
          </h1>
          <p className="text-center text-[var(--foreground-secondary)] mb-6">
            Get 20 free credits to start
          </p>

          <Descope
            flowId="sign-up-or-in-passwords-or-social"
            onSuccess={handleSuccess}
            onError={handleError}
            theme="dark"
          />

          <p className="mt-6 text-center text-sm text-[var(--foreground-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
