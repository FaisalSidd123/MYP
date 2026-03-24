/* eslint-disable */
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/contacts');
      } else {
        setError('Firebase not initialized. Check your .env parameters.');
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
        router.push('/contacts');
      } else {
        setError('Firebase not initialized. Check your .env parameters.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      

<div className="fixed inset-0 pointer-events-none z-0">
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ambient-glow rounded-full blur-3xl"></div>
<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]"></div>
</div>

<main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 py-12 mx-auto">

<div className="glass-card w-full max-w-md rounded-3xl p-10 md:p-12 shadow-2xl transition-all duration-500 hover:shadow-primary/5">

<div className="flex flex-col items-center mb-10">
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
<span className="material-symbols-outlined text-on-primary text-3xl" data-icon="hub">hub</span>
</div>
<h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Welcome back, Architect</h1>
<p className="text-on-surface-variant text-sm mt-2 text-center">Secure your enterprise network.</p>
</div>

{error && (
  <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm text-center font-medium">
    {error}
  </div>
)}

<form className="space-y-6" onSubmit={handleLogin}>

<div className="space-y-2">
<label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">
                        Email Address
                    </label>
<div className="relative group">
<input 
  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300" 
  id="email" name="email" placeholder="architect@contacthub.com" type="email"
  value={email} onChange={(e) => setEmail(e.target.value)} required
/>
</div>
</div>

<div className="space-y-2">
<div className="flex justify-between items-center ml-1">
<label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                            Password
                        </label>
<a className="text-xs font-medium text-primary hover:text-primary-container transition-colors" href="/">
                            Forgot password?
                        </a>
</div>
<div className="relative group">
<input 
  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300" 
  id="password" name="password" placeholder="••••••••" type="password"
  value={password} onChange={(e) => setPassword(e.target.value)} required
/>
</div>
</div>

<div className="flex items-center space-x-2 ml-1">
<input className="w-4 h-4 rounded border-outline-variant/50 bg-surface-container-lowest text-primary focus:ring-primary/20 focus:ring-offset-0 transition-all" id="remember" type="checkbox"/>
<label className="text-xs text-on-surface-variant select-none" htmlFor="remember">Remember this device for 30 days</label>
</div>

<button 
  className="w-full group relative flex items-center justify-center py-4 px-6 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-xl shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
  type="submit"
  disabled={loading}
>
  <span className="mr-2">{loading ? "Authenticating..." : "Enter Command Center"}</span>
  {!loading && <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1" data-icon="arrow_forward">arrow_forward</span>}
</button>
</form>

<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-outline-variant/20"></div>
  <span className="text-xs font-medium tracking-widest uppercase text-on-surface-variant">Or</span>
  <div className="flex-1 h-px bg-outline-variant/20"></div>
</div>

<button 
  onClick={handleGoogleSignIn}
  disabled={loading}
  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface)] font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
  Continue with Google
</button>

<div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
<p className="text-on-surface-variant text-sm">
                    Don't have an account? 
                    <a className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1 transition-all" href="/">
                        Sign up
                    </a>
</p>
</div>
</div>

<div className="mt-8 flex items-center justify-center space-x-4 opacity-50">
<div className="flex items-center space-x-2">
<span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
<span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">Systems Operational</span>
</div>
<span className="text-outline-variant">•</span>
<div className="flex items-center space-x-2">
<span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">v2.4.0-Architect</span>
</div>
</div>
</main>

<div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none opacity-20">
<svg className="absolute top-0 right-0 w-1/2 h-full text-outline-variant/20" preserveAspectRatio="none" viewBox="0 0 100 100">
<path d="M0,100 L100,0 M20,100 L100,20 M40,100 L100,40 M60,100 L100,60 M80,100 L100,80" fill="none" stroke="currentColor" strokeWidth="0.1"></path>
</svg>
<svg className="absolute bottom-0 left-0 w-1/2 h-full text-outline-variant/20" preserveAspectRatio="none" viewBox="0 0 100 100">
<path d="M0,0 L100,100 M0,20 L80,100 M0,40 L60,100 M0,60 L40,100 M0,80 L20,100" fill="none" stroke="currentColor" strokeWidth="0.1"></path>
</svg>
</div>

    </>
  );
}
