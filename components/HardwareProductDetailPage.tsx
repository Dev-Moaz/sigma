// components/HardwareProductDetailPage.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faHeart,
  faMicrochip,
  faBolt,
  faCheck,
  faTachometerAlt,
  faBoxOpen,
  faVrCardboard
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useCart, useWishlist } from "@/store/useAppStore";
import type { HardwareProduct } from "@/lib/hardware-schema";

/* =========================================================================================
   1. THE RENDERING ENGINE STYLES 
   ========================================================================================= */
const RenderEngineStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      /* --- Hardware Acceleration & 3D Core --- */
      .preserve-3d { transform-style: preserve-3d; }
      .gpu-layer { will-change: transform, opacity; transform: translateZ(0); }
      .backface-hidden { backface-visibility: hidden; }
      .scene-perspective { perspective: 2500px; }

      /* --- Infinite Physics & Data Animations --- */
      @keyframes data-pulse { 0%, 100% { opacity: 0.2; transform: scaleY(0.8); } 50% { opacity: 1; transform: scaleY(1.2); } }
      @keyframes data-stream { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      
      /* --- Materials --- */
      .mat-pcb-black {
        background-color: #0a0a0a;
        background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 6px 6px;
      }
      .mat-glass { 
        background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.02) 100%); 
        backdrop-filter: blur(8px); 
        border: 1px solid rgba(255,255,255,0.1); 
      }
    `
  }} />
);

/* =========================================================================================
   2. 3D PRIMITIVES
   ========================================================================================= */

interface Box3DProps {
  w: number; h: number; d: number;
  matFront?: string; matBack?: string; matLeft?: string;
  matRight?: string; matTop?: string; matBottom?: string;
  className?: string; style?: React.CSSProperties;
  children?: React.ReactNode; 
}

const Box3D = React.memo(({
  w, h, d,
  matFront = "bg-[#111]", matBack = "bg-[#111]", matLeft = "bg-[#222]",
  matRight = "bg-[#222]", matTop = "bg-[#333]", matBottom = "bg-[#0a0a0a]",
  className = "", style = {}, children
}: Box3DProps) => {
  return (
    <motion.div 
      className={`absolute preserve-3d ${className}`}
      style={{ width: w, height: h, marginLeft: -w/2, marginTop: -h/2, ...style }}
    >
      <div className={`absolute inset-0 ${matFront} preserve-3d backface-hidden`} style={{ transform: `translateZ(${d/2}px)` }} />
      <div className={`absolute inset-0 ${matBack} preserve-3d backface-hidden`} style={{ transform: `rotateY(180deg) translateZ(${d/2}px)` }} />
      <div className={`absolute ${matLeft} preserve-3d backface-hidden`} style={{ width: d, height: h, left: 0, top: 0, transformOrigin: 'left center', transform: `rotateY(-90deg)` }} />
      <div className={`absolute ${matRight} preserve-3d backface-hidden`} style={{ width: d, height: h, right: 0, top: 0, transformOrigin: 'right center', transform: `rotateY(90deg)` }} />
      <div className={`absolute ${matTop} preserve-3d backface-hidden`} style={{ width: w, height: d, left: 0, top: 0, transformOrigin: 'center top', transform: `rotateX(90deg)` }} />
      <div className={`absolute ${matBottom} preserve-3d backface-hidden`} style={{ width: w, height: d, left: 0, bottom: 0, transformOrigin: 'center bottom', transform: `rotateX(-90deg)` }} />
      {children && <div className="absolute inset-0 preserve-3d">{children}</div>}
    </motion.div>
  );
});
Box3D.displayName = "Box3D";

/* =========================================================================================
   3. ABSTRACT DATA VISUALIZERS
   ========================================================================================= */

const VisualRayTracing = ({ color }: { color: string }) => (
  <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] preserve-3d scene-perspective flex items-center justify-center">
    <Box3D w={60} h={60} d={60} matFront="mat-glass" matBack="mat-glass" matTop="mat-glass" matBottom="mat-glass" matLeft="mat-glass" matRight="mat-glass" style={{ transform: 'rotateX(45deg) rotateY(45deg)' }}>
       <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(30px)' }}>
          <div className="w-4 h-4 rounded-full" style={{ background: color, boxShadow: `0 0 30px ${color}, 0 0 60px ${color}` }} />
       </div>
    </Box3D>
    {[...Array(6)].map((_, i) => (
      <motion.div key={i} className="absolute w-[2px] h-[150px] bg-white gpu-layer"
        style={{ top: '50%', left: '50%', transformOrigin: 'top center', rotateZ: i * 60, boxShadow: `0 0 10px ${color}` }}
        animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

const VisualTensorCores = ({ color }: { color: string }) => (
  <div className="relative w-[230px] h-[230px] sm:w-[280px] sm:h-[280px] grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 p-3 sm:p-4 mat-pcb-black border border-white/10 rounded-xl preserve-3d" style={{ transform: 'rotateX(30deg) rotateZ(15deg)' }}>
    {Array.from({length: 16}).map((_, i) => (
      <motion.div key={i} className="relative rounded-sm border border-[#333] bg-[#111] overflow-hidden"
        animate={{ borderColor: ['#333', color, '#333'], boxShadow: ['none', `0 0 15px ${color}`, 'none'] }}
        transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
      >
        <FontAwesomeIcon icon={faMicrochip} className="absolute inset-0 m-auto text-white/20 text-2xl" />
      </motion.div>
    ))}
  </div>
);

const VisualDataLanes = ({ color }: { color: string }) => (
  <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] flex flex-col justify-evenly preserve-3d" style={{ perspective: "1000px", transform: 'rotateX(60deg)' }}>
    {[...Array(8)].map((_, i) => (
      <div key={i} className="w-full h-2 bg-[#111] rounded-full relative overflow-hidden border border-white/5">
        <motion.div className="absolute inset-y-0 w-1/3 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          animate={{ left: ['-50%', '150%'] }} transition={{ duration: Math.random() + 0.5, repeat: Infinity, ease: "linear", delay: Math.random() }}
        />
      </div>
    ))}
  </div>
);

/* =========================================================================================
   4. DATA PARSERS & UI LOGIC
   ========================================================================================= */

const formatSpecValue = (val: any): string => {
  if (typeof val === 'boolean') return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.join(" | ");
  if (typeof val === 'object' && val !== null) {
    return Object.entries(val)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").trim()}: ${v}`)
      .join(" - ");
  }
  return String(val);
};

function buildChapters(product: HardwareProduct, color: string) {
  const chapters = [];
  const cat = product.category;
  const s = (product.specs || {}) as any;

  if (cat === "GPU") {
    const vramStat = s.vram ? String(s.vram).replace(/[^0-9]/g, '') : "16";
    chapters.push({ title: "Architecture", headline: "NVIDIA / AMD Architecture.", desc: "Next-gen multiprocessors offer up to 2x performance and power efficiency.", stat: s.coreClock || "2.5", suffix: " GHz", statLabel: "Core Clock", icon: faMicrochip, visual: <VisualTensorCores color={color} /> });
    chapters.push({ title: "Memory", headline: "Massive VRAM.", desc: "High-speed memory for flawless 4K gaming and rendering.", stat: vramStat, suffix: " GB", statLabel: "Video Memory", icon: faVrCardboard, visual: <VisualRayTracing color={color} /> });
  
  } else if (cat === "CPU") {
    let extractedBoost = "5.0";
    if (s.boostClock) {
      if (typeof s.boostClock === 'object') {
        const bestClock = s.boostClock.pCore || Object.values(s.boostClock)[0];
        extractedBoost = String(bestClock).replace(/[^0-9.]/g, '');
      } else {
        extractedBoost = String(s.boostClock).replace(/[^0-9.]/g, '');
      }
    }
    chapters.push({ title: "Clocks", headline: "Break the Sound Barrier.", desc: "Unprecedented boost clocks deliver extreme gaming performance and instant responsiveness.", stat: extractedBoost || "5.8", suffix: " GHz", statLabel: "Max Boost", icon: faBolt, visual: <VisualDataLanes color={color} /> });
    chapters.push({ title: "IPC", headline: "Generational Leap.", desc: "Redesigned core architecture maximizes Instructions Per Clock.", stat: s.cores || s.coreCount || "16", suffix: " Cores", statLabel: "Processing Cores", icon: faMicrochip, visual: <VisualTensorCores color={color} /> });
  
  } else if (cat === "RAM") {
    chapters.push({ title: "Speed", headline: "Instant Access.", desc: "Ultra-low latency and massive bandwidth for seamless multitasking and high frame rates.", stat: s.speed || "6000", suffix: " MHz", statLabel: "Transfer Rate", icon: faTachometerAlt, visual: <VisualDataLanes color={color} /> });
    chapters.push({ title: "Latency", headline: "Zero Delay.", desc: "Tight timings ensure your CPU gets the data it needs the millisecond it needs it.", stat: s.casLatency || "30", suffix: " CL", statLabel: "CAS Latency", icon: faBolt, visual: <VisualTensorCores color={color} /> });
  
  } else if (cat === "Storage") {
    const readSpeed = s.readSpeed ? String(s.readSpeed).replace(/[^0-9]/g, '') : "7000";
    chapters.push({ title: "Bandwidth", headline: "Blink and you miss it.", desc: "PCIe bandwidth unleashes the true potential of your system, eliminating loading screens.", stat: readSpeed, suffix: " MB/s", statLabel: "Read Speed", icon: faBolt, visual: <VisualDataLanes color={color} /> });
  
  } else {
    chapters.push({ title: "Performance", headline: "Uncompromised Quality.", desc: "Engineered to push the boundaries of what's possible in modern computing.", stat: "99", suffix: "%", statLabel: "Efficiency", icon: faTachometerAlt, visual: <VisualDataLanes color={color} /> });
    chapters.push({ title: "Design", headline: "Industrial Art.", desc: "Premium materials and meticulous craftsmanship define every inch of this component.", stat: "100", suffix: "%", statLabel: "Premium Build", icon: faBoxOpen, visual: <VisualRayTracing color={color} /> });
  }

  return chapters;
}

function Counter({ target, suffix = "" }: { target: string | number, suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  const num = typeof target === "string" ? parseFloat(target.replace(/[^0-9.]/g, '')) : target;

  useEffect(() => {
    if (!inView || isNaN(num)) return;
    let start: number;
    const animate = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / 1500, 1);
      const current = num % 1 !== 0 ? parseFloat(((1 - Math.pow(1 - progress, 3)) * num).toFixed(1)) : Math.floor((1 - Math.pow(1 - progress, 3)) * num);
      setVal(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, num]);

  if (isNaN(num)) return <span ref={ref}>{target}{suffix}</span>;
  return <span ref={ref}>{val}{suffix}</span>;
}

const LiquidButton = ({ children, onClick, active, color }: any) => {
  const { t } = useTheme();
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-xl px-10 h-16 font-bold bf tracking-wide flex items-center justify-center gap-3 transition-colors duration-300 shadow-xl border"
      style={active ? { background: "#10b981", color: "#fff", borderColor: "#10b981" } : { background: `linear-gradient(135deg, ${color}30 0%, ${t.cardBg} 100%)`, color: t.text, borderColor: `${color}60` }}
    >
      <span className="relative z-10 flex items-center gap-3 text-lg drop-shadow-md">{children}</span>
    </motion.button>
  );
};

/* =========================================================================================
   5. MAIN COMPONENT
   ========================================================================================= */

export default function HardwareProductDetailPage({ product }: { product: HardwareProduct }) {
  const { t, isDark } = useTheme();
  const { addToCart } = useCart();
  const { wishIds, toggleWish } = useWishlist();
  
  const [isAdded, setIsAdded] = useState(false);
  const isWished = wishIds.includes(product.id);

  const currentPrice = product.discountPrice || product.price;
  const primaryImage = product.images?.[0] || "/placeholder.png";

  const brandColor = useMemo(() => {
    const textToSearch = `${product.brand} ${product.name} ${product.category}`.toLowerCase();
    if (textToSearch.includes('nvidia') || textToSearch.includes('rtx')) return '#76b900';
    if (textToSearch.includes('amd') || textToSearch.includes('radeon') || textToSearch.includes('ryzen')) return '#ed1c24';
    if (textToSearch.includes('intel') || textToSearch.includes('core')) return '#0071c5';
    if (textToSearch.includes('corsair')) return '#eab308';
    if (textToSearch.includes('asus') || textToSearch.includes('rog')) return '#ff0039';
    return t.accentText || '#00e5ff';
  }, [product, t]);

  const visualSpecs = useMemo(() => Object.entries((product.specs || {}) as Record<string, any>).map(([k, v]) => ({
    label: k.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()),
    value: formatSpecValue(v)
  })), [product]);

  const chapters = useMemo(() => buildChapters(product, brandColor), [product, brandColor]);

  const handleAddToCart = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: currentPrice, 
      image: primaryImage 
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }, [addToCart, product.id, product.name, currentPrice, primaryImage]);

  // Parallax for Hero Image
  const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);

  const { scrollYProgress } = useScroll();
  const stickyBarY = useTransform(scrollYProgress, [0.1, 0.2], [150, 0]);

  return (
    <main className="relative min-h-screen overflow-hidden pb-32 transition-colors duration-500" style={{ backgroundColor: t.bg, color: t.text }}>
      <RenderEngineStyles />

      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-20" 
             style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 60%)`, filter: 'blur(100px)', animation: 'data-pulse 8s infinite alternate' }} />
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90svh] flex flex-col justify-center pt-24 pb-12 z-10 max-w-[1600px] mx-auto px-6 lg:px-12"
               onPointerMove={(e) => { mouseX.set((e.clientX / window.innerWidth) - 0.5); mouseY.set((e.clientY / window.innerHeight) - 0.5); }}
               onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-sm animate-pulse" style={{ background: brandColor, boxShadow: `0 0 15px ${brandColor}` }} />
          <span className="bf text-sm font-bold tracking-[0.4em] uppercase" style={{ color: t.textSecondary }}>{product.brand} · {product.category}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col z-20">
            <h1 className="hf leading-[1.1] tracking-tighter mb-6 font-black" style={{ fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)", color: t.text }}>
              {product.name}
            </h1>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="bf text-xl leading-relaxed mb-12 max-w-xl" style={{ color: t.textSecondary }}>
              {product.description}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex items-end gap-2">
                <span className="hf text-6xl font-black" style={{ color: t.text }}>${currentPrice.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <LiquidButton onClick={handleAddToCart} active={isAdded} color={brandColor}>
                  <FontAwesomeIcon icon={isAdded ? faCheck : faCartShopping} /> {isAdded ? "Secured" : "Add to Loadout"}
                </LiquidButton>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(product.id); }} 
                  className="w-16 h-16 flex items-center justify-center rounded-xl border transition-colors" 
                  style={{ backgroundColor: t.cardBg, borderColor: t.borderLight }}
                >
                  <FontAwesomeIcon icon={faHeart} className="text-2xl transition-transform" style={{ color: isWished ? "#ff3366" : t.textSecondary, transform: isWished ? "scale(1.2)" : "scale(1)" }} />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center z-10 perspective-[2000px]">
            <motion.img src={primaryImage} alt={product.name} style={{ rotateX, rotateY }} animate={{ y: [-15, 15, -15] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="gpu-layer w-full h-full object-contain drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* ================= DATA STREAM MARQUEE ================= */}
      <div className="relative z-20 py-6 backdrop-blur-xl overflow-hidden flex whitespace-nowrap border-y mt-12" style={{ backgroundColor: t.cardBg, borderColor: t.borderLight }}>
        <div className="flex w-max gpu-layer" style={{ animation: "data-stream 40s linear infinite" }}>
          {[...visualSpecs, ...visualSpecs, ...visualSpecs].map((s, i) => (
            <div key={i} className="flex items-center gap-8 px-10 bf text-sm font-bold tracking-[0.2em] uppercase" style={{ color: t.textSecondary }}>
              <span>{s.label}: <span style={{ color: t.text }}>{s.value}</span></span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: brandColor, boxShadow: `0 0 10px ${brandColor}` }} />
            </div>
          ))}
        </div>
      </div>

      {/* ================= DYNAMIC CHAPTERS ================= */}
      <div className="relative z-20 pt-20">
        {chapters.map((chap, idx) => {
          const isReversed = idx % 2 !== 0;
          return (
            <section key={idx} className={`max-w-[1500px] mx-auto px-6 lg:px-12 py-32 flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center justify-between gap-24`}>
              
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border" style={{ borderColor: t.borderLight, backgroundColor: t.cardBg }}>
                    <FontAwesomeIcon icon={chap.icon} style={{ color: brandColor, fontSize: '1.2rem' }} />
                  </div>
                  <span className="bf text-sm font-bold tracking-[0.4em] uppercase" style={{ color: brandColor }}>{chap.title}</span>
                </div>
                
                <h2 className="hf text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-10" style={{ color: t.text }}>
                  {chap.headline}
                </h2>
                
                <div className="flex items-end gap-4 mb-8 border-l-4 pl-8 py-2" style={{ borderColor: brandColor }}>
                  <span className="hf text-7xl md:text-9xl leading-none tracking-tighter" style={{ color: t.text }}><Counter target={chap.stat} /></span>
                  <div className="pb-3 flex flex-col">
                    <span className="hf text-3xl md:text-4xl" style={{ color: t.text }}>{chap.suffix}</span>
                    <span className="bf text-[11px] tracking-[0.3em] uppercase mt-1" style={{ color: t.textSecondary }}>{chap.statLabel}</span>
                  </div>
                </div>
                
                <p className="bf text-xl leading-relaxed max-w-lg" style={{ color: t.textSecondary }}>{chap.desc}</p>
              </div>

              <div className="w-full lg:w-1/2 flex justify-center perspective-[2000px]">
                 <motion.div initial={{ rotateY: isReversed ? 40 : -40, opacity: 0, scale: 0.8, x: isReversed ? -100 : 100 }} whileInView={{ rotateY: 0, opacity: 1, scale: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className="gpu-layer preserve-3d">
                   <div className="p-4 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-[#222] shadow-2xl">
                     {chap.visual}
                   </div>
                 </motion.div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ================= FULL TECHNICAL MATRIX ================= */}
      <section className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-12 py-40 border-t mt-20" style={{ borderColor: t.borderLight }}>
        <div className="flex flex-col items-center text-center mb-24">
           <h2 className="hf text-5xl md:text-7xl font-black mb-6" style={{ color: t.text }}>Technical Matrix.</h2>
           <p className="bf text-xl max-w-2xl" style={{ color: t.textSecondary }}>Every detail engineered for absolute supremacy. Review the raw specifications.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-10">
          {visualSpecs.map((spec, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.1 }} className="flex flex-col border-b pb-4 group transition-colors" style={{ borderColor: t.borderSubtle }}>
              <span className="bf text-xs tracking-[0.3em] uppercase mb-2" style={{ color: t.textSecondary }}>{spec.label}</span>
              <span className="hf text-2xl font-bold transition-all" style={{ color: brandColor }}>{spec.value}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= STICKY HUD ACTION BAR ================= */}
      <motion.div style={{ y: stickyBarY }} className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-8 pointer-events-none">
        <div className="max-w-[1200px] mx-auto rounded-2xl backdrop-blur-3xl border shadow-2xl p-4 flex items-center justify-between pointer-events-auto" style={{ backgroundColor: t.dropdownBg, borderColor: t.borderLight }}>
          <div className="hidden md:flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border p-2" style={{ backgroundColor: t.cardBg, borderColor: t.borderSubtle }}>
              <img src={primaryImage} alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="hf text-xl font-bold leading-none mb-2" style={{ color: t.text }}>{product.name}</p>
              <div className="flex items-center gap-3">
                 <span className="bf text-[10px] tracking-[0.3em] uppercase" style={{ color: t.textSecondary }}>{product.category}</span>
                 <span className="bf text-[10px] tracking-widest uppercase text-emerald-500 font-bold flex items-center gap-1">
                   <FontAwesomeIcon icon={faBolt} /> In Stock
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col items-end">
               <span className="hf text-4xl font-black" style={{ color: t.text }}>${currentPrice.toLocaleString()}</span>
            </div>
            <LiquidButton onClick={handleAddToCart} active={isAdded} color={brandColor}>
              <FontAwesomeIcon icon={isAdded ? faCheck : faCartShopping} /> {isAdded ? "Added" : "Buy Now"}
            </LiquidButton>
          </div>
        </div>
      </motion.div>

    </main>
  );
}