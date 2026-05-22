// app/(main)/admin/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faArrowLeft,
  faChartLine,
  faClipboardList,
  faWarehouse,
  faSpinner,
  faCheck,
  faTimes,
  faEdit,
  faSave,
  faDollarSign,
  faBoxes,
  faUsers,
  faEye,
  faChevronDown,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  checkAdminRoleAction,
  fetchAdminOrdersAction,
  updateOrderStatusAction,
  fetchAdminInventoryAction,
  updateProductStockAction,
  addNewProductAction
} from "@/app/actions/admin";

// Cinematic Reveal Wrapper
function CinematicReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { t, theme } = useTheme();
  const router = useRouter();

  // Authentication & Access state
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Active Tab: "analytics" | "orders" | "inventory"
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory">("analytics");

  // Core Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [laptops, setLaptops] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // UI Interactive States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [inventoryType, setInventoryType] = useState<"laptop" | "hardware">("laptop");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);
  const [updatingOrderStatusId, setUpdatingOrderStatusId] = useState<string | null>(null);
  
  // Search / Filter
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");

  // Add Product Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<"laptop" | "hardware">("laptop");
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    tagline: "",
    price: 0,
    original_price: 0,
    discount_price: 0,
    category: "",
    sub_category: "",
    stock: 10,
    images: "",
    description: "",
    badge: "none",
    is_deal: false,
    is_new: false,
    specs: "",
    technical_metadata: "",
    color_variants: "[]"
  });

  // 1. Check permissions on mount
  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await checkAdminRoleAction();
        setIsAdmin(res.isAdmin);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAccess();
  }, []);

  // 2. Fetch Data if authorized
  useEffect(() => {
    if (!isAdmin) return;

    async function loadAdminData() {
      setLoadingData(true);
      try {
        const [ordersRes, inventoryRes] = await Promise.all([
          fetchAdminOrdersAction(),
          fetchAdminInventoryAction()
        ]);

        if (ordersRes.success && ordersRes.orders) {
          setOrders(ordersRes.orders);
        }
        if (inventoryRes.success) {
          setLaptops(inventoryRes.laptops || []);
          setHardware(inventoryRes.hardware || []);
        }
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadAdminData();
  }, [isAdmin]);

  // 3. Auto-populate Form Defaults on Switch Type
  useEffect(() => {
    if (addType === "laptop") {
      setFormData({
        name: "",
        brand: "",
        tagline: "Experience peak gaming performance.",
        price: 1500,
        original_price: 1800,
        discount_price: 0,
        category: "Gaming",
        sub_category: "rtx-40-series",
        stock: 10,
        images: "",
        description: "",
        badge: "none",
        is_deal: false,
        is_new: false,
        specs: JSON.stringify([
          { "label": "CPU", "value": "Intel Core i7-13700H", "color": "cyan" },
          { "label": "GPU", "value": "NVIDIA RTX 4060", "color": "green" },
          { "label": "RAM", "value": "16GB DDR5", "color": "blue" }
        ], null, 2),
        technical_metadata: JSON.stringify({
          "cpu_brand": "intel",
          "gpu_brand": "nvidia",
          "ram_gb": 16,
          "storage_gb": 512
        }, null, 2),
        color_variants: JSON.stringify([
          { "name": "Midnight Black", "hex": "#0a0a0a" }
        ], null, 2)
      });
    } else {
      setFormData({
        name: "",
        brand: "",
        tagline: "",
        price: 350,
        original_price: 0,
        discount_price: 300,
        category: "CPU",
        sub_category: "",
        stock: 15,
        images: "",
        description: "",
        badge: "none",
        is_deal: false,
        is_new: true,
        specs: JSON.stringify({
          "socket": "AM5",
          "cores": "8 Cores",
          "threads": "16 Threads",
          "baseClock": "3.8 GHz"
        }, null, 2),
        technical_metadata: "",
        color_variants: "[]"
      });
    }
  }, [addType]);

  // Actions
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingOrderStatusId(orderId);
    try {
      const res = await updateOrderStatusAction(orderId, nextStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev: any) => prev ? { ...prev, status: nextStatus } : null);
        }
      } else {
        alert(res.error || "Failed to update status.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setUpdatingOrderStatusId(null);
    }
  };

  const handleUpdateStock = async (id: string, type: "laptop" | "hardware", newStock: number) => {
    setSavingStock(true);
    try {
      const res = await updateProductStockAction(id, type, newStock);
      if (res.success) {
        if (type === "laptop") {
          setLaptops(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
        } else {
          setHardware(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
        }
        setEditingStockId(null);
      } else {
        alert(res.error || "Failed to update stock.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setSavingStock(false);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      const payload: any = {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: formData.images,
        description: formData.description,
        is_deal: formData.is_deal,
        category: formData.category,
        specs: formData.specs
      };

      if (addType === "laptop") {
        payload.tagline = formData.tagline;
        payload.original_price = Number(formData.original_price || formData.price);
        payload.sub_category = formData.sub_category;
        payload.badge = formData.badge;
        payload.technical_metadata = formData.technical_metadata;
        payload.color_variants = formData.color_variants;
        payload.features = []; 
      } else {
        payload.discount_price = Number(formData.discount_price || 0);
        payload.is_new = formData.is_new;
      }

      const res = await addNewProductAction(addType, payload);
      if (res.success && res.data) {
        alert("Product added successfully!");
        if (addType === "laptop") {
          setLaptops(prev => [res.data, ...prev]);
        } else {
          setHardware(prev => [res.data, ...prev]);
        }
        setIsAddModalOpen(false);
      } else {
        alert(res.error || "Failed to add product.");
      }
    } catch (err) {
      alert("Submission error.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Calculations for Analytics
  const totalRevenue = orders
    .filter(o => o.status === "delivered" || o.status === "Delivered")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const activeUsersCount = Array.from(new Set(orders.map(o => o.customer_email))).length;

  const lowStockItemsCount = [...laptops, ...hardware].filter(item => item.stock < 5).length;

  // ----------------------------------------------------
  // 1. RENDER LOADING STATE
  // ----------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: t.bg }}>
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: t.accentText, borderTopColor: "transparent" }} />
        <p className="hf text-lg font-bold tracking-wider animate-pulse" style={{ color: t.text }}>SECURE SHIELD LINKING...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. RENDER ACCESS DENIED
  // ----------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: t.bg }}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "#ef4444" }} />
        
        <CinematicReveal>
          <div className="max-w-md w-full text-center border p-8 rounded-3xl backdrop-blur-xl relative z-10" style={{ background: t.cardBg, borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-red-500/10" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            
            <h1 className="hf text-2xl font-extrabold tracking-wider mb-3 uppercase" style={{ color: "#ef4444" }}>RESTRICTED SECTOR</h1>
            <p className="text-sm font-medium leading-relaxed mb-8" style={{ color: t.textSecondary }}>
              This domain is secured with role-based firewall settings. Unauthorized attempts are logged. 
              Please contact the systems administrator if this is an error.
            </p>

            <button 
              onClick={() => router.push("/")}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.text }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Return to Sanctuary
            </button>
          </div>
        </CinematicReveal>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. RENDER MAIN ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8 relative z-10" style={{ background: t.bg }}>
      
      {/* Header */}
      <CinematicReveal delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: t.borderLight }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ background: `${t.accentText}15`, color: t.accentText }}>
                SYSTEM ROOT ACCESS
              </span>
            </div>
            <h1 className="hf text-3xl font-extrabold tracking-tight" style={{ color: t.text }}>Sigma Command Center</h1>
            <p className="text-xs font-semibold mt-1" style={{ color: t.textSecondary }}>Manage live inventory, fulfill checkout requests, and monitor matrix metrics.</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex p-1.5 rounded-xl border backdrop-blur-md self-start md:self-center" style={{ background: t.cardBg, borderColor: t.borderLight }}>
            <button
              onClick={() => setActiveTab("analytics")}
              className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeTab === "analytics" ? t.accentText : "transparent",
                color: activeTab === "analytics" ? "#fff" : t.textSecondary
              }}
            >
              <FontAwesomeIcon icon={faChartLine} /> Analytics
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeTab === "orders" ? t.accentText : "transparent",
                color: activeTab === "orders" ? "#fff" : t.textSecondary
              }}
            >
              <FontAwesomeIcon icon={faClipboardList} /> Orders HUD
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeTab === "inventory" ? t.accentText : "transparent",
                color: activeTab === "inventory" ? "#fff" : t.textSecondary
              }}
            >
              <FontAwesomeIcon icon={faWarehouse} /> Inventory
            </button>
          </div>
        </div>
      </CinematicReveal>

      {/* Global Data Fetch Loading Indicator */}
      {loadingData && (
        <div className="flex items-center justify-center p-8 rounded-3xl border border-dashed animate-pulse" style={{ background: t.cardBg, borderColor: t.borderLight }}>
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg mr-3" style={{ color: t.accentText }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: t.textSecondary }}>SYNCING LIVE MATRIX DATA...</span>
        </div>
      )}

      {!loadingData && (
        <AnimatePresence mode="wait">
          {/* TAB 1: ANALYTICS */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {/* Stat Cards */}
              <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-4 gap-6">
                {[
                  { label: "Total Matrix Revenue", value: `$${totalRevenue.toLocaleString()}`, desc: "From completed orders", icon: faDollarSign, color: "#10b981" },
                  { label: "Active Orders", value: orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length.toString(), desc: "Needs fulfillment", icon: faClipboardList, color: "#3b82f6" },
                  { label: "Matrix Users", value: activeUsersCount.toString(), desc: "Unique buyer accounts", icon: faUsers, color: "#a855f7" },
                  { label: "Critical Stock Warning", value: lowStockItemsCount.toString(), desc: "Products under 5 units", icon: faBoxes, color: "#f59e0b" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>{stat.label}</p>
                        <h3 className="hf text-2xl font-extrabold" style={{ color: t.text }}>{stat.value}</h3>
                      </div>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <FontAwesomeIcon icon={stat.icon} />
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: t.textSecondary }}>{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Status breakdown & recent logs */}
              <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <h3 className="hf text-lg font-bold mb-4" style={{ color: t.text }}>Order Dispatch Matrix</h3>
                <div className="flex flex-col gap-3 flex-grow justify-center">
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map(status => {
                    const count = orders.filter(o => o.status.toLowerCase() === status).length;
                    const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    
                    let barColor = t.accentText;
                    if (status === "delivered") barColor = "#10b981";
                    if (status === "cancelled") barColor = "#ef4444";
                    if (status === "processing") barColor = "#f59e0b";
                    if (status === "shipped") barColor = "#06b6d4";

                    return (
                      <div key={status} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-bold uppercase">
                          <span style={{ color: t.textSecondary }}>{status}</span>
                          <span style={{ color: t.text }}>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: barColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Analytics Inventory Warning */}
              <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <h3 className="hf text-lg font-bold mb-4" style={{ color: t.text }}>Inventory Depot Status</h3>
                <div className="max-h-[220px] overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin">
                  {[...laptops, ...hardware].filter(item => item.stock < 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: t.borderLight, background: t.bgSecondary }}>
                      <div>
                        <p className="text-xs font-bold" style={{ color: t.text }}>{item.name}</p>
                        <p className="text-[10px] font-semibold" style={{ color: t.textSubtle }}>Brand: {item.brand}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase" style={{ background: item.stock === 0 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: item.stock === 0 ? "#ef4444" : "#f59e0b" }}>
                        {item.stock === 0 ? "Out of Stock" : `${item.stock} Units`}
                      </span>
                    </div>
                  ))}
                  {[...laptops, ...hardware].filter(item => item.stock < 5).length === 0 && (
                    <div className="text-center py-10">
                      <FontAwesomeIcon icon={faCheck} className="text-2xl mb-2" style={{ color: "#10b981" }} />
                      <p className="text-xs font-bold" style={{ color: t.textSecondary }}>Depot storage levels operating at optimum capacity.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ORDERS HUD */}
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              {/* Order Filtering Bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <input
                  type="text"
                  placeholder="Search orders by customer name, email or tracking..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  className="w-full sm:max-w-md px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none"
                  style={{
                    background: t.cardBg,
                    borderColor: t.borderLight,
                    color: t.text,
                  }}
                />
              </div>

              {/* Orders Table Layout */}
              <div className="border rounded-2xl overflow-hidden backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: t.borderLight, color: t.textSubtle }}>
                        <th className="py-4 px-6">Tracking ID</th>
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Total Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs font-medium" style={{ borderColor: t.borderLight }}>
                      {orders
                        .filter(o => 
                          o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                          o.customer_email.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                          o.tracking_number.toLowerCase().includes(orderSearchQuery.toLowerCase())
                        )
                        .map(order => {
                          let badgeBg = "rgba(168,85,247,0.1)";
                          let badgeText = "#a855f7";
                          if (order.status.toLowerCase() === "pending") { badgeBg = "rgba(148,163,184,0.1)"; badgeText = "#94a3b8"; }
                          else if (order.status.toLowerCase() === "processing") { badgeBg = "rgba(245,158,11,0.1)"; badgeText = "#f59e0b"; }
                          else if (order.status.toLowerCase() === "shipped") { badgeBg = "rgba(6,182,212,0.1)"; badgeText = "#06b6d4"; }
                          else if (order.status.toLowerCase() === "delivered") { badgeBg = "rgba(16,185,129,0.1)"; badgeText = "#10b981"; }
                          else if (order.status.toLowerCase() === "cancelled") { badgeBg = "rgba(239,68,68,0.1)"; badgeText = "#ef4444"; }

                          return (
                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>{order.tracking_number}</td>
                              <td className="py-4 px-6">
                                <p className="font-bold" style={{ color: t.text }}>{order.customer_name}</p>
                                <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>{order.customer_email}</p>
                              </td>
                              <td className="py-4 px-6" style={{ color: t.textSecondary }}>
                                {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>${order.total_amount.toLocaleString()}</td>
                              <td className="py-4 px-6">
                                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: badgeBg, color: badgeText }}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
                                <button 
                                  onClick={() => setSelectedOrder(order)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                                  style={{ borderColor: t.borderLight, color: t.text }}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                                
                                <div className="relative group">
                                  <button 
                                    className="px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-[10px] uppercase"
                                    style={{ borderColor: t.borderLight, color: t.textSecondary }}
                                  >
                                    Status <FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  <div className="absolute right-0 mt-1 w-32 rounded-xl border shadow-xl z-25 hidden group-hover:block" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                                    {["pending", "processing", "shipped", "delivered", "cancelled"].map(st => (
                                      <button
                                        key={st}
                                        onClick={() => handleUpdateOrderStatus(order.id, st)}
                                        className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5"
                                        style={{ color: order.status === st ? t.accentText : t.textSecondary }}
                                      >
                                        {st}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === "inventory" && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              {/* Filter & Subtabs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex p-1 rounded-xl border" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                  <button 
                    onClick={() => setInventoryType("laptop")}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: inventoryType === "laptop" ? t.accentText : "transparent",
                      color: inventoryType === "laptop" ? "#fff" : t.textSecondary
                    }}
                  >
                    Laptops
                  </button>
                  <button 
                    onClick={() => setInventoryType("hardware")}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: inventoryType === "hardware" ? t.accentText : "transparent",
                      color: inventoryType === "hardware" ? "#fff" : t.textSecondary
                    }}
                  >
                    Hardware Components
                  </button>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 self-start sm:self-auto shadow-lg"
                  style={{ background: t.accentText, color: "#fff", boxShadow: `0 4px 20px ${t.accentText}40` }}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add New Product
                </button>

                <input
                  type="text"
                  placeholder="Search products by name or brand..."
                  value={inventorySearchQuery}
                  onChange={e => setInventorySearchQuery(e.target.value)}
                  className="w-full sm:max-w-md px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none"
                  style={{
                    background: t.cardBg,
                    borderColor: t.borderLight,
                    color: t.text,
                  }}
                />
              </div>

              {/* Inventory Table */}
              <div className="border rounded-2xl overflow-hidden backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: t.borderLight, color: t.textSubtle }}>
                        <th className="py-4 px-6">Product ID</th>
                        <th className="py-4 px-6">Product details</th>
                        <th className="py-4 px-6">Brand</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Stock Status</th>
                        <th className="py-4 px-6 text-right">Fulfillment Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs font-medium" style={{ borderColor: t.borderLight }}>
                      {(inventoryType === "laptop" ? laptops : hardware)
                        .filter(item => 
                          item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
                          item.brand.toLowerCase().includes(inventorySearchQuery.toLowerCase())
                        )
                        .map(item => {
                          const isLow = item.stock < 5 && item.stock > 0;
                          const isOut = item.stock === 0;

                          return (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 font-mono font-bold" style={{ color: t.textSecondary }}>{item.id}</td>
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>{item.name}</td>
                              <td className="py-4 px-6" style={{ color: t.textSecondary }}>{item.brand}</td>
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>${item.price.toLocaleString()}</td>
                              <td className="py-4 px-6">
                                <span 
                                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                                  style={{ 
                                    background: isOut ? "rgba(239,68,68,0.1)" : isLow ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                                    color: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981"
                                  }}
                                >
                                  {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                {editingStockId === item.id ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <input 
                                      type="number"
                                      value={tempStockValue}
                                      onChange={e => setTempStockValue(parseInt(e.target.value) || 0)}
                                      className="w-16 px-2 py-1 rounded border text-center font-bold bg-black/40 text-white"
                                      style={{ borderColor: t.borderLight }}
                                    />
                                    <button 
                                      onClick={() => handleUpdateStock(item.id, inventoryType, tempStockValue)}
                                      className="w-7 h-7 rounded bg-green-500/10 hover:bg-green-500/20 text-green-500 flex items-center justify-center transition-all"
                                      disabled={savingStock}
                                    >
                                      {savingStock ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
                                    </button>
                                    <button 
                                      onClick={() => setEditingStockId(null)}
                                      className="w-7 h-7 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setEditingStockId(item.id);
                                      setTempStockValue(item.stock);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all text-[10px] ml-auto hover:bg-white/5"
                                    style={{ borderColor: t.borderLight, color: t.textSecondary }}
                                  >
                                    <FontAwesomeIcon icon={faEdit} className="text-[10px]" /> {item.stock} Units
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* DETAIL MODAL FOR ORDER DETAIL VIEW */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="max-w-2xl w-full rounded-3xl border p-6 sm:p-8 backdrop-blur-xl max-h-[90vh] overflow-y-auto flex flex-col gap-6"
              style={{ background: t.cardBg, borderColor: t.borderLight }}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>Order Detail View</span>
                  <h3 className="hf text-xl font-extrabold" style={{ color: t.text }}>{selectedOrder.tracking_number}</h3>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:bg-white/5"
                  style={{ borderColor: t.borderLight, color: t.text }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Split Detail Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Shipping info */}
                <div className="p-4 rounded-xl border flex flex-col gap-2" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>Shipping & Customer</p>
                  <p className="text-xs font-bold" style={{ color: t.text }}>{selectedOrder.customer_name}</p>
                  <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>Email: {selectedOrder.customer_email}</p>
                  <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>Phone: {selectedOrder.customer_phone}</p>
                  <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>City: {selectedOrder.shipping_city}</p>
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: t.textSecondary }}>Address: {selectedOrder.shipping_address}</p>
                </div>

                {/* Status & Method */}
                <div className="p-4 rounded-xl border flex flex-col gap-3 justify-between" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.textSubtle }}>Fulfillment Status</p>
                    <div className="relative inline-block w-full">
                      <select 
                        value={selectedOrder.status}
                        onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider outline-none bg-black/40 text-white"
                        style={{ borderColor: t.borderLight }}
                      >
                        {["pending", "processing", "shipped", "delivered", "cancelled"].map(status => (
                          <option key={status} value={status} className="bg-neutral-900 text-white">{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>Transaction Amount</p>
                    <p className="hf text-2xl font-black" style={{ color: t.text }}>${selectedOrder.total_amount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold" style={{ color: t.textSecondary }}>Method: {selectedOrder.payment_method}</p>
                  </div>
                </div>

              </div>

              {/* Items List */}
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.textSubtle }}>Ordered Items Matrix</p>
                <div className="flex flex-col gap-2">
                  {(selectedOrder.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                      <div>
                        <p className="text-xs font-bold" style={{ color: t.text }}>{item.product_name}</p>
                        <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>Type: {item.product_type} • Price: ${item.price.toLocaleString()}</p>
                      </div>
                      <span className="text-xs font-black" style={{ color: t.accentText }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD NEW PRODUCT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="max-w-3xl w-full rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl max-h-[92vh] overflow-y-auto flex flex-col gap-6 shadow-2xl relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              style={{ 
                background: theme === "dark" ? "rgba(20, 20, 20, 0.85)" : t.cardBg, 
                borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : t.borderLight,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              {/* Top ambient color bar for subtle cinematic accent */}
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${t.accentText}, #06b6d4)` }} />

              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div>
                  <h3 className="hf text-xl font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "#fff" : t.text }}>
                    Catalog New Hardware
                  </h3>
                  <p className="text-[11px] font-semibold mt-1" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    Insert structural metadata directly into live cloud matrices.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:bg-white/5 active:scale-95"
                  style={{ borderColor: "rgba(255, 255, 255, 0.1)", color: theme === "dark" ? "#fff" : t.text }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Form Container */}
              <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-6 text-xs font-bold">
                
                {/* Product Type Segmented Switch */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                    Database Target Table
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl border bg-black/40 backdrop-blur-md" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
                    <button 
                      type="button"
                      onClick={() => setAddType("laptop")}
                      className="py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300"
                      style={{
                        background: addType === "laptop" ? t.accentText : "transparent",
                        color: addType === "laptop" ? "#fff" : "rgba(255, 255, 255, 0.4)",
                        boxShadow: addType === "laptop" ? `0 0 15px ${t.accentText}30` : "none"
                      }}
                    >
                      Laptops Table
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAddType("hardware")}
                      className="py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300"
                      style={{
                        background: addType === "hardware" ? t.accentText : "transparent",
                        color: addType === "hardware" ? "#fff" : "rgba(255, 255, 255, 0.4)",
                        boxShadow: addType === "hardware" ? `0 0 15px ${t.accentText}30` : "none"
                      }}
                    >
                      Hardware Components
                    </button>
                  </div>
                </div>

                {/* Standard Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                      Product Name
                    </label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20" 
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                      placeholder="e.g. ROG Strix SCAR 16"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                      Brand
                    </label>
                    <input 
                      type="text" required
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20" 
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                      placeholder="e.g. Asus, Intel, AMD"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                      Retail Price ($)
                    </label>
                    <input 
                      type="number" required min="1"
                      value={formData.price || ""}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20 font-semibold" 
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                      placeholder="2499"
                    />
                  </div>
                  
                  {addType === "laptop" ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                        Original Price ($) <span className="text-[9px] lowercase opacity-65">(For discount calculations)</span>
                      </label>
                      <input 
                        type="number"
                        value={formData.original_price || ""}
                        onChange={e => setFormData({...formData, original_price: Number(e.target.value)})}
                        className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20 font-semibold" 
                        style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                        placeholder="2799"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                        Discount Price ($) <span className="text-[9px] lowercase opacity-65">(Deal price if active)</span>
                      </label>
                      <input 
                        type="number"
                        value={formData.discount_price || ""}
                        onChange={e => setFormData({...formData, discount_price: Number(e.target.value)})}
                        className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20 font-semibold" 
                        style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                        placeholder="2199"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                      Initial Stock Level
                    </label>
                    <input 
                      type="number" required min="0"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                      className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20 font-semibold" 
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                    />
                  </div>
                </div>

                {addType === "laptop" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                      Tagline / Catchphrase
                    </label>
                    <input 
                      type="text"
                      value={formData.tagline}
                      onChange={e => setFormData({...formData, tagline: e.target.value})}
                      className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20" 
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                      placeholder="Uncompromising speed for competitive gamers."
                    />
                  </div>
                )}

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                      Category Name
                    </label>
                    <input 
                      type="text" required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20" 
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                      placeholder={addType === "laptop" ? "gaming, business, ultrabooks" : "CPU, GPU, RAM, Storage"}
                    />
                  </div>
                  {addType === "laptop" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                        Subcategory ID
                      </label>
                      <input 
                        type="text"
                        value={formData.sub_category}
                        onChange={e => setFormData({...formData, sub_category: e.target.value})}
                        className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20" 
                        style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                        placeholder="rtx-40-series, amd-ryzen"
                      />
                    </div>
                  )}
                </div>

                {/* Media Links */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                    Product Images (URLs separated by comma)
                  </label>
                  <textarea 
                    rows={2} required
                    value={formData.images}
                    onChange={e => setFormData({...formData, images: e.target.value})}
                    className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none font-mono transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20 text-xs" 
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                    placeholder="https://example.com/img1.png, https://example.com/img2.png"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                    Detailed Product Description
                  </label>
                  <textarea 
                    rows={3} required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="px-4 py-3 rounded-xl border bg-white/[0.02] text-white outline-none leading-relaxed transition-all duration-300 focus:bg-white/[0.04] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-white/20" 
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                    placeholder="Describe the cinematic features and structural architectural highlights..."
                  />
                </div>

                {/* Advanced JSON Spec Editors styled like code IDE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                      HUD Visual Specifications (JSON Array/Object)
                    </label>
                    <textarea 
                      rows={5} required
                      value={formData.specs}
                      onChange={e => setFormData({...formData, specs: e.target.value})}
                      className="px-4 py-3 rounded-xl border bg-black/60 text-emerald-400 outline-none font-mono text-[10px] leading-relaxed transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 scrollbar-thin" 
                      style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  {addType === "laptop" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.textSecondary }}>
                        Technical Metadata (JSON Object)
                      </label>
                      <textarea 
                        rows={5} required
                        value={formData.technical_metadata}
                        onChange={e => setFormData({...formData, technical_metadata: e.target.value})}
                        className="px-4 py-3 rounded-xl border bg-black/60 text-emerald-400 outline-none font-mono text-[10px] leading-relaxed transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 scrollbar-thin" 
                        style={{ borderColor: "rgba(255,255,255,0.1)" }}
                      />
                    </div>
                  )}
                </div>

                {/* Switchable toggles */}
                <div className="flex gap-6 py-3 border-t border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "#fff" : t.text }}>
                    <input 
                      type="checkbox"
                      checked={formData.is_deal}
                      onChange={e => setFormData({...formData, is_deal: e.target.checked})}
                      className="rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Mark as Hot Deal</span>
                  </label>

                  {addType === "hardware" && (
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black uppercase tracking-wider" style={{ color: theme === "dark" ? "#fff" : t.text }}>
                      <input 
                        type="checkbox"
                        checked={formData.is_new}
                        onChange={e => setFormData({...formData, is_new: e.target.checked})}
                        className="rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span>Mark as Brand New</span>
                    </label>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-3.5 rounded-xl border transition-all duration-300 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] active:scale-95"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: theme === "dark" ? "#fff" : t.text }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                    style={{ 
                      background: t.accentText, 
                      color: "#fff",
                      boxShadow: `0 4px 20px ${t.accentText}40`
                    }}
                  >
                    {submittingProduct ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Saving To Matrix...
                      </>
                    ) : (
                      "Save & Deploy Product"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}