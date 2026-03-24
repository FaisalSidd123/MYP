/* eslint-disable */
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`.trim()
        });
        router.push('/contacts');
      } else {
        setError('Firebase not initialized. Check your .env parameters.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"></div>
<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]"></div>
</div>

<main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 py-12 mx-auto">

<div className="mb-10 text-center">
<div className="flex items-center justify-center gap-3 mb-2">
<div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dim rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
<span className="material-symbols-outlined text-on-primary-fixed text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
</div>
<span className="text-on-surface font-extrabold text-2xl tracking-tight">ContactHub</span>
</div>
<p className="text-on-surface-variant text-sm tracking-wide uppercase font-medium opacity-60">+ Architecture for Connections</p>
</div>

<div className="glass-card w-full max-w-md p-8 md:p-10 rounded-3xl border border-outline-variant/20">
<div className="mb-8">
<h1 className="text-on-surface text-3xl font-bold tracking-tight mb-2">Join the Network</h1>
<p className="text-on-surface-variant text-base leading-relaxed">Create your architect profile to begin managing your ecosystem.</p>
</div>

{error && (
  <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm text-center font-medium">
    {error}
  </div>
)}

<form className="space-y-6" onSubmit={handleRegister}>

<div className="grid grid-cols-2 gap-4">
<div className="space-y-2">
<label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">First Name</label>
<input 
  className="bg-surface-container-lowest border border-outline-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 w-full px-4 py-3 rounded-xl text-on-surface placeholder:text-on-surface-variant/40" 
  placeholder="Julian" type="text"
  value={firstName} onChange={(e) => setFirstName(e.target.value)} required
/>
</div>
<div className="space-y-2">
<label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Last Name</label>
<input 
  className="bg-surface-container-lowest border border-outline-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 w-full px-4 py-3 rounded-xl text-on-surface placeholder:text-on-surface-variant/40" 
  placeholder="Voss" type="text"
  value={lastName} onChange={(e) => setLastName(e.target.value)} required
/>
</div>
</div>

<div className="space-y-2">
<label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Email Address</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">alternate_email</span>
<input 
  className="bg-surface-container-lowest border border-outline-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 w-full pl-12 pr-4 py-3 rounded-xl text-on-surface placeholder:text-on-surface-variant/40" 
  placeholder="julian@architect.io" type="email"
  value={email} onChange={(e) => setEmail(e.target.value)} required
/>
</div>
</div>

<div className="space-y-2">
<label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Password</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">lock</span>
<input 
  className="bg-surface-container-lowest border border-outline-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 w-full pl-12 pr-4 py-3 rounded-xl text-on-surface placeholder:text-on-surface-variant/40" 
  placeholder="••••••••••••" type="password"
  value={password} onChange={(e) => setPassword(e.target.value)} required
/>
</div>
</div>

<div className="pt-2 space-y-6">
<button 
  className="w-full bg-gradient-to-r from-primary to-primary-dim text-on-primary-fixed font-bold py-4 rounded-xl shadow-xl shadow-primary/10 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
  type="submit" disabled={loading}
>
  <span>{loading ? "Initializing Profile..." : "Create Account"}</span>
  {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
</button>
<div className="flex items-center justify-center gap-2 text-sm">
<span className="text-on-surface-variant">Already have an account?</span>
<Link className="text-primary font-semibold hover:text-primary-fixed transition-colors" href="/login">Sign In</Link>
</div>
</div>
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
</div>

<div className="mt-12 max-w-xs text-center">
<p className="text-on-surface-variant text-[11px] leading-relaxed opacity-40 uppercase tracking-[0.15em] font-medium">
                Designing sophisticated conduits for the modern professional. Secured by end-to-end indigo encryption.
            </p>
</div>
</main>

<footer className="fixed bottom-0 w-full bg-transparent flex justify-center items-center px-8 py-6 font-inter text-sm tracking-wide z-10">
<div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 opacity-80 hover:opacity-100 transition-all duration-200">
<span className="text-[var(--color-on-surface-variant)]">© 2026 ContactHub. Built for the Nocturnal Architect.</span>
<div className="flex gap-8">
<a className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors" href="/">Privacy Policy</a>
<a className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors" href="/">Terms of Service</a>
<a className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors" href="/">Help Center</a>
</div>
</div>
</footer>

    </>
  );
}
