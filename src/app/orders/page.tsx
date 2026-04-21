"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Package, ChevronRight, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import BottomNav from "@/components/BottomNav";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const fetchedOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort locally to prevent requiring a Firestore composite index
        fetchedOrders.sort((a: any, b: any) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeB - timeA;
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6">
        <div className="h-8 w-32 skeleton rounded" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <header className="p-6 bg-white sticky top-0 z-10 flex items-center gap-4 border-b border-border shadow-sm">
        <h1 className="text-xl font-bold">My Orders</h1>
      </header>

      <div className="p-6 space-y-4 max-w-xl mx-auto">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
              <Package size={32} className="text-gray-300" />
            </div>
            <p className="text-text-muted">No orders found. Cravings await!</p>
            <button onClick={() => router.push('/')} className="text-primary font-bold mt-4">Start Ordering</button>
          </div>
        ) : (
          orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => router.push(`/order/${order.id}`)}
              className="bg-white p-5 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{order.status}</p>
                  </div>
                  <h3 className="font-bold">Order #{order.id.slice(-6).toUpperCase()}</h3>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{order.totalAmount?.toFixed(2)}</p>
                  <p className="text-[10px] text-text-muted font-medium">{new Date(order.timestamp?.toDate()).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-text-muted text-xs mb-3">
                <MapPin size={12} className="text-primary" />
                <span className="truncate">{order.address}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <p className="text-[10px] text-text-muted font-bold uppercase">{order.items?.length} Items</p>
                <div className="flex items-center gap-1 text-primary text-xs font-bold">
                  Track Order <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav activeTab="orders" />
    </div>
  );
}
