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

    // Generate secret
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
        // Success! Proceed to dashboard
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
    return <div className="min-h-screen flex items-center justify-center text-on-surface-variant font-bold uppercase tracking-widest">Initializing Secure Exchange...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-10 rounded-3xl shadow-2xl transition-all duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <span className="material-symbols-outlined text-on-primary text-4xl">qr_code_scanner</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Enable 2FA</h1>
          <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">Scan the QR code below with your Authenticator app (like Google Authenticator or Authy).</p>
        </div>

        {error && <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm font-bold text-center">{error}</div>}

        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-4 rounded-xl border-4 border-primary/20 shadow-2xl">
            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
          </div>
          <p className="font-mono text-sm tracking-widest text-primary font-bold mt-6 bg-primary/10 px-4 py-2 rounded-lg">{secret}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 text-center">Enter 6-Digit PIN</label>
            <input 
              className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
              type="text" maxLength={6} placeholder="000000"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required
            />
          </div>

          <button 
            type="submit" disabled={verifying || code.length < 6}
            className="w-full relative flex items-center justify-center py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? 'Verifying...' : 'Establish Security Perimeter'}
          </button>
        </form>
      </div>
    </div>
  );
}
