"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The explicit initialization ensures this doesn't break if Firebase config is missing
    if (!auth) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              id: user.uid,
              email: user.email,
              display_name: user.displayName,
              avatar_url: user.photoURL
            })
          });
          if (res.status === 403) {
            const data = await res.json();
            if (data.code === 'mfa_required' && window.location.pathname !== '/mfa/verify') {
              window.location.href = '/mfa/verify';
              return;
            }
          }
          // Note: MFA is optional. Users with mfa_enabled === false are NOT forced to setup MFA.
        } catch (err) {
          console.error("Failed to sync user to Supabase:", err);
        }
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    if (auth) await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
