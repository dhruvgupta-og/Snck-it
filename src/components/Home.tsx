"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, ShoppingBag, MapPin, Star, Clock, Moon, Sun, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BottomNav from "./BottomNav";

interface Store {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  deliveryTime: string;
}

export default function Home() {
  const { profile, logout } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    setIsDark(saved);
    if (saved) document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.collegeId) return;

      try {
        // Fetch college name
        const collegeDoc = await getDoc(doc(db, "colleges", profile.collegeId));
        if (collegeDoc.exists()) {
          setCollegeName(collegeDoc.data().name);
        }

        // Fetch stores for this college
        const q = query(
          collection(db, "stores"), 
          where("collegeId", "==", profile.collegeId),
          where("isActive", "==", true)
        );
        
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
        setStores(list);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-32 skeleton rounded" />
        <div className="h-12 w-full skeleton rounded-xl" />
        <div className="grid grid-cols-1 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in relative bg-background min-h-screen">
      {/* Header */}
      <header className="p-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1 text-primary font-bold mb-1">
                <MapPin size={16} />
                <span className="text-sm border-b border-dashed border-primary pb-0.5 max-w-[150px] truncate">
                  {collegeName || 'Loading Campus...'}
                </span>
                <ChevronRight size={14} className="text-text-muted ml-0.5" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-text-main flex items-end">
                Snack it
                <span className="text-primary text-4xl leading-none">.</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-3 bg-surface border border-border rounded-full text-text-main shadow-sm hover:shadow-md transition-all"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                onClick={() => router.push('/cart')}
                className="p-3 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white shadow-[0_4px_15px_rgba(255,75,43,0.3)] hover:scale-105 transition-all relative"
              >
                <ShoppingBag size={20} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-[10px] rounded-full flex items-center justify-center font-black border-2 border-surface shadow-sm">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search craving..."
            className="w-full p-4 pl-12 bg-surface rounded-2xl border border-border focus:border-primary/20 outline-none transition-all premium-shadow text-text-main"
          />
        </div>
      </div>
    </header>

      {/* Categories */}
      <div className="px-6 mb-8 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
          {['All', 'Drinks', 'Healthy', 'Snacks', 'Meals'].map((cat, idx) => (
            <button 
              key={cat}
              className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${idx === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border border-border text-text-muted'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stores List */}
      <div className="max-w-7xl mx-auto px-6 space-y-6 mb-20">
        <h2 className="text-xl font-bold">Popular on Campus</h2>
        {stores.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>No stores available in your college yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {stores.map(store => (
              <motion.div 
                key={store.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/store/${store.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-surface border border-border shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="relative h-48 lg:h-56 overflow-hidden">
                  <img 
                    src={store.image} 
                    alt={store.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-text-main">{store.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-text-main">{store.name}</h3>
                      <p className="text-text-muted text-sm">{store.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-text-muted text-xs font-medium bg-background px-2 py-1 rounded-lg">
                      <Clock size={12} />
                      {store.deliveryTime}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
}
