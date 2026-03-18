'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Download, ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageShell from '@/components/layout/PageShell';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function BackgroundPage() {
  const { deductCredits } = useAuthStore();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const acceptFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFile(f);
    setResult(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please upload an image first'); return; }
    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/remove_background', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        toast.error(res.status === 402 ? 'Insufficient credits. Top up to continue.' : (json.error || 'Processing failed'));
        return;
      }

      setResult(json.data.imageBase64);
      deductCredits(2);
      toast.success('Background removed!');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${result}`;
    link.download = `${file?.name?.replace(/\.[^.]+$/, '') ?? 'result'}_nobg.png`;
    link.click();
  };

  return (
    <PageShell title="Background Remover" backHref="/dashboard" backLabel="Dashboard">
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <Card>
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Background Remover</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mb-6">Remove background from product images instantly</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[var(--primary)] bg-orange-50 dark:bg-orange-950/20'
                : 'border-[var(--card-border)] hover:border-[var(--primary)]'
            }`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--foreground-secondary)]">
                <ImageIcon className="w-10 h-10" />
                <p className="text-sm font-medium">Click or drag &amp; drop an image</p>
                <p className="text-xs">PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => acceptFile(e.target.files[0])}
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-medium text-[var(--primary)] bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">2 credits</span>
            <button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Processing...' : 'Remove Background'}
            </button>
          </div>
        </Card>

        {result && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[var(--foreground)]">Result</h2>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
            <div
              className="rounded-xl p-4 flex items-center justify-center"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23e5e7eb'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e5e7eb'/%3E%3Crect x='10' y='0' width='10' height='10' fill='%23f9fafb'/%3E%3Crect x='0' y='10' width='10' height='10' fill='%23f9fafb'/%3E%3C/svg%3E\")" }}
            >
              <img src={`data:image/png;base64,${result}`} alt="Background removed" className="max-h-64 object-contain rounded" />
            </div>
          </Card>
        )}
      </main>
    </PageShell>
  );
}
