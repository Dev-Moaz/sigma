// app/(main)/compare/CompareClient.tsx
"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faScaleBalanced, 
  faXmark, 
  faArrowLeft, 
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useCompare, useCart } from "@/store/useAppStore";
import Link from "next/link";
import type { Product } from "@/lib/laptop-schema";
import type { HardwareProduct } from "@/lib/hardware-schema";
import { StarRating } from "@/components/ui/ProductUI";
import { Particles } from "@/components/ui/Particles";
import { CinematicReveal } from "@/components/ui/CinematicReveal";

interface CompareClientProps {
  initialLaptops: Product[];
  initialHardware: HardwareProduct[];
}

export default function CompareClient({ initialLaptops, initialHardware }: CompareClientProps) {
  const { t, isDark } = useTheme();
  const { compareIds, toggleCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  // تصفية ومطابقة المنتجات المقارنة حياً بناءً على البيانات الحية المجلوبة
  const products = useMemo(() => {
    return compareIds.map(id => {
      const laptop = initialLaptops.find(p => p.id === id);
      if (laptop) return { ...laptop, _type: 'laptop' as const };
      
      const hardware = initialHardware.find(p => p.id === id);
      if (hardware) return { ...hardware, _type: 'hardware' as const };
      
      return null;
    }).filter(Boolean) as any[];
  }, [compareIds, initialLaptops, initialHardware]);

  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Particles count={20} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6 mx-auto">
            <FontAwesomeIcon icon={faScaleBalanced} className="text-4xl text-slate-500" />
          </div>
          <h1 className="hf text-3xl font-black mb-4" style={{ color: t.text }}>Comparison List Empty</h1>
          <p className="text-slate-500 max-w-md mb-8">Add up to 4 products from the shop to compare their specifications side-by-side.</p>
          <Link href="/shop">
            <button className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
              Return to Shop
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // مفاتيح المواصفات للمقارنة بين اللابتوب والقطع
  const specKeys = [
    { label: "Price", key: "price", type: "price" },
    { label: "Rating", key: "rating", type: "rating" },
    { label: "Category", key: "category", type: "text" },
    { label: "Brand", key: "brand", type: "text" },
    { label: "Processor", key: "processor", type: "spec", laptopKey: "CPU", hardwareKey: "socket" },
    { label: "Graphics", key: "graphics", type: "spec", laptopKey: "GPU", hardwareKey: "chipset" },
    { label: "Memory", key: "memory", type: "spec", laptopKey: "RAM", hardwareKey: "capacity" },
    { label: "Storage", key: "storage", type: "spec", laptopKey: "Storage", hardwareKey: "storageType" },
  ];

  const getSpecValue = (product: any, spec: any) => {
    if (spec.type === "price") return product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    if (spec.type === "rating") return product.rating;
    if (spec.type === "text") return product[spec.key];
    
    if (spec.type === "spec") {
      if (product._type === 'laptop') {
        const s = product.specs?.find((x: any) => x.label === spec.laptopKey);
        if (s) return s.value;
        
        const techKey = spec.laptopKey.toLowerCase();
        const techVal = product.technical_metadata?.[techKey];
        if (techVal) return techVal;

        if (spec.laptopKey === "RAM" && product.technical_metadata?.ram_gb) return `${product.technical_metadata.ram_gb}GB`;
        if (spec.laptopKey === "Storage" && product.technical_metadata?.storage_gb) return `${product.technical_metadata.storage_gb}GB`;

        return "N/A";
      } else {
        const val = product.specs?.[spec.hardwareKey] || product[spec.hardwareKey];
        return val || "N/A";
      }
    }
    return "N/A";
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <Particles count={30} />
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: t.glowCyan }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: t.glowPurple }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <CinematicReveal delay={0.1}>
          <div className="pt-12 mb-12">
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity mb-6" style={{ color: t.textSecondary }}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Catalog
            </Link>
            
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #06b6d4, #3b82f6)" }} />
                  <span className="hf text-xs font-black uppercase tracking-[0.2em]" style={{ color: t.accentText }}>HUD Analysis</span>
                </div>
                <h1 className="hf text-[clamp(2.5rem,5vw,4rem)] font-black leading-none tracking-tighter" style={{ color: t.text }}>
                  Comparison <span className="opacity-40">Matrix</span>
                </h1>
              </div>
              
              <button 
                onClick={clearCompare}
                className="px-6 py-3 rounded-xl border font-bold text-sm transition-all hover:bg-red-500/10"
                style={{ borderColor: t.borderLight, color: t.textSecondary }}
              >
                Clear Matrix
              </button>
            </div>
          </div>
        </CinematicReveal>

        {/* Comparison Grid */}
        <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-0 border rounded-3xl overflow-hidden backdrop-blur-md min-w-[750px] lg:min-w-0" style={{ borderColor: t.borderLight, background: t.cardBg }}>
            
            {/* Labels Column */}
            <div className="hidden lg:flex flex-col border-r" style={{ borderColor: t.borderLight }}>
              <div className="h-80 border-b flex items-center px-6" style={{ borderColor: t.borderLight }}>
                <span className="hf text-xs font-black uppercase tracking-widest opacity-30" style={{ color: t.textSecondary }}>Parameter</span>
              </div>
              {specKeys.map((spec) => (
                <div key={spec.label} className="h-20 border-b flex items-center px-6" style={{ borderColor: t.borderLight }}>
                  <span className="pc-dm text-xs font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>{spec.label}</span>
                </div>
              ))}
              <div className="flex-1 min-h-[100px]" />
            </div>

            {/* Products Grid */}
            <div className={`grid grid-cols-${products.length} h-full`}>
            {products.map((product) => (
              <div key={product.id} className="flex flex-col border-r last:border-r-0" style={{ borderColor: t.borderLight }}>
                
                {/* Header Section */}
                <div className="h-80 p-6 border-b flex flex-col items-center text-center relative group" style={{ borderColor: t.borderLight }}>
                  <button 
                    onClick={() => toggleCompare(product.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    style={{ borderColor: t.borderLight, color: t.textSecondary }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>

                  <div className="w-40 h-40 mb-6 relative">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" />
                  </div>
                  
                  <h3 className="hf text-lg font-black leading-tight mb-2" style={{ color: t.text }}>{product.name}</h3>
                  <div className="mt-auto">
                    <StarRating rating={product.rating} />
                  </div>
                </div>

                {/* Specs Rows */}
                {specKeys.map((spec) => (
                  <div key={spec.label} className="h-20 border-b flex flex-col justify-center px-6 group transition-colors hover:bg-white/5" style={{ borderColor: t.borderLight }}>
                    <span className="lg:hidden hf text-[9px] font-black uppercase tracking-widest opacity-30 mb-1" style={{ color: t.textSecondary }}>{spec.label}</span>
                    <div className="pc-dm text-[13px] font-bold" style={{ color: spec.type === 'price' ? (isDark ? '#34d399' : '#059669') : t.text }}>
                      {spec.type === 'rating' ? (
                        <span className="pc-bebas text-lg">{product.rating.toFixed(1)} <span className="text-[10px] opacity-40">/ 5.0</span></span>
                      ) : getSpecValue(product, spec)}
                    </div>
                  </div>
                ))}

                {/* Action Section */}
                <div className="p-6 mt-auto">
                  <button 
                    onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0] }, 1)}
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                  >
                    <FontAwesomeIcon icon={faCartShopping} />
                    Buy Now
                  </button>
                  
                  <Link href={product._type === 'laptop' ? `/product/${product.id}` : `/hardware/${product.id}`}>
                    <button className="w-full mt-3 py-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity" style={{ color: t.textSecondary }}>
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Comparison Summary / Insights */}
        <div className="mt-12 p-8 rounded-3xl border border-dashed flex flex-col md:flex-row items-center gap-8" style={{ borderColor: t.borderLight }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-500/10 shrink-0">
             <FontAwesomeIcon icon={faScaleBalanced} className="text-2xl text-blue-500" />
          </div>
          <div>
            <h4 className="hf text-xl font-black mb-2" style={{ color: t.text }}>Expert Matrix Insight</h4>
            <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>
              Our HUD analysis suggests that <span className="font-bold text-blue-500">{products[0].name}</span> offers the best value-to-performance ratio in this selection. 
              The technical differences in architecture between these units can impact specific professional workflows like 3D rendering and neural processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}