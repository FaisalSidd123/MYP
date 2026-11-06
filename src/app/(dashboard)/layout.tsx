"use client";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC]">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFC] min-h-screen text-slate-900">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 pt-24 pb-12 px-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
