/* eslint-disable */
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email.trim());
        setSuccess('Password reset link has been sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else {
        setError('Firebase not initialized. Check your environment parameters.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push('/dashboard');
      } else {
        setError('Firebase not initialized. Check your environment parameters.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center shadow-xs mb-3 font-mono font-black text-base">
            <span className="bg-gradient-to-br from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              MYP
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
            Welcome back to MYP
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage Your Priorities · Smart Client CRM
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
              id="email"
              name="email"
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                Password
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 font-mono"
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="remember" className="text-xs text-slate-600 select-none">
              Remember this device
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            {!loading && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Or</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-slate-900 hover:underline ml-0.5" href="/register">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
