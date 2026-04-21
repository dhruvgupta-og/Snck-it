"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Store, GraduationCap, Utensils, LogOut, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  const [adminStats, setAdminStats] = useState({
    activeStores: 0,
    totalOrders: 0,
    newUsers: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (!isAuthorized) return;
    const fetchStats = async () => {
      try {
        const [storesSnap, ordersSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, "stores"), where("isActive", "==", true))),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "users"))
        ]);

        let revenue = 0;
        ordersSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.status === "Delivered" && data.totalAmount) {
            revenue += data.totalAmount;
          }
        });

        setAdminStats({
          activeStores: storesSnap.size,
          totalOrders: ordersSnap.size,
          newUsers: usersSnap.size,
          revenue
        });
      } catch (err) {
        console.error("Stats Error:", err);
      }
    };
    fetchStats();
  }, [isAuthorized]);
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") setIsAuthorized(true);
    else setIsAuthorized(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      credentials.user === process.env.NEXT_PUBLIC_ADMIN_USER &&
      credentials.pass === process.env.NEXT_PUBLIC_ADMIN_PASS
    ) {
      localStorage.setItem("admin_auth", "true");
      setIsAuthorized(true);
      toast.success("Welcome back, Admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthorized(false);
    toast.success("Logged out from Admin");
  };

  if (isAuthorized === null) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] border border-border shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Store size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-text-main mb-2">Admin Login</h1>
            <p className="text-sm text-text-muted">Enter your secure credentials to manage Snack It</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Admin User ID</label>
              <input
                type="text"
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                placeholder="Enter ID..."
                value={credentials.user}
                onChange={e => setCredentials({ ...credentials, user: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Secret Password</label>
              <input
                type="password"
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                placeholder="••••••••"
                value={credentials.pass}
                onChange={e => setCredentials({ ...credentials, pass: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary h-14 mt-6 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
              Verify Identity
            </button>
            <button type="button" onClick={() => router.push('/')} className="w-full py-3 text-sm font-bold text-text-muted hover:text-text-main transition-colors">
              Back to Storefront
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "orders", label: "Orders", icon: Utensils },
    { id: "colleges", label: "Colleges", icon: GraduationCap },
    { id: "stores", label: "Stores", icon: Store },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-r border-border shrink-0 z-20 sticky top-0 lg:h-screen">
        <div className="p-6 flex lg:flex-col justify-between h-full">
          <div className="flex items-center gap-3 lg:mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Store size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Admin Console</h1>
              <p className="text-[10px] text-text-muted font-bold uppercase hidden lg:block tracking-widest leading-none">Snack It Dashboard</p>
            </div>
          </div>
          <nav className="hidden lg:flex flex-col gap-2 flex-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSelectedStoreId(null); }}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id ? "bg-primary text-white shadow-[0_8px_30px_rgb(255,75,43,0.3)] scale-105" : "text-text-muted hover:bg-gray-50 hover:scale-105"}`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <button onClick={handleAdminLogout} className="lg:mt-auto p-4 flex items-center gap-3 text-text-muted font-bold text-sm hover:text-red-500 transition-colors">
            <LogOut size={20} />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md p-6 lg:px-10 border-b border-border sticky top-0 z-10 flex lg:hidden justify-between items-center">
          <p className="font-bold text-primary capitalize">{activeTab}</p>
        </header>

        <div className="max-w-6xl mx-auto p-6 lg:p-10">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            {[
              { label: "Active Stores", value: adminStats.activeStores.toString(), color: "text-primary" },
              { label: "Total Orders", value: adminStats.totalOrders.toString(), color: "text-amber-500" },
              { label: "New Users", value: `+${adminStats.newUsers}`, color: "text-green-500" },
              { label: "Revenue", value: `₹${adminStats.revenue.toLocaleString('en-IN')}`, color: "text-blue-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-border shadow-sm hover:border-primary/20 transition-all">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden flex gap-3 mb-8">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSelectedStoreId(null); }}
                  className={`flex-1 p-4 rounded-3xl flex flex-col items-center gap-2 transition-all ${activeTab === item.id ? "bg-primary text-white shadow-[0_8px_30px_rgb(255,75,43,0.3)] scale-105" : "bg-white text-text-muted border border-border hover:bg-gray-50 hover:scale-105"}`}
                >
                  <Icon size={20} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="animate-fade-in">
            {activeTab === "orders" && <OrdersList />}
            {activeTab === "colleges" && <CollegesManager />}
            {activeTab === "stores" && (
              selectedStoreId
                ? <MenuItemsManager storeId={selectedStoreId} onBack={() => setSelectedStoreId(null)} />
                : <StoresManager onSelectStore={setSelectedStoreId} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Orders List ────────────────────────────────────────────────────────────
function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [otpModal, setOtpModal] = useState<{ orderId: string; correctOtp: string } | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const snap = await getDocs(collection(db, "orders"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list.sort((a: any, b: any) => (b.timestamp?.toMillis() ?? 0) - (a.timestamp?.toMillis() ?? 0)));
    };
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", id), { status: newStatus });
    toast.success(`Order marked: ${newStatus}`);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const openOtpModal = (order: any) => {
    setOtpInput("");
    setOtpError(false);
    setOtpModal({ orderId: order.id, correctOtp: order.deliveryOtp });
  };

  const verifyAndDeliver = async () => {
    if (!otpModal) return;
    if (otpInput === otpModal.correctOtp) {
      await updateDoc(doc(db, "orders", otpModal.orderId), { status: "Delivered" });
      toast.success("✅ Order delivered & verified!");
      setOrders(prev => prev.map(o => o.id === otpModal.orderId ? { ...o, status: "Delivered" } : o));
      setOtpModal(null);
    } else {
      setOtpError(true);
      toast.error("Wrong OTP — ask the customer to check their tracking page.");
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!order.timestamp) return true;
    const date = new Date(order.timestamp.toMillis());
    if (filterDate) {
      if (date.toDateString() !== new Date(filterDate).toDateString()) return false;
    }
    if (filterMonth) {
      const [y, m] = filterMonth.split("-");
      if (date.getFullYear() !== parseInt(y) || (date.getMonth() + 1) !== parseInt(m)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-border flex flex-wrap gap-4 items-end shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Specific Date</label>
          <input
            type="date"
            className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:border-primary/20 outline-none text-sm"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setFilterMonth(""); }}
          />
        </div>
        <div className="space-y-1.5 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">By Month</label>
          <input
            type="month"
            className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:border-primary/20 outline-none text-sm"
            value={filterMonth}
            onChange={e => { setFilterMonth(e.target.value); setFilterDate(""); }}
          />
        </div>
        <button
          onClick={() => { setFilterDate(""); setFilterMonth(""); }}
          className="p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center text-text-muted bg-white rounded-3xl border border-dashed border-border font-medium">
            No orders found for the selected period
          </div>
        ) : filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold">Order #{order.id.slice(-6).toUpperCase()}</p>
                <p className="text-[10px] text-text-muted font-bold mb-1">
                  {order.timestamp ? new Date(order.timestamp.toMillis()).toLocaleString() : "Recent"}
                </p>
                <p className="text-xs text-text-muted">{order.address}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  order.status === "Ordered" ? "bg-blue-50 text-blue-500" :
                  order.status === "Accepted" ? "bg-indigo-50 text-indigo-500" :
                  order.status === "Preparing" ? "bg-amber-50 text-amber-500" :
                  order.status === "Out for Delivery" ? "bg-orange-50 text-orange-500" :
                  "bg-green-50 text-green-500"
                }`}>{order.status}</span>
                <p className="text-sm font-bold text-primary">₹{order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
              <button
                onClick={() => updateStatus(order.id, "Accepted")}
                className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${order.status === "Accepted" ? "bg-indigo-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] scale-105" : "bg-gray-50 text-text-muted hover:bg-gray-100"}`}
              >Accept</button>
              <button
                onClick={() => updateStatus(order.id, "Preparing")}
                className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${order.status === "Preparing" ? "bg-amber-500 text-white shadow-[0_4px_15px_rgba(245,158,11,0.4)] scale-105" : "bg-gray-50 text-text-muted hover:bg-gray-100"}`}
              >Prepare</button>
              <button
                onClick={() => updateStatus(order.id, "Out for Delivery")}
                className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${order.status === "Out for Delivery" ? "bg-orange-500 text-white shadow-[0_4px_15px_rgba(249,115,22,0.4)] scale-105" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
              >On the Way</button>
              <button
                onClick={() => openOtpModal(order)}
                disabled={order.status === "Delivered"}
                className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${order.status === "Delivered" ? "bg-green-500 text-white shadow-[0_4px_15px_rgba(34,197,94,0.4)] scale-105 cursor-default" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
              >{order.status === "Delivered" ? "✓ Delivered" : "Deliver 🔐"}</button>
            </div>
          </div>
        ))}
      </div>

      {/* OTP Verification Modal */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-pink-400" />
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">🔐</div>
              <h2 className="text-xl font-black mb-1">Verify Delivery OTP</h2>
              <p className="text-sm text-text-muted">Ask the customer for their 4-digit OTP shown on their tracking page</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Customer OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="0000"
                  value={otpInput}
                  autoFocus
                  onChange={e => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError(false); }}
                  className={`w-full text-center text-4xl font-black p-5 rounded-2xl border-2 outline-none tracking-[1rem] transition-all ${otpError ? "border-red-400 bg-red-50 text-red-600 animate-pulse" : "border-border focus:border-primary bg-gray-50"}`}
                />
                {otpError && <p className="text-red-500 text-xs font-bold text-center mt-2">❌ Wrong OTP — try again</p>}
              </div>
              <button
                onClick={verifyAndDeliver}
                disabled={otpInput.length !== 4}
                className="btn-primary h-14 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                ✅ Confirm Delivery
              </button>
              <button
                onClick={() => setOtpModal(null)}
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

// ─── Colleges Manager ────────────────────────────────────────────────────────
function CollegesManager() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    getDocs(collection(db, "colleges")).then(snap =>
      setColleges(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const addCollege = async () => {
    if (!newName) return;
    const ref = await addDoc(collection(db, "colleges"), { name: newName });
    setColleges([...colleges, { id: ref.id, name: newName }]);
    setNewName("");
    toast.success("College added");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-border">
        <h3 className="font-bold mb-3">Add New College</h3>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-50 rounded-xl outline-none"
            placeholder="College name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button onClick={addCollege} className="p-3 bg-primary text-white rounded-xl">
            <Plus size={20} />
          </button>
        </div>
      </div>
      {colleges.map(c => (
        <div key={c.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-border">
          <span className="font-medium">{c.name}</span>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
      ))}
    </div>
  );
}

// ─── Stores Manager ──────────────────────────────────────────────────────────
function StoresManager({ onSelectStore }: { onSelectStore: (id: string) => void }) {
  const [stores, setStores] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [newStore, setNewStore] = useState({ name: "", collegeId: "", category: "Canteen", image: "" });

  useEffect(() => {
    Promise.all([getDocs(collection(db, "stores")), getDocs(collection(db, "colleges"))]).then(
      ([storeSnap, collegeSnap]) => {
        setStores(storeSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setColleges(collegeSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );
  }, []);

  const addStore = async () => {
    if (!newStore.name || !newStore.collegeId) { toast.error("Fill in name and college"); return; }
    const ref = await addDoc(collection(db, "stores"), {
      ...newStore,
      isActive: true,
      rating: 4.5,
      deliveryTime: "15-20 min",
      image: newStore.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop",
    });
    setStores([...stores, { id: ref.id, ...newStore }]);
    setNewStore({ name: "", collegeId: "", category: "Canteen", image: "" });
    toast.success("Store added");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-border">
        <h3 className="font-bold mb-4">Add Store</h3>
        <div className="space-y-3">
          <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-primary/20" placeholder="Store name" value={newStore.name} onChange={e => setNewStore({ ...newStore, name: e.target.value })} />
          <select className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-primary/20" value={newStore.collegeId} onChange={e => setNewStore({ ...newStore, collegeId: e.target.value })}>
            <option value="">Select College</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-primary/20" placeholder="Image URL (optional)" value={newStore.image} onChange={e => setNewStore({ ...newStore, image: e.target.value })} />
          <button onClick={addStore} className="btn-primary"><Plus size={20} /> Save Store</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {stores.map(store => (
          <div key={store.id} onClick={() => onSelectStore(store.id)} className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between cursor-pointer hover:border-primary transition-colors">
            <div>
              <p className="font-bold">{store.name}</p>
              <p className="text-xs text-text-muted">{store.category} • {colleges.find(c => c.id === store.collegeId)?.name || "Unknown"}</p>
            </div>
            <ChevronRight size={18} className="text-text-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Menu Items Manager ──────────────────────────────────────────────────────
function MenuItemsManager({ storeId, onBack }: { storeId: string; onBack: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", image: "" });

  useEffect(() => {
    getDocs(query(collection(db, "menuItems"), where("storeId", "==", storeId))).then(snap =>
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [storeId]);

  const addItem = async () => {
    if (!newItem.name || !newItem.price) { toast.error("Fill in name and price"); return; }
    const itemData = {
      storeId,
      name: newItem.name,
      price: parseFloat(newItem.price),
      availability: true,
      image: newItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop",
    };
    const ref = await addDoc(collection(db, "menuItems"), itemData);
    setItems([...items, { id: ref.id, ...itemData }]);
    setNewItem({ name: "", price: "", image: "" });
    toast.success("Item added");
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm font-bold text-primary flex items-center gap-1">
        <ChevronRight size={16} className="rotate-180" /> Back to Stores
      </button>
      <div className="bg-white p-6 rounded-3xl border border-border">
        <h3 className="font-bold mb-4">Add Menu Item</h3>
        <div className="space-y-3">
          <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none" placeholder="Item name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
          <input type="number" className="w-full p-4 bg-gray-50 rounded-xl outline-none" placeholder="Price (₹)" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
          <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none" placeholder="Image URL (optional)" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} />
          <button onClick={addItem} className="btn-primary"><Plus size={20} /> Add to Menu</button>
        </div>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-border">
            <span className="font-medium">{item.name}</span>
            <span className="font-bold text-primary">₹{item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
