"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Check, Package, ChefHat, Truck, Home as HomeIcon, MapPin, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STEPS = [
  { status: "Ordered", icon: Package, label: "Order Placed" },
  { status: "Accepted", icon: Check, label: "Accepted" },
  { status: "Preparing", icon: ChefHat, label: "Preparing" },
  { status: "Out for Delivery", icon: Truck, label: "On the Way" },
  { status: "Delivered", icon: HomeIcon, label: "Delivered" },
];

export default function OrderTracking() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="p-6 skeleton min-h-screen" />;
  if (!order) return <div className="p-6">Order not found</div>;

  const currentStepIndex = STATUS_STEPS.findIndex(step => step.status === order.status);
  const isOutForDelivery = order.status === "Out for Delivery";
  const isDelivered = order.status === "Delivered";

  return (
    <div className="min-h-screen bg-white animate-fade-in pb-12">
      <header className="p-6 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="p-2 border border-border rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase font-bold tracking-widest">Order ID</p>
          <p className="font-bold text-sm">#{order.id.slice(-6).toUpperCase()}</p>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="px-6 py-4 max-w-lg mx-auto">
        {/* Status Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Order Status</h1>
          <p className="text-primary text-2xl font-black uppercase tracking-tighter">
            {STATUS_STEPS[currentStepIndex]?.label ?? order.status}
          </p>
        </div>

        {/* OTP Card — shown when Out for Delivery or Delivered */}
        <AnimatePresence>
          {(isOutForDelivery || isDelivered) && order.deliveryOtp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-8 rounded-3xl p-6 border-2 text-center relative overflow-hidden ${
                isDelivered
                  ? "bg-green-50 border-green-200"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-pink-400" />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                isDelivered ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
              }`}>
                <ShieldCheck size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                {isDelivered ? "Delivery Verified ✓" : "Delivery OTP — Share with delivery person"}
              </p>
              <div className="flex justify-center gap-3 mt-2">
                {order.deliveryOtp.split("").map((digit: string, i: number) => (
                  <div
                    key={i}
                    className={`w-14 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm ${
                      isDelivered
                        ? "bg-green-100 text-green-700"
                        : "bg-white text-primary border border-primary/20 shadow-lg shadow-primary/10"
                    }`}
                  >
                    {digit}
                  </div>
                ))}
              </div>
              {!isDelivered && (
                <p className="text-xs text-text-muted mt-4">
                  Show this OTP to the delivery person to confirm receipt
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Tracker */}
        <div className="space-y-8 relative">
          <div className="absolute left-[21px] top-4 bottom-4 w-1 bg-gray-100 z-0" />
          <div
            className="absolute left-[21px] top-4 w-1 bg-primary z-0 transition-all duration-1000"
            style={{ height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIndex;
            const isActive = idx === currentStepIndex;
            return (
              <div key={step.status} className="flex gap-6 items-center relative z-10">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border-4 border-gray-100 text-gray-300"
                }`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className={`font-bold transition-all ${isActive ? "text-xl text-text-main" : "text-text-muted"}`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-text-muted mt-1"
                    >
                      {step.status === "Preparing" ? "Chef is preparing your order" :
                       step.status === "Out for Delivery" ? "Your order is on its way!" :
                       step.status === "Delivered" ? "Enjoy your meal! 🎉" :
                       "We've received your order"}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Details Card */}
        <div className="mt-12 bg-gray-50 rounded-3xl p-6 border border-border">
          <h2 className="font-bold mb-4">Delivery Address</h2>
          <div className="flex gap-3 text-text-muted">
            <MapPin size={18} className="text-primary shrink-0" />
            <p className="text-sm">{order.address}</p>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
            <div>
              <p className="text-xs text-text-muted">Total Amount</p>
              <p className="text-xl font-bold">₹{order.totalAmount?.toFixed(2)}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
              isDelivered ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
            }`}>
              {order.status}
            </div>
          </div>
        </div>

        {/* Back to Home action when delivered */}
        {isDelivered && (
          <button 
            onClick={() => router.push('/')}
            className="w-full mt-8 btn-primary h-14 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
