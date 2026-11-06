/* eslint-disable */
"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MfaSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const generateMfa = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/auth/mfa/generate', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setQrCode(data.qrCodeUrl);
          setSecret(data.secret);
        } else {
          setError(data.error || 'Failed to initialize MFA.');
        }
      } catch (err) {
        setError('Network error occurred.');
      }
    };
    generateMfa();
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
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid code.');
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSkip = () => {
    window.location.href = '/dashboard';
  };

  if (loading || (!qrCode && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-sm">
        Initializing 2FA setup...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs mb-4">
            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
            Setup Two-Factor Auth
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scan the QR code with your authenticator app (e.g. Google Authenticator) and enter the 6-digit code.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-start gap-2.5">
            <span className="material-symbols-outlined text-rose-500 text-[18px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {qrCode && (
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 rounded-lg" />
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-mono">Manual Setup Key:</p>
            <p className="font-mono text-xs tracking-wider text-slate-800 font-bold mt-1 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl select-all">
              {secret}
            </p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono text-center">
              Enter 6-Digit PIN
            </label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-center text-2xl tracking-[0.4em] font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold placeholder:text-slate-300"
              type="text" 
              inputMode="numeric"
              maxLength={6} 
              placeholder="000000"
              value={code} 
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={verifying || code.length < 6}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {verifying ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Verifying...</span>
              </>
            ) : (
              'Activate 2FA & Continue'
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Skip for now & Return to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
