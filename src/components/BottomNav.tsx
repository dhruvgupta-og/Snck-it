"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Search, ShoppingBag, User } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "search" | "orders" | "profile";
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 max-w-lg lg:max-w-xl mx-auto bg-surface/90 backdrop-blur-xl border-t lg:border border-border lg:rounded-t-[2.5rem] px-8 py-4 flex justify-between items-center z-50 shadow-2xl">
      <button 
        onClick={() => router.push('/')} 
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-primary scale-110' : 'text-text-muted hover:text-primary/70'}`}
      >
        <ShoppingBag size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Dining</span>
      </button>

      <button 
        onClick={() => router.push('/')} // Ideally to a search page
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'search' ? 'text-primary scale-110' : 'text-text-muted hover:text-primary/70'}`}
      >
        <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Search</span>
      </button>

      <button 
        onClick={() => router.push('/orders')} 
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'orders' ? 'text-primary scale-110' : 'text-text-muted hover:text-primary/70'}`}
      >
        <ShoppingBag size={24} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Orders</span>
      </button>

      <button 
        onClick={() => router.push('/profile')} 
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-primary scale-110' : 'text-text-muted hover:text-primary/70'}`}
      >
        <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
      </button>
    </nav>
  );
}
