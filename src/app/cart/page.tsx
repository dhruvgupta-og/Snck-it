"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Trash2, MapPin, ChevronRight, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { items, updateQuantity, total, activeStoreId, clearCart } = useCart();
  
  const [address, setAddress] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (items.length === 0) return;

    setIsPlacing(true);
    try {
      // Generate a 4-digit OTP for delivery verification
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const orderData = {
        userId: profile?.uid,
        customerName: profile?.name || "Customer",
        customerPhone: profile?.phone || "",
        collegeId: profile?.collegeId,
        storeId: activeStoreId,
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        address,
        status: "Ordered",
        deliveryOtp,
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order/${docRef.id}`);
    } catch (error) {
      toast.error("Failed to place order. Try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center mb-8">
          <Trash2 size={48} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-text-muted mb-10">Looks like you haven't added anything yet.</p>
        <button onClick={() => router.push('/')} className="btn-primary w-64">
          Start Ordering
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 animate-fade-in">
      <header className="p-6 bg-white sticky top-0 z-10 flex items-center border-b border-border">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-text-main">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Your Cart</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-primary font-bold">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm min-w-[12px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery Details */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4 text-primary font-bold">
              <MapPin size={18} />
              <h2>Delivery Details</h2>
            </div>
            <p className="text-xs text-text-muted mb-2 uppercase font-bold tracking-wider">Select Campus Location</p>
            <textarea 
              placeholder="e.g. North Campus Library, Desk 42..."
              className="w-full p-4 bg-gray-50 rounded-xl border border-border focus:border-primary outline-none transition-all resize-none h-24"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-3">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Delivery Fee</span>
              <span className="font-bold">FREE</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-dashed border-border">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-xl text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-border z-20 shadow-2xl">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handlePlaceOrder}
            disabled={isPlacing}
            className="btn-primary h-14 w-full shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
          {isPlacing ? "Processing..." : "Place Order"}
          <div className="ml-auto flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">₹{total.toFixed(2)}</span>
            <ChevronRight size={20} />
          </div>
        </button>
      </div>
    </div>
  </div>
);
}
