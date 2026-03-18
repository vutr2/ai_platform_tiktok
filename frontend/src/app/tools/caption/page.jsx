'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageShell from '@/components/layout/PageShell';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function CaptionPage() {
  const { deductCredits } = useAuthStore();

  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate_caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, price, description }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(res.status === 402 ? 'Insufficient credits. Top up to continue.' : (json.error || 'Something went wrong'));
        return;
      }

      setResult(json.data);
      deductCredits(1);
      toast.success('Caption generated!');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell title="Caption Generator" backHref="/dashboard" backLabel="Dashboard">
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <Card>
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Caption Generator</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mb-6">Generate viral TikTok captions with hashtags &amp; CTA</p>

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
                placeholder="e.g. Áo hoodie oversize"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 299,000đ"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Description <span className="text-[var(--foreground-secondary)]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the product..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-medium text-[var(--primary)] bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">1 credit</span>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Caption'}
              </button>
            </div>
          </form>
        </Card>

        {result && (
          <Card>
            <h2 className="font-semibold text-[var(--foreground)] mb-4">Generated Caption</h2>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wide">Caption</span>
                <button onClick={() => copy(result.caption)} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3">
                {result.caption}
              </p>
            </div>

            <div className="mb-4">
              <span className="text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wide block mb-2">Hashtags</span>
              <div className="flex flex-wrap gap-2">
                {result.hashtags?.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => copy(`#${tag}`)}
                    className="text-xs bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wide">Call to Action</span>
                <button onClick={() => copy(result.cta)} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-sm text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3">
                {result.cta}
              </p>
            </div>
          </Card>
        )}
      </main>
    </PageShell>
  );
}
