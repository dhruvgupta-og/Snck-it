"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem, storeId: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  activeStoreId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const addItem = (item: CartItem, storeId: string) => {
    if (activeStoreId && activeStoreId !== storeId) {
      toast.error("You can only order from one store at a time. Clear cart first?");
      return;
    }

    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      setActiveStoreId(storeId);
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== id);
      if (filtered.length === 0) setActiveStoreId(null);
      return filtered;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => {
      const updated = prev.map(i => {
        if (i.id === id) {
          const newQty = Math.max(0, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      }).filter(i => i.quantity > 0);
      
      if (updated.length === 0) setActiveStoreId(null);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setActiveStoreId(null);
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, activeStoreId }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
