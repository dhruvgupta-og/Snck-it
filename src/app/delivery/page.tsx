"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bike, MapPin, ShieldCheck, LogOut, Package, CheckCircle, Phone, User } from "lucide-react";
import toast from "react-hot-toast";

type Order = {
  id: string;
  address: string;
  status: string;
  totalAmount: number;
  items: any[];
  deliveryOtp: string;
  customerName?: string;
  customerPhone?: string;
  timestamp?: any;
};

export default function DeliveryPanel() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("delivery_auth");
    setIsAuthorized(auth === "true");
  }, []);

  // Real-time orders listener — all orders sorted newest first
  useEffect(() => {
    if (!isAuthorized) return;
    const unsub = onSnapshot(
      collection(db, "orders"),
      (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        const sorted = all.sort(
          (a, b) => (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0)
        );
        setOrders(sorted);
      },
      (error) => {
        console.error("Firestore error:", error);
        toast.error("Could not load orders. Check connection.");
      }
    );
    return () => unsub();
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === process.env.NEXT_PUBLIC_DELIVERY_PASS) {
      localStorage.setItem("delivery_auth", "true");
      setIsAuthorized(true);
      toast.success("Welcome, delivery partner! 🚴");
    } else {
      toast.error("Wrong PIN. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("delivery_auth");
    setIsAuthorized(false);
    setPin("");
  };

  const openVerify = (order: Order) => {
    setActiveOrder(order);
    setOtpInput("");
    setOtpError(false);
  };

  const verifyAndDeliver = async () => {
    if (!activeOrder) return;
    setVerifying(true);
    try {
      if (otpInput === activeOrder.deliveryOtp) {
        await updateDoc(doc(db, "orders", activeOrder.id), { status: "Delivered" });
        toast.success("✅ Delivery confirmed!");
        setActiveOrder(null);
      } else {
        setOtpError(true);
        toast.error("Wrong OTP — ask customer to check their app.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // ── Loading ────────────────────────────────────────────
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Login Screen ───────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-6">
        <div className="max-w-sm w-full bg-white p-10 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Bike size={40} strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Delivery Portal</h1>
            <p className="text-sm text-text-muted">Enter your delivery PIN to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Delivery PIN</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="••••••••"
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-amber-300 focus:bg-white outline-none transition-all text-center text-2xl font-bold tracking-widest placeholder:text-gray-300 placeholder:text-lg placeholder:tracking-normal"
              />
            </div>
            <button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-2xl shadow-lg shadow-amber-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Bike size={20} /> Start Delivery Shift
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main Panel ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <Bike size={20} />
            </div>
            <div>
              <h1 className="font-black text-base leading-none">Delivery Board</h1>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Snack It</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl">
              {orders.filter(o => o.status === "Out for Delivery").length} Active
            </span>
            <button onClick={handleLogout} className="p-2 text-text-muted hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm text-center">
            <p className="text-xl font-black text-amber-500">{orders.filter(o => o.status === "Out for Delivery").length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">On the Way</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm text-center">
            <p className="text-xl font-black text-blue-500">{orders.filter(o => o.status === "Ordered" || o.status === "Accepted" || o.status === "Preparing").length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">Upcoming</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm text-center">
            <p className="text-xl font-black text-green-500">{orders.filter(o => o.status === "Delivered").length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">Delivered</p>
          </div>
        </div>

        {/* All Orders */}
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-text-muted">No orders yet</p>
            <p className="text-xs text-text-muted mt-1">New orders will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const isOutForDelivery = order.status === "Out for Delivery";
              const isDelivered = order.status === "Delivered";
              const statusColor =
                isDelivered ? "bg-green-50 text-green-600 border-green-100" :
                isOutForDelivery ? "bg-amber-50 text-amber-600 border-amber-200" :
                order.status === "Preparing" ? "bg-orange-50 text-orange-600 border-orange-100" :
                order.status === "Accepted" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                "bg-blue-50 text-blue-600 border-blue-100";

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
                    isOutForDelivery ? "border-amber-200" : isDelivered ? "border-green-100 opacity-60" : "border-border"
                  }`}
                >
                  {/* Order Header */}
                  <div className={`px-5 py-3 flex items-center justify-between border-b ${
                    isOutForDelivery ? "bg-amber-50 border-amber-100" : isDelivered ? "bg-green-50 border-green-100" : "bg-gray-50 border-border"
                  }`}>
                    <div className="flex items-center gap-2">
                      {isOutForDelivery && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                      {isDelivered && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                      {!isOutForDelivery && !isDelivered && <span className="w-2 h-2 bg-gray-300 rounded-full" />}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${statusColor}`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs font-black text-text-muted">#{order.id.slice(-6).toUpperCase()}</span>
                  </div>

                  {/* Order Body */}
                  <div className="p-5">
                    {/* Customer Info & Call Button */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight text-text-main">{order.customerName || "Customer"}</p>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{order.customerPhone || "No Phone"}</p>
                        </div>
                      </div>
                      
                      {order.customerPhone && (
                        <a 
                          href={`tel:${order.customerPhone}`}
                          className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0"
                          title="Call Customer"
                        >
                          <Phone size={18} />
                        </a>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-4">
                      <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-text-main">{order.address}</p>
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-text-main">
                              {item.quantity}× {item.name}
                            </span>
                            <span className="text-text-muted font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                        <div className="pt-1 mt-1 border-t border-border flex justify-between text-xs font-black">
                          <span>Total</span>
                          <span className="text-primary">₹{order.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Verify Button — only for Out for Delivery */}
                    {isOutForDelivery && (
                      <button
                        onClick={() => openVerify(order)}
                        className="w-full h-11 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-xl shadow-md shadow-amber-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <ShieldCheck size={16} /> Verify OTP & Mark Delivered
                      </button>
                    )}
                    {isDelivered && (
                      <div className="w-full h-10 bg-green-50 text-green-600 font-black rounded-xl flex items-center justify-center gap-2 text-sm">
                        <CheckCircle size={16} /> Delivered ✓
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Verify Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">🔐</div>
              <h2 className="text-xl font-black mb-1">Customer OTP</h2>
              <p className="text-sm text-text-muted">
                Ask the customer at <span className="font-bold text-text-main">{activeOrder.address.slice(0, 30)}…</span> for their OTP
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block text-center">Enter 4-Digit OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="0000"
                  value={otpInput}
                  autoFocus
                  onChange={e => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError(false); }}
                  className={`w-full text-center text-4xl font-black p-5 rounded-2xl border-2 outline-none tracking-[1rem] transition-all ${
                    otpError
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-border focus:border-amber-400 bg-gray-50"
                  }`}
                />
                {otpError && (
                  <p className="text-red-500 text-xs font-bold text-center mt-2">❌ Wrong OTP — try again</p>
                )}
              </div>

              <button
                onClick={verifyAndDeliver}
                disabled={otpInput.length !== 4 || verifying}
                className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-2xl shadow-lg shadow-amber-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShieldCheck size={20} /> Confirm Delivery</>
                )}
              </button>

              <button
                onClick={() => setActiveOrder(null)}
                className="w-full py-3 text-text-muted text-sm font-bold hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
