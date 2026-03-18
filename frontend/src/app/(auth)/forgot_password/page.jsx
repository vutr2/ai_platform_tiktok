'use client';

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Zap, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useDescope } from "@descope/nextjs-sdk/client";

export default function ForgotPasswordPage() {
    const sdk = useDescope();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email format');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await sdk.password.sendPasswordReset(email);
            setIsSubmitted(true);
        } catch (err) {
            toast.error(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-[var(--foreground)]">
                        AI Platform
                    </span>
                </Link>

                <Card>
                    {isSubmitted ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
                                Check your email
                            </h2>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-6">
                                We sent a password reset link to{' '}
                                <span className="font-medium text-[var(--foreground)]">{email}</span>
                            </p>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm text-[var(--primary)] hover:underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-center text-[var(--foreground)] mb-2">
                                Forgot password?
                            </h1>
                            <p className="text-center text-[var(--foreground-secondary)] text-sm mb-6">
                                Enter your email and we'll send you a reset link
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-secondary)]" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="you@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                        />
                                    </div>
                                    {error && (
                                        <p className="mt-1 text-sm text-red-500">{error}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending...' : 'Send reset link'}
                                </button>
                            </form>

                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 mt-6 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
