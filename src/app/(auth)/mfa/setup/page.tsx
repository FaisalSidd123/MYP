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
          setError(data.error || 'Failed to generate MFA setup.');
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
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid code.');
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading || !qrCode) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-wider">
        Initializing Secure Exchange...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs mb-4">
            <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
            Enable 2FA
          </h1>
          <p className="text-xs text-slate-500 mt-1">Scan the QR code with your authenticator app.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">{error}</div>}

        <div className="flex flex-col items-center mb-6">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <img src={qrCode} alt="MFA QR Code" className="w-44 h-44" />
          </div>
          <p className="font-mono text-xs tracking-wider text-slate-700 font-bold mt-4 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg select-all">
            {secret}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono text-center">Enter 6-Digit PIN</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.4em] font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400"
              type="text" maxLength={6} placeholder="000000"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required
            />
          </div>

          <button 
            type="submit" disabled={verifying || code.length < 6}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Confirm and Finish'}
          </button>
        </form>
      </div>
    </main>
  );
}
