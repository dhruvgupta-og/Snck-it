"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LogIn, MapPin, Phone, User, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Onboarding() {
  const { loginWithGoogle, user, profile, updateProfile } = useAuth();
  const [colleges, setColleges] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    collegeId: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      const querySnapshot = await getDocs(collection(db, "colleges"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setColleges(list);
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        collegeId: profile.collegeId || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.collegeId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success("Welcome aboard!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-white text-text-main">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 max-w-5xl mx-auto z-10">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center w-full max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-xs uppercase tracking-widest mb-8">
              <Sparkles size={14} /> The #1 Campus Food App
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
              Skip the queue.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                Snack it.
              </span>
            </h1>
            
            <p className="text-lg text-text-muted mb-12 max-w-lg mx-auto font-medium">
              Premium campus eats, delivered hot and fresh directly to your dorm or library desk.
            </p>

            {/* Animated Food Cards Row */}
            <div className="flex justify-center gap-4 mb-12 -mx-6 px-6 overflow-hidden pb-4">
              {[
                { img: "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=600", title: "Hot Meals", time: "15 min" },
                { img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600", title: "Pizzas", time: "20 min" },
                { img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600", title: "Shakes", time: "5 min" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 + 0.3, type: "spring" }}
                  whileHover={{ y: -10, rotate: i % 2 === 0 ? 2 : -2 }}
                  className={`${i === 2 ? 'hidden sm:block' : ''} relative w-40 h-56 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 cursor-pointer group`}
                >
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white font-black text-lg leading-tight">{card.title}</p>
                    <p className="text-primary font-bold text-xs">⏱ {card.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Login Action Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="bg-white/60 backdrop-blur-2xl p-6 lg:p-8 rounded-[2.5rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] inline-block w-full max-w-sm"
            >
              <h3 className="font-bold text-xl mb-4">Ready to order?</h3>
              <button 
                onClick={loginWithGoogle}
                className="w-full h-14 bg-gradient-to-r from-gray-900 to-black text-white font-black rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg group"
              >
                <LogIn size={20} className="group-hover:-translate-x-1 transition-transform" />
                Sign in to Order
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-gray-400" />
              </button>
              <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">
                Join thousands of students
              </p>
            </motion.div>

          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 animate-fade-in">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>
        
        <div className="mb-10">
          <h2 className="text-3xl font-black tracking-tight text-text-main mb-2">Complete Profile</h2>
          <p className="text-sm text-text-muted">Final step to start snacking on campus.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
              <User size={12} /> Full Name*
            </label>
            <input 
              type="text"
              required
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300"
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
              <Phone size={12} /> Phone Number
            </label>
            <input 
              type="tel"
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
              <MapPin size={12} /> College Campus*
            </label>
            <select 
              required
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all appearance-none text-text-main"
              value={formData.collegeId}
              onChange={(e) => setFormData({...formData, collegeId: e.target.value})}
            >
              <option value="">Select your college</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn-primary h-14 mt-6 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Start Exploring"}
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
