// ── app/(main)/checkout/page.tsx
"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheck,
  faBoxOpen,
  faShieldHalved,
  faTruck,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faEnvelope,
  faMoneyBillWave,
  faLock
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useCart } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/app/actions/orders";

// ==========================================
// 1. NOISE GRAIN
// ==========================================
function NoiseGrain({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity, mixBlendMode: "overlay" }}
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="vt-noise-grain-checkout">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#vt-noise-grain-checkout)" />
      </svg>
    </div>
  );
}

// ==========================================
// 2. INPUT FIELD WITH GLOW ON FOCUS
// ==========================================
function GlowingInput({ icon, label, type = "text", placeholder, value, onChange }: any) {
  const { t } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        className="text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ml-1"
        style={{ color: focused ? t.accentText : t.textSubtle }}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <FontAwesomeIcon
          icon={icon}
          className="absolute left-4 text-[14px] transition-colors duration-300 z-10"
          style={{ color: focused ? t.accentText : t.textMuted }}
        />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-14 pl-11 pr-4 rounded-xl text-sm font-medium outline-none transition-all duration-300 bg-transparent"
          style={{
            color: t.text,
            background: t.bgSecondary,
            border: `1px solid ${focused ? t.accentText : t.borderSubtle}`,
            boxShadow: focused ? `0 0 0 3px ${t.glowCyan}20` : "none",
          }}
          required
        />
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN CHECKOUT COMPONENT
// ==========================================
export default function CheckoutPage() {
  const { theme, t } = useTheme();
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const taxes = cartTotal * 0.08;
  const total = cartTotal + taxes; // Free shipping

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [orderStep, setOrderStep] = useState<"idle" | "loading" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // 3D Tilt Hook for Summary Card
  const summaryRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!summaryRef.current) return;
    const rect = summaryRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderStep !== "idle") return;
    setErrorMessage("");

    if (!fullName || !email || !phone || !address || !city) {
      setErrorMessage("Please fill out all shipping details.");
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setOrderStep("loading");
    
    try {
      const response = await createOrderAction({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingCity: city,
        shippingAddress: address,
        items: cartItems.map(item => {
          const hardwarePrefixes = ["cpu-", "gpu-", "storage-", "ram-", "psu-", "cooler-", "case-", "monitor-", "keyboard-", "mouse-", "headset-", "controller-", "motherboard-", "webcam-"];
          const isHardware = hardwarePrefixes.some(prefix => item.id.startsWith(prefix));
          return {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image || "", 
            qty: item.qty,
            _type: (isHardware ? "hardware" : "laptop") as "hardware" | "laptop"
          };
        }),
        totalAmount: total
      });

      if (response.success) {
        setOrderStep("success");
        setTimeout(() => {
          clearCart();
          router.push("/profile/orders");
        }, 1500);
      } else {
        setOrderStep("idle");
        setErrorMessage(response.error || "Failed to complete checkout.");
      }
    } catch (err: any) {
      setOrderStep("idle");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const gradientTextClass = `bg-clip-text text-transparent bg-gradient-to-r ${
    theme === "dark"
      ? "from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]"
      : "from-[#0891b2] via-[#2563eb] to-[#7c3aed]"
  }`;

  return (
    <section className="relative min-h-screen overflow-hidden py-32 pt-16" style={{ backgroundColor: t.bg }}>
      <NoiseGrain />

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${t.gridStroke} 1px, transparent 1px), linear-gradient(90deg, ${t.gridStroke} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(to bottom, black 20%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 80%)",
          }}
        />
        <div
          className="w-[800px] h-[800px] rounded-full blur-[160px] opacity-[0.08] absolute top-[-20%] left-1/2 -translate-x-1/2"
          style={{ background: `radial-gradient(circle, ${t.glowCyan}, ${t.glowPurple})` }}
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border backdrop-blur-sm"
              style={{ background: `${t.bgSecondary}80`, borderColor: t.borderSubtle }}
            >
              <FontAwesomeIcon icon={faLock} className="text-[14px]" style={{ color: t.accentText }} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: t.textSecondary }}>
              Secure Checkout
            </span>
          </div>
          <h1 className={`hf text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.1] tracking-tighter ${gradientTextClass}`}>
            Finalize Order.
          </h1>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div
              className="w-24 h-24 mb-6 rounded-3xl flex items-center justify-center border backdrop-blur-xl"
              style={{ background: t.cardBg, borderColor: t.borderSubtle }}
            >
              <FontAwesomeIcon icon={faBoxOpen} className="text-3xl" style={{ color: t.textMuted }} />
            </div>
            <h2 className="text-2xl hf font-bold mb-4" style={{ color: t.text }}>Nothing to checkout</h2>
            <button
              onClick={() => router.push("/shop")}
              className="text-sm font-bold mt-4 underline transition-colors hover:text-blue-500"
              style={{ color: t.accentText }}
            >
              Return to Shop
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 relative items-start">
            
            {/* Left Column: Glassmorphic Transactional Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex flex-col gap-8"
            >
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="p-8 rounded-[2rem] border backdrop-blur-xl shadow-xl" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="flex items-center gap-3 mb-8">
                  <FontAwesomeIcon icon={faTruck} style={{ color: t.accentText }} />
                  <h3 className="hf text-xl font-extrabold" style={{ color: t.text }}>Shipping Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlowingInput label="Full Name" icon={faUser} placeholder="John Doe" value={fullName} onChange={(e: any) => setFullName(e.target.value)} />
                  <GlowingInput label="Email Address" icon={faEnvelope} type="email" placeholder="john@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                  <GlowingInput label="Phone Number" icon={faPhone} placeholder="+1 234 567 890" value={phone} onChange={(e: any) => setPhone(e.target.value)} />
                  <div className="md:col-span-2">
                    <GlowingInput label="Detailed Address" icon={faMapMarkerAlt} placeholder="123 Neon Street, Apt 4" value={address} onChange={(e: any) => setAddress(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <GlowingInput label="City" icon={faMapMarkerAlt} placeholder="Cyber City" value={city} onChange={(e: any) => setCity(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] border backdrop-blur-xl shadow-xl" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="flex items-center gap-3 mb-6">
                  <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: t.accentText }} />
                  <h3 className="hf text-xl font-extrabold" style={{ color: t.text }}>Payment Method</h3>
                </div>
                <div 
                  className="p-5 rounded-2xl border-2 flex items-center justify-between cursor-default transition-all"
                  style={{ borderColor: t.accentText, background: `${t.accentText}10` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500 text-white text-[10px]">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <span className="font-bold text-[15px]" style={{ color: t.text }}>Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: t.accentText }}>Selected</span>
                </div>
                
              </div>
            </motion.div>

            {/* Right Column: 3D HUD Summary */}
            <div className="sticky top-32 z-20" style={{ perspective: "1000px" }}>
              <motion.div
                ref={summaryRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                  background: `${t.cardBg}ee`,
                  borderColor: t.borderLight,
                  boxShadow: `0 30px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
                className="rounded-[2rem] p-7 sm:p-9 backdrop-blur-2xl border"
              >
                <div style={{ transform: "translateZ(30px)" }}>
                  <h3 className="hf text-2xl font-extrabold mb-8 tracking-tight" style={{ color: t.text }}>
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-[14px]">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-bold shrink-0" style={{ color: t.accentText }}>{item.qty}x</span>
                          <span className="truncate font-medium" style={{ color: t.textSecondary }}>{item.name}</span>
                        </div>
                        <span className="hf font-bold shrink-0" style={{ color: t.text }}>${(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-8 pt-6 border-t" style={{ borderColor: t.borderSubtle }}>
                    <div className="flex justify-between items-center text-[15px] font-medium" style={{ color: t.textSecondary }}>
                      <span>Subtotal</span>
                      <span className="hf font-bold text-[17px]" style={{ color: t.text }}>${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[15px] font-medium" style={{ color: t.textSecondary }}>
                      <span>Estimated Taxes</span>
                      <span className="hf font-bold text-[17px]" style={{ color: t.text }}>${taxes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[15px] font-medium" style={{ color: t.textSecondary }}>
                      <span>Shipping</span>
                      <span className="hf font-bold text-[17px] text-[#10b981] uppercase tracking-wider text-[13px]">Free</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t mb-8" style={{ borderColor: t.borderSubtle }}>
                    <div className="flex justify-between items-end">
                      <span className="text-[12px] uppercase font-bold tracking-[0.15em] mb-1" style={{ color: t.textSubtle }}>Total Amount</span>
                      <span className={`hf text-[40px] font-extrabold leading-none tracking-tighter ${gradientTextClass}`}>
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Stateful Submit Button */}
                  <motion.button
                    type="submit"
                    className="relative w-full h-16 rounded-2xl flex items-center justify-center font-bold text-white overflow-hidden transition-shadow"
                    style={{
                      background: orderStep === "success" 
                        ? "linear-gradient(135deg, #22c55e, #16a34a)"
                        : theme === "dark"
                          ? "linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#7c3aed 100%)"
                          : "linear-gradient(135deg,#06b6d4 0%,#2563eb 70%,#7c3aed 100%)",
                      boxShadow: orderStep === "success" 
                        ? "0 8px 25px rgba(34,197,94,0.4)" 
                        : "0 8px 25px rgba(14,165,233,0.3)",
                      pointerEvents: orderStep !== "idle" ? "none" : "auto",
                    }}
                    whileHover={orderStep === "idle" ? { scale: 1.02 } : {}}
                    whileTap={orderStep === "idle" ? { scale: 0.98 } : {}}
                  >
                    <AnimatePresence mode="wait">
                      {orderStep === "idle" && (
                        <motion.span
                          key="idle"
                          className="flex items-center gap-2 z-10 tracking-wide text-[16px]"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          Place Order <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                        </motion.span>
                      )}
                      {orderStep === "loading" && (
                        <motion.div
                          key="loading"
                          className="z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, rotate: 360 }}
                          exit={{ opacity: 0 }}
                          transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                        >
                          <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
                            <circle cx="11" cy="11" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                            <path d="M 11 2 A 9 9 0 0 1 20 11" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </motion.div>
                      )}
                      {orderStep === "success" && (
                        <motion.div
                          key="success"
                          className="z-10 flex items-center justify-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", damping: 20 }}
                        >
                          <FontAwesomeIcon icon={faCheck} className="text-xl" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <div className="mt-6 flex items-center justify-center gap-2.5">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-[12px]" style={{ color: t.textMuted }} />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: t.textMuted }}>
                      Secure Transaction
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
