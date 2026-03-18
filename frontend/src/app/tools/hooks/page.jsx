'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageShell from '@/components/layout/PageShell';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const PRODUCT_TYPES = [
  'Thời trang', 'Điện tử', 'Làm đẹp', 'Thực phẩm',
  'Gia dụng', 'Thể thao', 'Phụ kiện', 'Khác',
];

export default function HooksPage() {
  const { deductCredits } = useAuthStore();

  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hooks, setHooks] = useState(null);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHooks(null);

    try {
      const res = await fetch('/api/generate_hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, productType }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(res.status === 402 ? 'Insufficient credits. Top up to continue.' : (json.error || 'Something went wrong'));
        return;
      }

      setHooks(json.data.hooks);
      deductCredits(1);
      toast.success('Hooks generated!');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell title="Hook Generator" backHref="/dashboard" backLabel="Dashboard">
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <Card>
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Video Hook Generator</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mb-6">Create 5 viral hooks that stop the scroll</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Serum dưỡng ẩm"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              >
                <option value="">Select a category</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-medium text-[var(--primary)] bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">1 credit</span>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Hooks'}
              </button>
            </div>
          </form>
        </Card>

        {hooks && (
          <Card>
            <h2 className="font-semibold text-[var(--foreground)] mb-4">Your 5 Viral Hooks</h2>
            <ol className="space-y-3">
              {hooks.map((hook, i) => (
                <li key={i} className="flex items-start gap-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-[var(--foreground)] leading-relaxed">{hook}</p>
                  <button onClick={() => copy(hook)} className="flex-shrink-0 text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </main>
    </PageShell>
  );
}
