'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '../actions';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(res.error || 'Invalid credentials.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="rounded-full bg-border/40 p-3 text-foreground">
            <Lock className="h-5 w-5 stroke-[1.5]" />
          </div>
          <h1 className="text-xl font-semibold tracking-wider uppercase text-foreground">
            Store Manager
          </h1>
          <p className="text-xs text-secondary">
            Enter your credentials to access the management dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
              placeholder="name@example.com"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
              placeholder="••••••••"
              disabled={loading}
            />
            {error && <p className="text-[10px] text-red-500 font-medium mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-foreground py-3 text-xs font-bold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-[10px] uppercase tracking-widest text-secondary hover:text-foreground font-semibold transition-colors"
          >
            ← Back to Storefront
          </a>
        </div>

      </div>
    </div>
  );
}
