"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, MapPin, User, Moon, Sun, ShoppingBag, ChevronRight, Settings } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, logout, loading } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    setIsDark(saved);
    if (saved) document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/');
    }
  }, [loading, profile, router]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (loading || !profile) return <div className="min-h-screen text-center py-20 animate-fade-in"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-20"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <header className="p-6 bg-white sticky top-0 z-10 border-b border-border shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">Profile</h1>
        <button 
          onClick={toggleTheme}
          className="p-2 bg-gray-50 border border-border rounded-xl text-text-main shadow-sm"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-text-muted text-sm flex items-center gap-1">
              <MapPin size={14} /> Campus ID: {profile.collegeId}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
          <button 
            onClick={() => router.push('/orders')} 
            className="w-full flex items-center justify-between p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold">My Orders</p>
                <p className="text-xs text-text-muted">View past and active orders</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
          
          <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                <Settings size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold">Account Settings</p>
                <p className="text-xs text-text-muted">Update details and preferences</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Logout */}
        <button 
          onClick={logout} 
          className="w-full bg-white p-5 rounded-3xl border border-red-100 flex items-center justify-between shadow-sm hover:border-red-300 hover:bg-red-50 transition-colors text-red-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <p className="font-bold">Logout</p>
          </div>
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}
