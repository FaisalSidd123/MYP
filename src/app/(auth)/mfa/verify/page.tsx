/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MfaVerifyPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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
      
      const data = await res.json();

      if (res.ok) {
        // Hard navigate so AuthContext and route guards refresh cleanly
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid verification code. Please check your authenticator app.');
      }
    } catch (err) {
      setError('Network communication failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to disable Two-Factor Authentication for your account?')) {
      return;
    }

    setResetting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/mfa/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reset 2FA.');
      }
    } catch (err) {
      setError('Network issue while resetting 2FA.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-sm">
        Verifying session...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs mb-4">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
            Two-Factor Authentication
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter the 6-digit verification code from your authenticator app (Google Authenticator, Authy, etc.).
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-start gap-2.5">
            <span className="material-symbols-outlined text-rose-500 text-[18px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {resetSuccess && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
            <span>2FA successfully disabled. Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center font-mono">
              6-Digit Authenticator Code
            </label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-center text-2xl tracking-[0.4em] font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold placeholder:text-slate-300"
              type="text" 
              inputMode="numeric"
              maxLength={6} 
              placeholder="000000"
              value={code} 
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
              autoFocus 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={verifying || resetting || code.length < 6}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {verifying ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Verifying...</span>
              </>
            ) : (
              'Confirm Code & Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-center">
          <p className="text-xs text-slate-400">Can't access your code or getting an error?</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDisableMfa}
              disabled={resetting || verifying}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer disabled:opacity-50"
            >
              {resetting ? 'Disabling 2FA...' : 'Disable 2FA & Access Dashboard'}
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => router.push('/mfa/setup')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              Reconfigure 2FA
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => signOut().then(() => router.push('/login'))}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              Sign out and switch account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
