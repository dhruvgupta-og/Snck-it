"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Plus, Minus, Star, Clock, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  availability: boolean;
}

interface Store {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  category: string;
}

export default function StoreMenu() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { items, addItem, updateQuantity, total } = useCart();
  
  const [store, setStore] = useState<Store | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const storeDoc = await getDoc(doc(db, "stores", id));
      if (storeDoc.exists()) {
        setStore({ id: storeDoc.id, ...storeDoc.data() } as Store);
      }

      const q = query(collection(db, "menuItems"), where("storeId", "==", id));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setMenu(list);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6 skeleton min-h-screen" />;
  if (!store) return <div className="p-6">Store not found</div>;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Section */}
      <div className="relative h-64">
        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-6 -mt-10 relative">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{store.name}</h1>
              <p className="text-text-muted">{store.category}</p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1 font-bold text-sm">
              <Star size={14} className="fill-primary" />
              {store.rating}
            </div>
          </div>
          <div className="flex gap-4 text-sm font-medium text-text-muted border-t border-border pt-4">
            <span className="flex items-center gap-1"><Clock size={14} /> {store.deliveryTime}</span>
            <span>•</span>
            <span className="text-green-600">Free Delivery</span>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <h2 className="text-xl font-bold mb-6">Menu Items</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {menu.map(item => {
            const cartItem = items.find(i => i.id === item.id);
            return (
              <div key={item.id} className="flex gap-4 items-center animate-fade-in">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-primary font-bold text-lg">₹{item.price.toFixed(2)}</p>
                </div>
                
                {cartItem ? (
                  <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 bg-white rounded-lg shadow-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-4 text-center">{cartItem.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 bg-primary text-white rounded-lg shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addItem({ ...item, quantity: 1 }, id)}
                    className="p-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    ADD
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Cart Button */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg z-20 px-6"
          >
            <button 
              onClick={() => router.push('/cart')}
              className="w-full btn-primary h-16 shadow-2xl premium-shadow"
            >
              <div className="flex items-center justify-between w-full px-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs opacity-80">{items.length} Items</p>
                    <p className="text-lg font-bold">View Cart</p>
                  </div>
                </div>
                <span className="text-xl font-bold">₹{total.toFixed(2)}</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
