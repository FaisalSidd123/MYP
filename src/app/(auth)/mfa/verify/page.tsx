/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MfaVerifyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setVerifying(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code })
      });
      
      if (res.ok) {
        await user.getIdToken(true);
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid code. Try again.');
      }
    } catch (err) {
      setError('Verification failed. Network issue.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs mb-4">
            <span className="material-symbols-outlined text-[22px]">lock</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
            Two-Factor Auth
          </h1>
          <p className="text-xs text-slate-500 mt-1">Enter the 6-digit code from your authenticator app.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">{error}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.4em] font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400"
              type="text" maxLength={6} placeholder="••••••"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus required
            />
          </div>

          <button 
            type="submit" disabled={verifying || code.length < 6}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            {verifying ? 'Authenticating...' : 'Confirm Identity'}
          </button>
        </form>
      </div>
    </main>
  );
}
