// components/ProductDetailPage.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useVelocity,
  useInView,
} from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faHeart,
  faMicrochip,
  faDisplay,
  faShieldHalved,
  faBolt,
  faBatteryFull,
  faCheck,
  faMemory,
  faHardDrive,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useCart, useWishlist } from "@/store/useAppStore";
import type { Product, ColorVariant } from "@/lib/laptop-schema";

// ─────────────────────────────────────────────────────────────────────────────
// FONTS + GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Syne+Mono&display=swap');

      .pdp-display { font-family: 'Syne', sans-serif; font-weight: 800; }
      .pdp-body    { font-family: 'Outfit', sans-serif; }
      .pdp-mono    { font-family: 'Syne Mono', monospace; }

      @keyframes pdp-float {
        0%,100% { transform: translateY(0px) rotate3d(1,1,0,0deg); }
        40%     { transform: translateY(-18px) rotate3d(1,1,0,1.2deg); }
        70%     { transform: translateY(-8px) rotate3d(1,-1,0,0.6deg); }
      }
      @keyframes pdp-marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes pdp-grain {
        0%,100% { transform: translate(0,0); }
        20%     { transform: translate(-2%,1%); }
        40%     { transform: translate(1%,-2%); }
        60%     { transform: translate(-1%,2%); }
        80%     { transform: translate(2%,-1%); }
      }
      @keyframes pdp-shimmer {
        0%   { transform: translateX(-220%) skewX(-18deg); }
        100% { transform: translateX(320%) skewX(-18deg); }
      }
      @keyframes pdp-breathe {
        0%,100% { opacity: 0.6; transform: scale(1); }
        50%     { opacity: 1;   transform: scale(1.08); }
      }
      @keyframes pdp-pulse-dot {
        0%,100% { opacity: 1; }
        50%     { opacity: 0.3; }
      }
      @keyframes pdp-spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pdp-spin-slow-reverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }
      
      .gpu-heatsink {
        background-image: repeating-linear-gradient(0deg, #333, #333 2px, #111 2px, #111 4px);
      }
      .pcie-pins {
        background-image: repeating-linear-gradient(90deg, transparent, transparent 2px, #ffd700 2px, #ffd700 4px);
      }
      .brushed-metal {
        background: linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 50%, #2b2b2b 100%);
        background-size: 200% 200%;
      }
      .nvme-pcb {
        background-image: repeating-linear-gradient(45deg, #0f1c13 25%, transparent 25%, transparent 75%, #0f1c13 75%, #0f1c13), repeating-linear-gradient(45deg, #0f1c13 25%, transparent 25%, transparent 75%, #0f1c13 75%, #0f1c13);
        background-position: 0 0, 2px 2px;
        background-size: 4px 4px;
        background-color: #1a3020;
      }
    `
  }} />
);

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  cyan:    "#00f5d4",
  purple:  "#9b5de5",
  amber:   "#f5a623",
  rose:    "#ff4d6d",
  emerald: "#10b981",
  blue:    "#3b82f6",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function GrainOverlay({ strength = 0.035 }: { strength?: number }) {
  return (
    <div aria-hidden className="pointer-events-none select-none" style={{ position: "fixed", inset: 0, zIndex: 9998, opacity: strength, animation: "pdp-grain 0.15s steps(1) infinite" }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="pdp-g"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#pdp-g)" />
      </svg>
    </div>
  );
}

function SplitReveal({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap", marginRight: "0.22em" }}>
          {word.split("").map((ch, ci) => (
            <span key={ci} style={{ display: "inline-block", overflow: "hidden", lineHeight: 1 }}>
              <motion.span style={{ display: "inline-block" }} initial={{ y: "108%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} transition={{ duration: 0.95, delay: delay + (wi * 4 + ci) * 0.042, ease: [0.16, 1, 0.3, 1] }}>{ch}</motion.span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

function TypewriterStat({ lines, accentColor, className = "", typingSpeed = 52, pauseDuration = 2200, deletingSpeed = 28 }: { lines: string[]; accentColor: string; className?: string; typingSpeed?: number; pauseDuration?: number; deletingSpeed?: number; }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px 0px" });
  const [displayed, setDisplayed] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState<"typing"|"pausing"|"deleting">("typing");

  useEffect(() => {
    if (!inView) return;
    const target = lines[lineIndex];
    if (phase === "typing") {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), typingSpeed);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("pausing"), pauseDuration);
        return () => clearTimeout(t);
      }
    }
    if (phase === "pausing") setPhase("deleting");
    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), deletingSpeed);
        return () => clearTimeout(t);
      } else {
        setLineIndex(i => (i + 1) % lines.length);
        setPhase("typing");
      }
    }
  }, [inView, displayed, phase, lineIndex, lines, typingSpeed, pauseDuration, deletingSpeed]);

  useEffect(() => { if (!inView) { setDisplayed(""); setPhase("typing"); } }, [inView]);

  return <span ref={ref} className={className}>{displayed}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }} style={{ color: accentColor, marginLeft: 2 }}>|</motion.span></span>;
}

function WordReveal({ text, delay = 0, className = "", style }: { text: string; delay?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.28em" }}>
          <motion.span style={{ display: "inline-block" }} initial={{ y: "100%", opacity: 0 }} animate={inView ? { y: "0%", opacity: 1 } : {}} transition={{ duration: 0.78, delay: delay + i * 0.075, ease: [0.16, 1, 0.3, 1] }}>{word}</motion.span>
        </span>
      ))}
    </p>
  );
}

function CountUp({ to, suffix = "", prefix = "", duration = 1800 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf: number; let t0: number | null = null;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

function MagneticBtn({ children, onClick, accentColor, confirmed, compact = false }: { children: React.ReactNode; onClick: () => void; accentColor: string; confirmed: boolean; compact?: boolean; }) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 22, mass: 0.1 });
  const sy = useSpring(my, { stiffness: 220, damping: 22, mass: 0.1 });
  return (
    <motion.button
      ref={ref} style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left - r.width / 2) * 0.3);
        my.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
      className={`pdp-body relative overflow-hidden font-semibold rounded-xl flex items-center justify-center gap-2.5 ${compact ? "h-11 px-6 text-sm" : "h-14 md:h-16 px-8 md:px-14 text-base"}`}
    >
      <motion.div className="absolute inset-0" animate={{ background: confirmed ? `linear-gradient(135deg, ${C.emerald}, #059669)` : `linear-gradient(135deg, ${accentColor} 0%, #6366f1 55%, ${C.purple} 100%)` }} transition={{ duration: 0.4 }} />
      {!confirmed && <div className="absolute inset-y-0 w-1/3 opacity-25 pointer-events-none" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)", animation: "pdp-shimmer 2.4s ease-in-out infinite" }} />}
      <span className="relative z-10 flex items-center gap-2.5 text-white">{children}</span>
    </motion.button>
  );
}

function Marquee({ items }: { items: string[] }) {
  const { t } = useTheme();
  const all = [...items, ...items];
  return (
    <div className="overflow-hidden w-full" style={{ borderTop: `1px solid ${t.borderLight}`, borderBottom: `1px solid ${t.borderLight}` }}>
      <div className="flex whitespace-nowrap" style={{ animation: "pdp-marquee 30s linear infinite" }}>
        {all.map((item, i) => (
          <span key={i} className="pdp-mono text-[11px] uppercase tracking-[0.22em] px-8 py-4 inline-flex items-center gap-6 shrink-0" style={{ color: t.textSecondary }}>
            {item}
            <span className="w-1 h-1 rounded-full inline-block opacity-30" style={{ background: t.text }} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MIND-BLOWING 3D VISUAL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CpuVisual({ accentColor }: { accentColor: string }) {
  const { t } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  const isAMD = accentColor.toUpperCase() === "#ED1C24";
  const brandColor = isAMD ? "#ED1C24" : "#00A3E0";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [22, -22]), { stiffness: 150, damping: 25, mass: 0.5 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-28, 28]), { stiffness: 150, damping: 25, mass: 0.5 });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["-120%", "220%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["-120%", "220%"]);
  
  const innerShiftX = useTransform(mouseX, [-0.5, 0.5], [12, -12]);
  const innerShiftY = useTransform(mouseY, [-0.5, 0.5], [12, -12]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <div 
      ref={ref} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave} 
      className="relative w-full h-full min-h-[480px] flex items-center justify-center cursor-crosshair" 
      style={{ perspective: "1800px" }}
    >
      <div className="absolute w-[75%] h-[75%] rounded-full blur-[100px] opacity-20 transition-colors duration-700 pointer-events-none" style={{ background: brandColor }} />

      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         <div className="relative w-[320px] sm:w-[380px] aspect-square" style={{ transform: "translateZ(-80px)" }}>
            <div className="absolute top-0 left-0 w-10 h-10 border-t border-l opacity-30" style={{ borderColor: brandColor }} />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r opacity-30" style={{ borderColor: brandColor }} />
         </div>
      </motion.div>

      <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="z-10 pointer-events-none">
        
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
          <div className="absolute -inset-3 bg-black/60 blur-xl rounded-2xl shadow-[0_40px_60px_rgba(0,0,0,0.8)]" style={{ transform: "translateZ(-1px)" }} />

          <div 
            className="relative w-[240px] sm:w-[280px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm"
            style={{ 
              background: isAMD 
                ? "linear-gradient(135deg, #111111, #242424)"
                : "linear-gradient(135deg, #061122, #0d264f)",
              boxShadow: `inset 0 0 60px ${brandColor}40, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 10px rgba(0,0,0,0.8)`,
              transform: "translateZ(0)"
            }}
          >
            <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" 
                 style={{ 
                   backgroundImage: isAMD 
                     ? "repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 4px)" 
                     : "radial-gradient(circle, #fff 1px, transparent 1px)",
                   backgroundSize: isAMD ? "100% 100%" : "6px 6px"
                 }} 
            />

            {isAMD ? (
              <>
                <div className="absolute -right-10 -top-10 w-[150%] h-20 bg-[#ED1C24] opacity-20 rotate-45 blur-md" />
                <div className="absolute -left-10 -bottom-10 w-[150%] h-12 bg-[#ED1C24] opacity-30 -rotate-45 blur-sm" />
              </>
            ) : (
              <>
                <div className="absolute -top-10 -right-10 w-48 h-48 border-[6px] border-[#00A3E0] rounded-full opacity-20 blur-[2px]" />
                <div className="absolute -bottom-20 -left-10 w-64 h-64 border-[4px] border-[#00A3E0] rounded-full opacity-10 blur-[1px]" />
              </>
            )}

            <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30 pointer-events-none" style={{ x: innerShiftX, y: innerShiftY }}>
              {isAMD ? (
                <>
                  <div className="text-[#ED1C24] font-black text-6xl sm:text-7xl tracking-[-0.05em] leading-none mb-1 drop-shadow-[0_4px_15px_rgba(237,28,36,0.6)]" style={{ filter: "drop-shadow(0px 2px 0px #fff)" }}>
                    AMD
                  </div>
                  <div className="text-white text-3xl sm:text-4xl font-bold tracking-[0.2em] -mt-1 drop-shadow-lg">
                    RYZEN
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-2">
                     <span className="w-1.5 h-1.5 bg-[#ED1C24] rounded-full animate-pulse" style={{ boxShadow: "0 0 10px #ED1C24" }} />
                     <div className="text-[9px] sm:text-[11px] font-bold tracking-[0.4em] text-white/80 font-mono drop-shadow-md">
                       9000 SERIES
                     </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[#00A3E0] font-black text-6xl sm:text-7xl tracking-[-0.05em] leading-[0.85] drop-shadow-[0_4px_15px_rgba(0,163,224,0.6)]" style={{ filter: "drop-shadow(0px -1px 1px rgba(255,255,255,0.8))" }}>
                    INTEL
                  </div>
                  <div className="text-white text-4xl sm:text-5xl font-extrabold tracking-widest mt-1 drop-shadow-lg">
                    CORE<span className="text-xl align-top text-[#00A3E0]">™</span>
                  </div>
                  <div className="mt-8 px-4 py-1 border border-[#00A3E0]/40 rounded-full bg-[#00A3E0]/10 backdrop-blur-sm">
                    <div className="text-[9px] sm:text-[11px] tracking-[0.3em] text-[#00A3E0] font-mono font-bold drop-shadow-md">
                      i9 ULTRA // 14TH GEN
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            <motion.div 
              className="absolute -inset-[150%] z-40 pointer-events-none mix-blend-color-dodge opacity-50"
              style={{
                backgroundImage: "conic-gradient(from 0deg, transparent, rgba(255,0,128,0.3), rgba(0,255,255,0.3), transparent)",
                x: glareX,
                y: glareY,
              }}
            />

            <motion.div
              className="absolute -inset-[200%] z-50 pointer-events-none mix-blend-overlay"
              style={{
                background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.6) 55%, transparent 60%)",
                x: glareX,
              }}
            />

            <div className="absolute inset-0 rounded-2xl border-[1.5px] border-white/30 z-50 mix-blend-overlay pointer-events-none" style={{ boxShadow: "inset 0 0 20px rgba(255,255,255,0.2)" }} />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest text-white/30 z-50 w-full text-center">
              {isAMD ? "XTX ARCHITECTURE • ZEN 5" : "HYBRID ARCHITECTURE • EVO"}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function RamVisual({ accentColor, ramAmount }: { accentColor: string, ramAmount: number }) {
  const { t } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), { stiffness: 120, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), { stiffness: 120, damping: 25 });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["200%", "-200%"]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-full h-full min-h-[400px] flex items-center justify-center cursor-crosshair" style={{ perspective: "1500px" }}>
      <div className="absolute w-[60%] h-[40%] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ background: accentColor }} />

      <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none">
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-[340px] sm:w-[420px] h-[100px] sm:h-[120px]">
          
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/60 blur-xl rounded-[100%]" style={{ transform: "translateZ(-20px)" }} />

          <div className="absolute bottom-0 left-[2%] right-[2%] h-[40%] bg-[#111] rounded-b-md shadow-inner flex items-end justify-center px-2 pb-1 overflow-hidden" style={{ transform: "translateZ(5px)" }}>
             <div className="w-[45%] h-2.5 pcie-pins" />
             <div className="w-1.5 h-3 bg-[#0a0a0a] border-x border-[#333]" />
             <div className="w-[45%] h-2.5 pcie-pins" />
          </div>

          <div className="absolute top-2 inset-x-0 bottom-[15%] brushed-metal rounded-lg shadow-2xl overflow-hidden border border-[#555]/30 flex items-center justify-between px-6" style={{ transform: "translateZ(15px)" }}>
            
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 12px)" }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
            <div className="absolute left-[30%] top-0 bottom-0 w-8 bg-black/20 skew-x-[-25deg]" />
            <div className="absolute right-[30%] top-0 bottom-0 w-8 bg-black/20 skew-x-[25deg]" />

            <div className="relative z-10">
              <div className="text-white/80 font-black text-2xl sm:text-3xl tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>DDR5</div>
              <div className="text-[8px] sm:text-[10px] text-white/40 tracking-[0.3em] font-mono mt-0.5">ULTRA-LOW LATENCY</div>
            </div>

            <div className="relative z-10 flex flex-col items-end">
              <div className="text-transparent font-black text-3xl sm:text-4xl leading-none bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${accentColor}, #fff)` }}>
                {ramAmount}<span className="text-xl sm:text-2xl">GB</span>
              </div>
              <div className="text-[7px] sm:text-[9px] text-white/50 tracking-[0.2em] font-mono px-2 py-0.5 mt-1 border border-white/20 rounded-sm bg-black/30">
                6400 MT/s
              </div>
            </div>

            <motion.div className="absolute inset-0 z-20 mix-blend-overlay pointer-events-none opacity-50" style={{ background: "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 60%, transparent 80%)", x: glareX }} />
          </div>

          <div className="absolute top-0 inset-x-1 h-3 sm:h-4 rounded-t-lg bg-white/90 overflow-hidden shadow-[0_-5px_15px_rgba(255,255,255,0.2)] flex items-center justify-center" style={{ transform: "translateZ(20px)" }}>
             <motion.div className="absolute inset-0 opacity-80" animate={{ background: [`linear-gradient(90deg, ${accentColor}, #fff, ${accentColor})`, `linear-gradient(90deg, #fff, ${accentColor}, #fff)`, `linear-gradient(90deg, ${accentColor}, #fff, ${accentColor})`] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay opacity-30" />
             <div className="w-1/3 h-1 bg-black/20 rounded-full blur-[1px]" />
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}

function StorageVisual({ accentColor, storageName }: { accentColor: string, storageName: string }) {
  const { t } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), { stiffness: 100, damping: 30 });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["200%", "-200%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-full h-full min-h-[400px] flex items-center justify-center cursor-crosshair" style={{ perspective: "1500px" }}>
      <div className="absolute w-[60%] h-[40%] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: accentColor }} />

      <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="pointer-events-none">
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-[360px] sm:w-[440px] h-[85px] sm:h-[100px]">
          
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-10 bg-black/60 blur-xl rounded-[100%]" style={{ transform: "translateZ(-20px)" }} />

          <div className="absolute inset-y-2 left-0 right-10 nvme-pcb rounded-sm shadow-xl border border-white/5" style={{ transform: "translateZ(0px)" }}>
             <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#b5a642]/60 flex items-center justify-center bg-black/80">
               <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
             </div>
             <svg width="100%" height="100%" className="absolute inset-0 opacity-20">
               <path d="M 30,20 L 80,20 L 90,30 L 150,30" fill="none" stroke={accentColor} strokeWidth="1" />
               <path d="M 30,60 L 60,60 L 70,50 L 120,50" fill="none" stroke={accentColor} strokeWidth="1" />
             </svg>
          </div>

          <div className="absolute inset-y-3 right-0 w-10 flex flex-col items-start justify-center gap-1 overflow-hidden" style={{ transform: "translateZ(2px)" }}>
             <div className="w-full h-[40%] bg-[#8b6508] rounded-r-sm pcie-pins border-y border-r border-[#ffd700]/30 shadow-inner" />
             <div className="w-full h-[25%] bg-[#8b6508] rounded-r-sm pcie-pins border-y border-r border-[#ffd700]/30 shadow-inner" />
          </div>

          <div className="absolute right-[45px] top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1a1a1a] rounded-sm border border-[#333] shadow-md flex items-center justify-center" style={{ transform: "translateZ(8px)" }}>
             <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-40">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
             </div>
             <div className="absolute top-1 left-1 text-[4px] text-white/30 font-mono">PHISON</div>
          </div>

          <div className="absolute left-10 right-[100px] top-1/2 -translate-y-1/2 flex items-center justify-evenly" style={{ transform: "translateZ(8px)" }}>
             {[...Array(2)].map((_, i) => (
                <div key={i} className="w-[45%] h-14 bg-[#111] rounded-sm border border-[#222] shadow-sm relative overflow-hidden flex flex-col justify-end p-1">
                   <div className="text-[5px] text-white/20 font-mono">NAND 3D TLC</div>
                   <div className="text-[5px] text-white/20 font-mono tracking-widest">{Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
                   <motion.div className="absolute top-1 right-1 w-1 h-1 rounded-full" style={{ background: accentColor, filter: `blur(1px)` }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 2 + 0.5 }} />
                </div>
             ))}
          </div>

          <div className="absolute inset-y-3 left-8 right-[40px] rounded-sm border border-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-center px-4" style={{ background: "linear-gradient(135deg, #111, #222)", transform: "translateZ(12px)" }}>
            <div className="relative z-10 flex items-end justify-between w-full">
              <div>
                <div className="text-white font-black text-xl tracking-tight leading-none mb-1">PCIe Gen4</div>
                <div className="text-[7px] text-white/60 tracking-[0.2em] font-mono">{storageName.toUpperCase()}</div>
              </div>
              <div className="flex flex-col items-end">
                 <div className="text-xs font-bold px-1.5 py-0.5 rounded-sm mb-1 text-black" style={{ background: accentColor }}>NVMe M.2</div>
                 <div className="flex gap-1">
                   {[...Array(4)].map((_, i) => <div key={i} className="w-2 h-0.5 bg-white/40" />)}
                 </div>
              </div>
            </div>
            <motion.div className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-60" style={{ backgroundImage: "linear-gradient(115deg, transparent 20%, rgba(0, 245, 212, 0.4) 30%, rgba(155, 93, 229, 0.4) 40%, rgba(255, 77, 109, 0.4) 50%, transparent 60%)", x: glareX }} />
            <div className="absolute inset-0 z-30 pointer-events-none opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)" }} />
          </div>

          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-md" style={{ transform: "translateZ(1px)" }}>
             <motion.div className="absolute top-1/2 left-0 w-[50%] h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, filter: `drop-shadow(0 0 5px ${accentColor})` }} animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
             <motion.div className="absolute bottom-[30%] left-0 w-[30%] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} animate={{ x: ["-100%", "300%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: 0.4 }} />
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}

function GpuVisual({ accentColor }: { accentColor: string }) {
  const { t } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [28, -28]), { stiffness: 150, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-35, 35]), { stiffness: 150, damping: 25 });
  
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["150%", "-150%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["150%", "-150%"]);
  const holoShiftX = useTransform(mouseX, [-0.5, 0.5], [15, -15]);
  const holoShiftY = useTransform(mouseY, [-0.5, 0.5], [15, -15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const AdvancedFan = ({ delay = 0 }) => (
    <div className="w-[80px] sm:w-[95px] h-[80px] sm:h-[95px] rounded-full flex items-center justify-center relative overflow-hidden bg-black/60 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.9)_inset]" style={{ border: `1px solid ${accentColor}40` }}>
      <div className="absolute inset-[2px] rounded-full border-2 opacity-60" style={{ borderColor: accentColor, filter: `drop-shadow(0 0 6px ${accentColor})` }} />
      <motion.div className="w-full h-full relative" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.45, ease: "linear", delay }}>
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" style={{ filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.7))" }}>
          <defs>
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#999" />
              <stop offset="30%" stopColor="#444" />
              <stop offset="100%" stopColor="#111" />
            </radialGradient>
          </defs>
          {[...Array(11)].map((_, i) => (
            <path key={i} d="M50 50 C 65 30, 85 10, 95 25 C 80 45, 60 48, 50 50" fill="url(#bladeGrad)" stroke="#222" strokeWidth="0.5" transform={`rotate(${i * (360/11)} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="16" fill="url(#hubGrad)" />
          <circle cx="50" cy="50" r="10" fill="#000" />
          <circle cx="50" cy="50" r="8" fill={accentColor} fillOpacity="0.4" />
          <path d="M 46 50 L 50 44 L 54 50 L 50 56 Z" fill={accentColor} opacity="0.8" />
        </svg>
      </motion.div>
    </div>
  );

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-full h-full min-h-[480px] flex items-center justify-center cursor-crosshair" style={{ perspective: "1800px" }}>
      <div className="absolute w-[80%] h-[60%] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-700" style={{ background: accentColor }} />

      <motion.div style={{ x: holoShiftX, y: holoShiftY, rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
         <div className="relative w-[360px] sm:w-[420px] h-[180px] sm:h-[200px]" style={{ transform: "translateZ(120px)" }}>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 opacity-50" style={{ borderColor: accentColor }} />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 opacity-50" style={{ borderColor: accentColor }} />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 opacity-50" style={{ borderColor: accentColor }} />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 opacity-50" style={{ borderColor: accentColor }} />
            <div className="absolute -top-6 left-2 pdp-mono text-[9px] tracking-[0.3em] uppercase opacity-60" style={{ color: accentColor }}>Sys.Link // Active</div>
            <div className="absolute -bottom-6 right-2 pdp-mono text-[9px] tracking-[0.3em] uppercase opacity-60" style={{ color: accentColor }}>TDP: 450W / MAX</div>
         </div>
      </motion.div>

      <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none">
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-[300px] sm:w-[360px] h-[130px] sm:h-[150px]">
          
          <div className="absolute -left-5 top-2 w-5 h-[110%] bg-gradient-to-r from-gray-400 to-gray-500 rounded-l-md shadow-2xl border-l-2 border-gray-300 flex flex-col justify-between py-4 items-center" style={{ transform: "translateZ(10px) rotateY(-10deg)", transformOrigin: "right" }}>
            <div className="w-full flex flex-col gap-1 px-1">
               {[...Array(4)].map((_, i) => <div key={i} className="w-full h-1.5 bg-[#111] rounded-sm shadow-inner opacity-80" />)}
            </div>
            <div className="flex flex-col gap-2">
               <div className="w-3 h-2 bg-[#050505] rounded-sm border border-gray-600 shadow-inner" />
               <div className="w-3 h-2 bg-[#050505] rounded-sm border border-gray-600 shadow-inner" />
               <div className="w-3 h-2 bg-[#050505] rounded-sm border border-gray-600 shadow-inner" />
            </div>
          </div>

          <div className="absolute -bottom-6 left-16 w-36 h-8 rounded-b-sm border-b-2 border-x-2 border-[#b5a642] overflow-hidden" style={{ background: "#8b6508", transform: "translateZ(15px)" }}>
             <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, #ffd700 2px, #ffd700 5px)" }} />
             <div className="absolute bottom-0 left-10 w-2 h-full bg-[#111] shadow-inner" />
          </div>

          <div className="absolute inset-0 rounded-lg shadow-2xl overflow-hidden" style={{ background: "#151515", border: "1px solid #333", transform: "translateZ(0px)" }}>
            <svg width="100%" height="100%" className="opacity-30 absolute inset-0">
               <pattern id="pcb" width="30" height="30" patternUnits="userSpaceOnUse">
                 <path d="M 0,15 L 10,15 L 15,20 L 30,20 M 15,0 L 15,10 L 20,15" fill="none" stroke={accentColor} strokeWidth="0.5" />
                 <circle cx="10" cy="15" r="1.5" fill={accentColor} />
                 <circle cx="20" cy="15" r="1.5" fill={accentColor} />
               </pattern>
               <rect width="100%" height="100%" fill="url(#pcb)" />
            </svg>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 border border-[#444] rounded-md bg-[#0a0a0a] shadow-inner flex flex-wrap gap-1 p-1.5">
               {[...Array(16)].map((_, i) => <div key={i} className="w-[calc(25%-4px)] h-[calc(25%-4px)] bg-[#222] rounded-sm border border-[#333]" />)}
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#050505] border-2 border-[#222] rounded-md shadow-[0_0_30px_rgba(0,0,0,1)] flex items-center justify-center" style={{ transform: "translate(-50%, -50%) translateZ(12px)" }}>
             <motion.div className="w-10 h-10 rounded-sm blur-[2px]" style={{ background: accentColor }} animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.05, 0.9] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-color-burn" />
          </div>

          <div className="absolute inset-x-1 top-2 bottom-2 rounded-md flex flex-col justify-evenly px-4 shadow-2xl overflow-hidden bg-[#1a1a1a]" style={{ transform: "translateZ(28px)", backgroundImage: "repeating-linear-gradient(0deg, #333, #333 2px, #111 2px, #111 5px)" }}>
             <div className="absolute top-[20%] -left-2 w-[110%] h-3 rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.8)]" style={{ background: "linear-gradient(180deg, #b85c29 0%, #fca46d 30%, #8a3f16 80%, #3d1704 100%)" }} />
             <div className="absolute top-[50%] -left-2 w-[110%] h-3 rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.8)]" style={{ background: "linear-gradient(180deg, #b85c29 0%, #fca46d 30%, #8a3f16 80%, #3d1704 100%)" }} />
             <div className="absolute top-[80%] -left-2 w-[110%] h-3 rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.8)]" style={{ background: "linear-gradient(180deg, #b85c29 0%, #fca46d 30%, #8a3f16 80%, #3d1704 100%)" }} />
          </div>

          <div className="absolute -inset-3 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-evenly px-2 backdrop-blur-md" 
               style={{ 
                 background: "linear-gradient(135deg, rgba(30,30,30,0.85), rgba(10,10,10,0.95))", 
                 border: `1px solid rgba(255,255,255,0.08)`, 
                 clipPath: "polygon(5% 0, 95% 0, 100% 15%, 100% 85%, 95% 100%, 5% 100%, 0 85%, 0 15%)",
                 transform: "translateZ(65px)" 
               }}>
            
            <motion.div className="absolute w-[300%] h-[300%] pointer-events-none mix-blend-screen opacity-30" style={{ background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 40%)", x: glareX, y: glareY }} />

            <div className="absolute top-0 left-[20%] w-2 h-full bg-black/40 skew-x-[25deg] border-x border-white/5" />
            <div className="absolute top-0 right-[20%] w-2 h-full bg-black/40 skew-x-[-25deg] border-x border-white/5" />

            <div className="absolute top-0 inset-x-10 h-1.5 opacity-90" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, boxShadow: `0 0 20px ${accentColor}` }} />
            <div className="absolute bottom-0 inset-x-10 h-1.5 opacity-90" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, boxShadow: `0 0 20px ${accentColor}` }} />
            
            <div className="absolute top-1/2 left-3 -translate-y-1/2 -rotate-90 pdp-display text-[8px] tracking-[0.4em] text-white/50">GEFORCE</div>

            <AdvancedFan delay={0} />
            <AdvancedFan delay={0.15} />
            <AdvancedFan delay={0.3} />
          </div>

          <div className="absolute top-0 right-12 w-14 h-5 bg-[#0a0a0a] border border-[#333] rounded-t-sm flex items-center justify-center gap-[2px] px-1 shadow-2xl" style={{ transform: "translateY(-100%) translateZ(45px)" }}>
            {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-3 bg-gray-300 rounded-[1px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />)}
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}

function DisplayVisual({ accentColor }: { accentColor: string }) {
  const { t } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 30 });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["200%", "-200%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["200%", "-200%"]);
  
  const innerShiftX = useTransform(mouseX, [-0.5, 0.5], [15, -15]);
  const innerShiftY = useTransform(mouseY, [-0.5, 0.5], [15, -15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-full h-full min-h-[480px] flex items-center justify-center cursor-crosshair" style={{ perspective: "1500px" }}>
      
      <div className="absolute w-[70%] h-[50%] rounded-full blur-[120px] opacity-30 pointer-events-none" style={{ background: accentColor }} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ transform: "translateZ(-100px)" }}>
         {[...Array(8)].map((_, i) => (
           <motion.div 
             key={`particle-${i}`}
             className="absolute w-2 h-2 rounded-full blur-[1px]"
             style={{ background: accentColor, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.4 }}
             animate={{ y: [0, -150], x: [0, (Math.random() - 0.5) * 50], opacity: [0, 0.6, 0] }}
             transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
           />
         ))}
      </div>

      <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none z-10">
         
         <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-[340px] sm:w-[440px] h-[212px] sm:h-[275px]">
           
           <div className="absolute inset-0 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-[#ffffff15] overflow-hidden backdrop-blur-md" style={{ background: `linear-gradient(135deg, rgba(20,20,20,0.4), rgba(5,5,5,0.2))`, transform: "translateZ(0px)" }}>
              <div className="absolute inset-[3px] rounded-[14px] border border-black/40 shadow-inner" />
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)`, backgroundSize: "3px 3px" }} />
           </div>

           <motion.div className="absolute inset-[4px] rounded-[12px] overflow-hidden flex items-center justify-center pointer-events-none" style={{ transform: "translateZ(15px)", x: innerShiftX, y: innerShiftY }}>
              
              <div className="relative w-32 h-32 rounded-full border border-dashed flex items-center justify-center opacity-70" style={{ borderColor: accentColor, animation: "pdp-spin-slow 20s linear infinite" }}>
                 <div className="w-24 h-24 rounded-full border border-white/20" style={{ animation: "pdp-spin-slow-reverse 15s linear infinite" }} />
                 <div className="absolute inset-0 flex items-center justify-center pdp-display text-2xl font-black mix-blend-plus-lighter" style={{ color: accentColor, animation: "pdp-breathe 4s ease-in-out infinite" }}>
                   16"
                 </div>
              </div>

              <div className="absolute bottom-4 left-4 flex items-end gap-1.5 opacity-60">
                 {[...Array(6)].map((_, i) => (
                    <motion.div key={`bar-${i}`} className="w-1.5 rounded-t-sm" style={{ background: accentColor, filter: `drop-shadow(0 0 8px ${accentColor})` }} animate={{ height: [10, 20 + Math.random() * 30, 10] }} transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }} />
                 ))}
              </div>

              <div className="absolute top-4 right-5 text-right opacity-50">
                 <div className="pdp-mono text-[8px] tracking-[0.2em] text-white">NANO-IPS // OLED</div>
                 <div className="pdp-mono text-[7px] tracking-[0.3em] mt-1" style={{ color: accentColor }}>100% DCI-P3</div>
              </div>

              <motion.div animate={{ top: ["-10%", "110%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, opacity: 0.5, boxShadow: `0 0 15px ${accentColor}` }} />
           </motion.div>

           <div className="absolute inset-0 rounded-2xl border-[0.5px] border-white/30 overflow-hidden pointer-events-none" style={{ transform: "translateZ(30px)" }}>
              <motion.div className="absolute -inset-[150%] pointer-events-none mix-blend-screen opacity-50" style={{ background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 55%, transparent 60%)", x: glareX, y: glareY }} />
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.15)]" />
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.5)` }} />
           </div>

         </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 40, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.2, duration: 0.8 }} className="absolute z-30 top-[5%] right-[2%] lg:right-[6%] max-w-[180px] sm:max-w-[220px] backdrop-blur-xl border rounded-xl p-3 sm:p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] pointer-events-none" style={{ borderColor: `${accentColor}40`, background: `${t.bgSecondary}b3` }}>
         <div className="pdp-mono text-[9px] sm:text-[10px] uppercase tracking-widest mb-1.5 opacity-60" style={{ color: t.textSecondary }}>Color Accuracy</div>
         <div className="pdp-body text-sm sm:text-base font-bold" style={{ color: t.text }}>ΔE {"<"} 1.0</div>
         <div className="w-full h-1.5 mt-2.5 rounded-full overflow-hidden flex gap-0.5 bg-black/40">
            <motion.div className="h-full bg-[#ff4d6d]" initial={{ width: 0 }} whileInView={{ width: "25%" }} transition={{ duration: 1, delay: 1.5 }} />
            <motion.div className="h-full bg-[#f5a623]" initial={{ width: 0 }} whileInView={{ width: "25%" }} transition={{ duration: 1, delay: 1.7 }} />
            <motion.div className="h-full bg-[#10b981]" initial={{ width: 0 }} whileInView={{ width: "25%" }} transition={{ duration: 1, delay: 1.9 }} />
            <motion.div className="h-full bg-[#00f5d4]" initial={{ width: 0 }} whileInView={{ width: "25%" }} transition={{ duration: 1, delay: 2.1 }} />
         </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -40, y: -20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.5, duration: 0.8 }} className="absolute z-30 bottom-[10%] left-[2%] lg:left-[6%] max-w-[200px] sm:max-w-[240px] backdrop-blur-xl border rounded-xl p-3 sm:p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-3 pointer-events-none" style={{ borderColor: `${accentColor}40`, background: `${t.bgSecondary}b3` }}>
         <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 relative overflow-hidden" style={{ borderColor: `${accentColor}60`, color: accentColor }}>
            <div className="absolute inset-0 opacity-20" style={{ background: accentColor }} />
            <FontAwesomeIcon icon={faDisplay} className="text-xs relative z-10" />
         </div>
         <div className="min-w-0">
           <div className="pdp-mono text-[9px] sm:text-[10px] uppercase tracking-widest mb-0.5 opacity-60 truncate" style={{ color: t.textSecondary }}>Panel Tech</div>
           <div className="pdp-body text-sm font-bold truncate" style={{ color: t.text }}>Edge-to-Edge Glass</div>
         </div>
      </motion.div>

    </div>
  );
}

function BatteryVisual({ accentColor }: { accentColor: string }) {
  const { t } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [22, -22]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), { stiffness: 100, damping: 30 });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["200%", "-200%"]);
  
  const layer1X = useTransform(mouseX, [-0.5, 0.5], [10, -10]);
  const layer1Y = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const layer2X = useTransform(mouseX, [-0.5, 0.5], [25, -25]);
  const layer2Y = useTransform(mouseY, [-0.5, 0.5], [25, -25]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-full h-full min-h-[420px] flex items-center justify-center cursor-crosshair" style={{ perspective: "1800px" }}>
      
      <div className="absolute w-[60%] h-[50%] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ background: accentColor }} />

      <motion.div animate={{ y: [-12, 12, -12] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none">
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-[340px] sm:w-[420px] h-[160px] sm:h-[190px]">
          
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[90%] h-16 bg-black/70 blur-2xl rounded-[100%]" style={{ transform: "translateZ(-40px)" }} />

          <div className="absolute inset-x-2 inset-y-0 rounded-xl bg-[#0f0f0f] border border-[#222] shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between p-2" style={{ transform: "translateZ(-15px)" }}>
             <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, #1a1a1a 10px, #1a1a1a 12px)" }} />
             {[...Array(4)].map((_, i) => (
                <div key={`screw-${i}`} className={`absolute w-3 h-3 rounded-full border border-[#333] bg-[#050505] flex items-center justify-center shadow-inner ${i===0?'top-2 left-2':i===1?'top-2 right-2':i===2?'bottom-2 left-2':'bottom-2 right-2'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
                </div>
             ))}
          </div>

          <div className="absolute inset-0 p-4 flex gap-3 z-10" style={{ transform: "translateZ(5px)" }}>
            {[...Array(3)].map((_, i) => (
              <div key={`cell-${i}`} className="flex-1 relative rounded-lg border border-[#333] overflow-hidden shadow-inner flex flex-col justify-center bg-[#050505]">
                <svg width="100%" height="100%" className="absolute inset-0 opacity-20">
                  <pattern id={`hex-${i}`} width="14" height="24" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                    <path d="M7 0L14 4V12L7 16L0 12V4L7 0Z" fill="none" stroke={accentColor} strokeWidth="1" />
                  </pattern>
                  <rect width="100%" height="100%" fill={`url(#hex-${i})`} />
                </svg>
                <div className="absolute inset-x-0 bottom-0 top-1/4 rounded-t-sm opacity-80 mix-blend-screen" style={{ background: `linear-gradient(0deg, ${accentColor} 0%, transparent 100%)` }} />
                <motion.div 
                  className="absolute inset-0 opacity-60"
                  style={{ background: `repeating-linear-gradient(180deg, transparent, transparent 4px, ${accentColor} 4px, ${accentColor} 5px)` }}
                  animate={{ backgroundPosition: ["0px 0px", "0px -40px"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full" />
                <div className="absolute bottom-2 left-2 pdp-mono text-[6px] text-white/50 tracking-widest bg-black/40 px-1 rounded-sm">
                  BANK_0{i+1}
                </div>
              </div>
            ))}
          </div>

          <motion.div className="absolute top-1/2 -left-3 -translate-y-1/2 w-10 h-16 bg-[#111] border border-[#444] rounded-sm shadow-xl flex flex-col items-center justify-center gap-1 z-20" style={{ transform: "translateZ(15px)", x: layer1X, y: layer1Y }}>
             <div className="w-6 h-6 bg-[#0a0a0a] border border-[#333] rounded-sm flex flex-wrap gap-[1px] p-[2px]">
               {[...Array(9)].map((_, i) => <div key={i} className="w-[calc(33.33%-1px)] h-[calc(33.33%-1px)] bg-[#222]" />)}
             </div>
             <div className="pdp-mono text-[5px] text-white/40 tracking-widest mt-1">BMS.AI</div>
             <motion.div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          </motion.div>

          <motion.div className="absolute -inset-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden z-30 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)", transform: "translateZ(30px)", x: layer2X, y: layer2Y }}>
            <motion.div className="absolute inset-0 mix-blend-overlay opacity-60" style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.6) 55%, transparent 70%)", x: glareX }} />
            <motion.div className="absolute top-0 bottom-0 w-[2px] opacity-50 shadow-[0_0_15px_currentColor]" style={{ background: accentColor, color: accentColor }} animate={{ left: ["-10%", "110%", "-10%"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
            <div className="absolute inset-4 flex flex-col justify-between">
               <div className="flex justify-between items-start">
                 <div>
                   <div className="pdp-display text-white font-black text-3xl sm:text-4xl leading-none tracking-tighter" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                     99.9<span className="text-sm sm:text-lg text-white/70">Wh</span>
                   </div>
                   <div className="pdp-mono text-[7px] sm:text-[9px] text-white/60 tracking-[0.3em] mt-1 drop-shadow-md">
                     SOLID-STATE GRAPHENE
                   </div>
                 </div>
                 
                 <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm border backdrop-blur-md" style={{ borderColor: `${accentColor}40`, background: `${accentColor}10` }}>
                     <FontAwesomeIcon icon={faCheck} style={{ color: accentColor, fontSize: "8px" }} />
                     <span className="pdp-mono text-[7px] text-white tracking-widest">TSA APPROVED</span>
                   </div>
                   <div className="pdp-mono text-[8px] sm:text-[10px] text-white/40 tracking-[0.2em] mt-2">
                     CAPACITY: <span className="text-white">8600mAh</span>
                   </div>
                 </div>
               </div>

               <div className="flex justify-between items-end w-full">
                 <div className="w-8 h-8 border-l-2 border-b-2 opacity-50" style={{ borderColor: accentColor }} />
                 <div className="flex flex-col items-center">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-1 rounded-full bg-white/20 overflow-hidden relative">
                          <motion.div className="absolute inset-y-0 left-0 w-full" style={{ background: accentColor }} animate={i===4 ? { x: ["-100%", "0%"] } : {}} transition={i===4 ? { duration: 1.5, repeat: Infinity } : {}} />
                        </div>
                      ))}
                    </div>
                    <div className="pdp-mono text-[6px] tracking-[0.4em] text-white/50">FAST CHARGE 0-50% 35M</div>
                 </div>
                 <div className="w-8 h-8 border-r-2 border-b-2 opacity-50" style={{ borderColor: accentColor }} />
               </div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Chapter({ index, stat, statSuffix, label, headline, body, accentColor, icon, supportLines, flip = false, visualNode }: {
  index: number; stat: number | string; statSuffix: string; label: string;
  headline: string; body: string; accentColor: string; icon: any;
  supportLines: string[]; flip?: boolean; visualNode?: React.ReactNode;
}) {
  const { t } = useTheme();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const lineW = useTransform(scrollYProgress, [0.2, 0.65], ["0%", "100%"]);
  const inView = useInView(ref, { once: true, margin: "-100px 0px" });

  const numericStat = typeof stat === 'string' ? parseFloat(stat) : stat;

  return (
    <section ref={ref} className={`relative min-h-[90vh] flex flex-col ${flip ? "lg:flex-row-reverse" : "lg:flex-row"} items-stretch overflow-hidden`}>
      <div className="pdp-display absolute pointer-events-none select-none z-0 leading-none" style={{ fontSize: "clamp(16rem,32vw,30rem)", color: accentColor, opacity: 0.028, top: "50%", transform: "translateY(-50%)", [flip ? "right" : "left"]: "-0.04em" }} aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </div>

      <motion.div style={{ y: textY }} className="relative z-20 w-full lg:w-[45%] xl:w-[48%] flex flex-col justify-center px-6 md:px-12 lg:px-20 py-24 lg:py-36 pointer-events-none">
        <motion.div initial={{ opacity: 0, x: flip ? 24 : -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.1 }} className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}>
            <FontAwesomeIcon icon={icon} style={{ color: accentColor, fontSize: "1.05rem" }} />
          </div>
          <span className="pdp-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: accentColor }}>{label}</span>
        </motion.div>

        <div style={{ marginBottom: "1rem" }}>
          <motion.div 
            initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }} 
            animate={inView ? { clipPath: "inset(0 0 -20px 0)", opacity: 1 } : {}} 
            transition={{ duration: 1.15, delay: 0.18, ease: [0.16, 1, 0.3, 1] }} 
            className="pdp-display leading-[0.92]" 
            style={{ fontSize: "clamp(5rem,12vw,8.5rem)", color: t.text }}
          >
            <CountUp to={numericStat} suffix={statSuffix} duration={1700} />
          </motion.div>
        </div>

        <div className="pdp-mono text-[13px] tracking-[0.14em] mb-3 h-5" style={{ color: accentColor, opacity: 0.72 }}>
          <TypewriterStat lines={supportLines} accentColor={accentColor} typingSpeed={38} pauseDuration={1800} deletingSpeed={22} />
        </div>

        <div className="h-px w-full overflow-hidden mb-7" style={{ background: t.borderLight }}>
          <motion.div style={{ width: lineW, height: "100%", background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
        </div>

        <WordReveal text={headline} delay={0.28} className="pdp-display mb-5 leading-[1.06]" style={{ fontSize: "clamp(1.7rem,3.5vw,2.8rem)", color: t.text }} />
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 0.58 } : {}} transition={{ duration: 1.1, delay: 0.55 }} className="pdp-body text-base md:text-lg font-medium leading-relaxed max-w-[38ch]" style={{ color: t.text }}>
          {body}
        </motion.p>
      </motion.div>

      <div className="relative z-10 w-full lg:w-[55%] xl:w-[52%] flex items-center justify-center min-h-[50vh] lg:min-h-0 py-16 lg:py-0">
         {visualNode || <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse 75% 65% at 50% 50%, ${accentColor}12, transparent 72%)` }} />}
      </div>
    </section>
  );
}

function ChapterDivider({ accentColor }: { accentColor: string }) {
  return (
    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="origin-left mx-6 md:mx-12 lg:mx-20" style={{ height: 1, background: `linear-gradient(90deg, ${accentColor}45, transparent 65%)` }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC CONTENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

interface ChapterContent {
  headline: string;
  body: string;
  supportLines: string[];
}

function getRamContent(gb: number): ChapterContent {
  if (gb <= 8) return {
    headline: "Essential performance.",
    body: "Reliable DDR5 memory for your everyday tasks and smooth light browsing.",
    supportLines: ["8GB DDR5", "Entry-level performance", "Everyday tasks & light browsing"]
  };
  if (gb <= 16) return {
    headline: "Fluid multitasking.",
    body: "Switch between demanding applications effortlessly without slowdowns or bottlenecks.",
    supportLines: ["16GB DDR5", "Smooth multitasking", "Creative apps without compromise"]
  };
  if (gb <= 32) return {
    headline: "Zero bottleneck. Instant bandwidth.",
    body: "Blazing fast DDR5 memory ensures your massive assets load in the blink of an eye. Multitask heavily without a single stutter.",
    supportLines: ["32GB DDR5", "Content creation ready", "Heavy workloads, zero slowdown"]
  };
  if (gb <= 48) return {
    headline: "Pro-tier workflow.",
    body: "Massive memory overhead designed for heavy 3D rendering, video editing, and AI workflows.",
    supportLines: ["48GB DDR5", "Pro workstation tier", "3D rendering & AI workflows"]
  };
  return {
    headline: "No memory ceiling. Ever.",
    body: "Extreme capacity for the most demanding workstation tasks, heavy simulations, and massive datasets.",
    supportLines: ["64GB DDR5", "Extreme workstation class", "No memory ceiling. Ever."]
  };
}

function getStorageContent(size: number, unit: string, spec: string): ChapterContent {
  if (unit === "GB" && size <= 512) return {
    headline: "Fast, compact storage.",
    body: "PCIe Gen4 NVMe technology delivers extreme read and write speeds, keeping your daily apps responsive.",
    supportLines: [spec, "Compact, speedy storage", "PCIe Gen4 NVMe speed"]
  };
  if (unit === "TB" && size === 1) return {
    headline: "Boot in seconds.",
    body: "1TB of PCIe Gen4 NVMe technology delivers extreme read and write speeds. Say goodbye to loading screens.",
    supportLines: [spec, "1TB of blazing speed", "Room for your entire workflow"]
  };
  if (unit === "TB" && size === 2) return {
    headline: "Infinite library. Zero load times.",
    body: "2TB of blazing fast PCIe Gen4 NVMe storage. Keep your games, projects, and archives instantly accessible.",
    supportLines: [spec, "2TB NVMe storage", "Games, projects & archives — all onboard"]
  };
  return {
    headline: "Extreme capacity meets speed.",
    body: "Massive NVMe storage allowing you to carry your entire enterprise-grade library with direct storage optimization.",
    supportLines: [spec, "Extreme storage capacity", "DirectStorage optimized"]
  };
}

function getCpuContent(cpuRaw: string): ChapterContent {
  const cpu = cpuRaw.toLowerCase();
  if (cpu.includes("ultra 9") || cpu.includes("ultra9") || cpu.includes("ryzen 9")) return {
    headline: "Zero compromise. Maximum output.",
    body: "The newest flagship architecture pushes every boundary. Extreme multitasking, hyper-threaded rendering, and unparalleled performance.",
    supportLines: [cpuRaw, "Flagship tier processor", "AI-accelerated. Thermally supreme."]
  };
  if (cpu.includes("ultra 7") || cpu.includes("ultra7") || cpu.includes("i7") || cpu.includes("ryzen 7")) return {
    headline: "High-end power. Refined.",
    body: "Engineered to handle heavy multitasking, intense gaming, and creative workloads effortlessly without breaking a sweat.",
    supportLines: [cpuRaw, "High-performance chip", "Built for creators & gamers"]
  };
  if (cpu.includes("ultra 5") || cpu.includes("ultra5") || cpu.includes("i5") || cpu.includes("ryzen 5")) return {
    headline: "Efficiency meets raw speed.",
    body: "The perfect balance of price-to-performance, delivering snappy responsiveness for both work and play.",
    supportLines: [cpuRaw, "Mainstream powerhouse", "Perfect balance & efficiency"]
  };
  return {
    headline: "Next-gen processing power.",
    body: "Experience seamless performance with advanced architecture built for modern computing demands and daily reliability.",
    supportLines: [cpuRaw, "Reliable everyday performance", "Smart power, modern architecture"]
  };
}

function getGpuContent(gpuRaw: string): ChapterContent {
  const gpu = gpuRaw.toLowerCase();
  if (gpu.includes("4090") || gpu.includes("5090") || gpu.includes("rx 7900")) return {
    headline: "Every pixel. Absolute fidelity.",
    body: "Next-gen rasterization and ray tracing at maximum settings. Engineered for creators, dominates for gamers. No compromises at any resolution.",
    supportLines: [gpuRaw, "The undisputed flagship", "Desktop replacement. Truly."]
  };
  if (gpu.includes("4080") || gpu.includes("5080") || gpu.includes("rx 7800")) return {
    headline: "Near-flagship dominance.",
    body: "Incredible real-time ray tracing and high-resolution performance. The ultimate tool for elite gamers and professional creators.",
    supportLines: [gpuRaw, "High-end powerhouse", "Creator & gamer in one chip."]
  };
  if (gpu.includes("4070") || gpu.includes("5070") || gpu.includes("rx 6800") || gpu.includes("rx 6700")) return {
    headline: "The sweet spot of performance.",
    body: "Advanced frame generation and DLSS capabilities. Experience buttery smooth 1440p gaming and accelerated creative workflows.",
    supportLines: [gpuRaw, "Mainstream champion", "1440p king. Proven architecture."]
  };
  return {
    headline: "Engineered for visual fidelity.",
    body: "Dedicated graphics designed to enhance your visual experience, offering great framerates and efficient thermal output.",
    supportLines: [gpuRaw, "Dedicated graphics", "Efficient, capable, reliable."]
  };
}

function getDisplayContent(hz: number, spec: string): ChapterContent {
  const isOLED = spec.toLowerCase().includes("oled");
  const tech = isOLED ? "OLED" : "Nano-IPS";
  return {
    headline: "Every frame, every gradient, exact.",
    body: `${tech} technology with factory calibration below ΔE 1.0. ${hz}Hz adaptive sync eliminates tearing. You won't find the border between this display and reality.`,
    supportLines: [`${tech} · ΔE < 1.0`, `Adaptive Sync · No Tearing`, `${hz}Hz Refresh Rate`]
  };
}

function getBatteryContent(hours: number): ChapterContent {
  if (hours >= 10) return {
    headline: "Sunrise to midnight. Unplugged.",
    body: "Intelligent power routing across efficiency and performance cores. A full day of creative work without hunting for an outlet.",
    supportLines: ["Intelligent Power Routing", "0 → 50% in 35 Minutes", `${hours}h Maximum Endurance`]
  };
  return {
    headline: "Unleashed mobility.",
    body: "Optimized battery life for extended gaming and work sessions on the go. Fast charge capabilities keep you moving.",
    supportLines: ["Smart Power Management", "Fast Charge Supported", `Up to ${hours} Hours Battery`]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductDetailPage({ product }: { product: Product }) {
  const { theme, t } = useTheme();
  const { addToCart } = useCart();
  const { wishIds, toggleWish } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<ColorVariant>(
    product.colorVariants?.[0] || { name: "Default", hex: C.cyan }
  );
  const [isAdded, setIsAdded] = useState(false);
  const isWished = wishIds.includes(product.id);

  // Mouse parallax (hero only)
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.7 });
  const sy = useSpring(my, { stiffness: 40, damping: 20, mass: 0.7 });
  const imgX  = useTransform(sx, [-500, 500], [-28, 28]);
  const imgYt = useTransform(sy, [-500, 500], [-28, 28]);
  const bgX   = useTransform(sx, [-500, 500], [14, -14]);
  const bgYt  = useTransform(sy, [-500, 500], [14, -14]);

  // Scroll transforms
  const { scrollYProgress } = useScroll();
  const scrollVel  = useVelocity(scrollYProgress);
  const heroScale  = useTransform(scrollYProgress, [0, 0.22], [1, 0.8]);
  const heroOp     = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const heroTextY  = useTransform(scrollYProgress, [0, 0.18], [0, -65]);
  const heroTextOp = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const heroSkew   = useTransform(scrollVel, [-0.8, 0, 0.8], ["-2.5deg", "0deg", "2.5deg"]);
  const barY       = useTransform(scrollYProgress, [0.2, 0.28], [120, 0]);
  const barOp      = useTransform(scrollYProgress, [0.2, 0.28], [0, 1]);

  const handleAddToCart = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.png"
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2800);
  }, [addToCart, product]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const cpuSpec = product.specs.find(s => s.label.toLowerCase().includes("cpu"))?.value || "Intel Core Ultra 9";
  const ramRaw  = product.specs.find(s => s.label.toLowerCase().includes("ram"))?.value || "32GB";
  const ramNum  = parseInt(ramRaw) || 32;
  const stoSpec = product.specs.find(s => s.label.toLowerCase().includes("storage"))?.value || "2TB PCIe Gen4";
  const gpuSpec = product.specs.find(s => s.label.toLowerCase().includes("gpu"))?.value || "RTX 4090";

  const storageMatch = stoSpec.match(/(\d+)\s*(TB|GB)/i);
  const storageSize = storageMatch ? parseInt(storageMatch[1]) : 2;
  const storageUnit = storageMatch ? storageMatch[2].toUpperCase() : "TB";

  const md = product.technical_metadata;

  const cpuLower = md.cpu.toLowerCase();
  const cpuAccent = cpuLower.includes("amd") ? "#ED1C24" : cpuLower.includes("intel") ? "#0071C5" : C.cyan;

  const gpuLower = md.gpu.toLowerCase();
  const gpuAccent = (gpuLower.includes("rtx") || gpuLower.includes("nvidia")) ? "#76B900" : (gpuLower.includes("rx") || gpuLower.includes("radeon")) ? "#ED1C24" : C.emerald;

  // استخراج المحتوى الديناميكي لجميع الفصول
  const displaySpec = product.specs.find(s => s.label.toLowerCase().includes("display"))?.value || "Nano-IPS";
  const displayContent = getDisplayContent(md.display_hz, displaySpec);
  const batteryContent = getBatteryContent(md.battery_hours);
  const cpuContent = getCpuContent(md.cpu);
  const gpuContent = getGpuContent(md.gpu);
  const ramContent = getRamContent(ramNum);
  const storageContent = getStorageContent(storageSize, storageUnit, stoSpec);

  const connectivity = md.connectivity ??[];
  const marqueeItems =[
    cpuSpec.split(" ").slice(0, 4).join(" "),
    `${ramNum}GB DDR5`,
    `${md.display_hz}Hz Display`,
    stoSpec.split(" ").slice(0, 3).join(" "),
    gpuSpec.split(" ").slice(0, 3).join(" "),
    `${md.battery_hours}hr Battery`,
    ...connectivity.slice(0, 3),
  ].filter(Boolean) as string[];

  const cpuCoresNum = parseInt(String(md.cpu_cores)) || 24;
  const gpuVramNum = parseInt(String(md.vram_gb)) || 16;

  return (
    <main className="pdp-body relative min-h-screen -mt-20 sm:-mt-24" style={{ backgroundColor: t.bg, color: t.text }}>

      <GlobalStyles />
      <GrainOverlay strength={theme === "dark" ? 0.038 : 0.02} />

      {/* ════════════════════ HERO ════════════════════ */}
      <section
        className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left - r.width / 2);
          my.set(e.clientY - r.top - r.height / 2);
        }}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
      >
        <motion.div style={{ x: bgX, y: bgYt }} className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full opacity-[0.045]" style={{ position: "absolute", inset: 0 }}>
            <defs><pattern id="g" width="52" height="52" patternUnits="userSpaceOnUse"><path d="M52 0L0 0 0 52" fill="none" stroke={t.gridStroke} strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#g)" />
          </svg>
        </motion.div>

        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 78% 68% at 50% 50%, transparent 18%, ${theme === "dark" ? "#000000ec" : "transparent"} 100%)` }} />

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}13, transparent 65%)`, top: "50%", left: "42%", transform: "translate(-50%,-50%)", animation: "pdp-breathe 11s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}11, transparent 65%)`, top: "34%", left: "63%", transform: "translate(-50%,-50%)", animation: "pdp-breathe 14s ease-in-out 1.8s infinite" }} />
        </div>

        <div className="absolute z-0 pointer-events-none" style={{ width: 500, height: 500, borderRadius: "50%", background: `conic-gradient(from 180deg, transparent 0deg, ${selectedColor.hex}18 55deg, transparent 110deg)`, filter: "blur(55px)", opacity: 0.55, top: "50%", left: "50%", transform: "translate(-50%,-50%)", transition: "background 0.8s ease" }} />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-16 pt-28 pb-16 flex flex-col lg:flex-row items-center gap-10">
          <motion.div style={{ y: heroTextY, opacity: heroTextOp, skewX: heroSkew }} className="w-full lg:w-[44%] flex flex-col z-20 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05 }} className="mb-6 flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: selectedColor.hex, animation: "pdp-breathe 2.2s ease-in-out infinite" }} />
              <span className="pdp-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: t.textSecondary }}>{product.brand} · {product.category}</span>
            </motion.div>

            <div className="pdp-display mb-6 leading-[0.94] tracking-[-0.01em]" style={{ fontSize: "clamp(3.2rem,8vw,6.5rem)" }}>
              <SplitReveal text={product.name} delay={0.12} />
            </div>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.88 }} className="pdp-body text-base md:text-lg font-medium leading-relaxed mb-10 max-w-md mx-auto lg:mx-0" style={{ color: t.textSecondary }}>
              {product.tagline}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.08 }} className="flex flex-col sm:flex-row items-center lg:items-start gap-5 mb-8">
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-end gap-3 mb-1.5">
                  <span className="pdp-display leading-none" style={{ fontSize: "clamp(2.4rem,6vw,4rem)" }}>${product.price.toLocaleString()}</span>
                  {discount > 0 && <span className="pdp-body text-lg line-through mb-1 opacity-30">${product.originalPrice?.toLocaleString()}</span>}
                </div>
                {discount > 0 && <span className="pdp-mono text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-widest" style={{ background: `${C.rose}20`, color: C.rose }}>Save {discount}% · ${((product.originalPrice || 0) - product.price).toLocaleString()} off</span>}
              </div>

              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="sm:ml-auto flex flex-col items-center lg:items-end">
                  <span className="pdp-mono text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2.5">{selectedColor.name}</span>
                  <div className="flex items-center gap-2.5">
                    {product.colorVariants.map((cv) => (
                      <button key={cv.name} onClick={() => setSelectedColor(cv)} title={cv.name} className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300" style={{ borderColor: selectedColor.name === cv.name ? cv.hex : "transparent" }}>
                        <div className="w-4 h-4 rounded-full" style={{ background: cv.hex }} />
                        {selectedColor.name === cv.name && (
                          <motion.div layoutId="cv-ring" className="absolute -inset-1 rounded-full border" style={{ borderColor: cv.hex, boxShadow: `0 0 14px ${cv.hex}50` }} transition={{ type: "spring", stiffness: 360, damping: 28 }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.28 }} className="flex items-center gap-3 justify-center lg:justify-start">
              <MagneticBtn onClick={handleAddToCart} accentColor={selectedColor.hex} confirmed={isAdded}>
                <FontAwesomeIcon icon={isAdded ? faCheck : faCartShopping} /> {isAdded ? "Added to Cart" : "Add to Cart"}
              </MagneticBtn>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(product.id); }} className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 group" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <FontAwesomeIcon icon={faHeart} className="transition-opacity" style={{ color: isWished ? C.rose : t.textSecondary, opacity: isWished ? 1 : 0.35 }} />
              </button>
            </motion.div>
          </motion.div>

          <motion.div style={{ x: imgX, y: imgYt, scale: heroScale, opacity: heroOp }} className="w-full lg:w-[56%] relative flex items-center justify-center h-[320px] md:h-[540px] z-10 shrink-0">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-16 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse, ${selectedColor.hex}20 0%, transparent 70%)`, filter: "blur(18px)" }} />
            <div className="relative w-full h-full" style={{ animation: "pdp-float 7.5s ease-in-out infinite" }}>
              <motion.img initial={{ scale: 2.8, opacity: 0, filter: "blur(45px)" }} animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }} transition={{ duration: 1.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} src={product.images[0]} alt={product.name} className="w-full h-full object-contain relative z-10" draggable={false} style={{ filter: "drop-shadow(0 55px 95px rgba(0,0,0,0.45)) drop-shadow(0 12px 24px rgba(0,0,0,0.3))" }} />
              {[
                { label: "CPU",   val: cpuSpec.split(" ").slice(0, 3).join(" "), color: C.cyan,   s: { top: "16%", left: "4%" },   d: 1.5 },
                { label: "GPU",   val: gpuSpec.split(" ").slice(0, 3).join(" "), color: C.purple, s: { top: "56%", right: "2%" },  d: 1.7 },
                { label: "NVMe",  val: stoSpec.split(" ").slice(0, 2).join(" "), color: C.amber,  s: { bottom: "17%", left: "8%" }, d: 1.9 },
              ].map((pin) => (
                <motion.div key={pin.label} initial={{ opacity: 0, scale: 0.45, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: pin.d, ease: [0.16, 1, 0.3, 1] }} className="absolute z-30 pointer-events-none" style={pin.s}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border whitespace-nowrap" style={{ background: `${t.bgSecondary}cc`, borderColor: `${pin.color}28` }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pin.color, animation: "pdp-pulse-dot 2.5s ease-in-out infinite" }} />
                    <div>
                      <p className="pdp-mono text-[9px] uppercase tracking-widest opacity-38 mb-0.5">{pin.label}</p>
                      <p className="pdp-body text-xs font-semibold">{pin.val}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
          <span className="pdp-mono text-[10px] uppercase tracking-[0.22em] opacity-22">Scroll</span>
          <div style={{ width: 1, height: 44, background: t.borderLight, overflow: "hidden", opacity: 0.28 }}>
            <motion.div style={{ width: "100%", height: "50%", background: "currentColor" }} animate={{ y: [-44, 44] }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        </motion.div>
      </section>

      {/* ════════════════════ MARQUEE ════════════════════ */}
      <Marquee items={marqueeItems} />

      {/* ════════════════════ CINEMATIC CHAPTERS ════════════════════ */}

      {/* Chapter 1 — CPU */}
      <Chapter
        index={0}
        stat={cpuCoresNum}
        statSuffix=" Cores"
        label="Processing Power"
        headline={cpuContent.headline}
        body={cpuContent.body}
        accentColor={cpuAccent}
        icon={faMicrochip}
        supportLines={cpuContent.supportLines}
        visualNode={<CpuVisual accentColor={cpuAccent} />}
        flip={false}
      />
      <ChapterDivider accentColor={cpuAccent} />

      {/* Chapter 2 — Display */}
      <Chapter
        index={1}
        stat={md.display_hz}
        statSuffix="Hz"
        label="Visual Fidelity"
        headline={displayContent.headline}
        body={displayContent.body}
        accentColor={C.purple}
        icon={faDisplay}
        supportLines={displayContent.supportLines}
        visualNode={<DisplayVisual accentColor={C.purple} />}
        flip={true}
      />
      <ChapterDivider accentColor={C.purple} />

      {/* Chapter 3 — Memory (RAM) */}
      <Chapter
        index={2}
        stat={ramNum}
        statSuffix="GB"
        label="System Memory"
        headline={ramContent.headline}
        body={ramContent.body}
        accentColor={C.emerald}
        icon={faMemory}
        supportLines={ramContent.supportLines}
        visualNode={<RamVisual accentColor={C.emerald} ramAmount={ramNum} />}
        flip={false}
      />
      <ChapterDivider accentColor={C.emerald} />

      {/* Chapter 4 — Storage */}
      <Chapter
        index={3}
        stat={storageSize}
        statSuffix={storageUnit}
        label="Storage Speed"
        headline={storageContent.headline}
        body={storageContent.body}
        accentColor={C.blue}
        icon={faHardDrive}
        supportLines={storageContent.supportLines}
        visualNode={<StorageVisual accentColor={C.blue} storageName={stoSpec} />}
        flip={true}
      />
      <ChapterDivider accentColor={C.blue} />

      {/* Chapter 5 — Battery */}
      <Chapter
        index={4}
        stat={md.battery_hours}
        statSuffix="hr"
        label="Endurance"
        headline={batteryContent.headline}
        body={batteryContent.body}
        accentColor={C.amber}
        icon={faBatteryFull}
        supportLines={batteryContent.supportLines}
        visualNode={<BatteryVisual accentColor={C.amber} />}
        flip={false}
      />
      <ChapterDivider accentColor={C.amber} />

      {/* Chapter 6 — GPU */}
      <Chapter
        index={5}
        stat={gpuVramNum}
        statSuffix="GB"
        label="Graphics Power"
        headline={gpuContent.headline}
        body={gpuContent.body}
        accentColor={gpuAccent}
        icon={faShieldHalved}
        supportLines={gpuContent.supportLines}
        visualNode={<GpuVisual accentColor={gpuAccent} />}
        flip={true}
      />
      <ChapterDivider accentColor={gpuAccent} />

      {/* ════════════════════ FULL SPECS ════════════════════ */}
      <section className="relative z-10 py-28 md:py-40 px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-16 gap-8 flex-wrap">
          <div>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="pdp-mono text-[11px] uppercase tracking-[0.24em] mb-3 block" style={{ color: C.cyan }}>
              Full Specifications
            </motion.span>
            <motion.div initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }} className="pdp-display leading-[0.94]" style={{ fontSize: "clamp(3rem,7vw,6rem)", color: t.text }}>
              Under<br />The Hood.
            </motion.div>
          </div>

          <div className="flex items-end gap-10 md:gap-16">
            {[
              { n: product.rating,      s: "★",    l: "Rating",     c: C.amber  },
              { n: ramNum,              s: "GB",   l: "DDR5 RAM",   c: C.cyan   },
              { n: md.nvme_speed_gbs,   s: "GB/s", l: "NVMe Speed", c: C.purple },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.12 }} className="text-center">
                <div className="pdp-display leading-none mb-1" style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)", color: s.c }}>
                  <CountUp to={s.n} suffix={s.s} />
                </div>
                <span className="pdp-mono text-[10px] uppercase tracking-widest opacity-38">{s.l}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${t.borderLight}` }}>
          {product.specs.map((spec, i) => (
            <motion.div key={spec.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-28px 0px" }} transition={{ duration: 0.6, delay: (i % 6) * 0.065, ease: [0.16, 1, 0.3, 1] }} whileHover={{ paddingLeft: "1.2rem" }} className="group flex items-center justify-between gap-6 py-[1.1rem] transition-all duration-300 cursor-default" style={{ borderBottom: `1px solid ${t.borderLight}` }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-0.5 h-5 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: spec.color || C.cyan }} />
                <span className="pdp-mono text-[11px] uppercase tracking-[0.14em] truncate opacity-45">{spec.label}</span>
              </div>
              <span className="pdp-body text-sm md:text-base font-semibold text-right shrink-0">{spec.value}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════ CLOSING CTA ════════════════════ */}
      <section className="relative min-h-[72vh] flex flex-col items-center justify-center text-center overflow-hidden py-24 px-6 md:px-12 lg:px-20" style={{ borderTop: `1px solid ${t.borderLight}` }}>
        <div className="pdp-display absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" style={{ fontSize: "clamp(8rem,23vw,21rem)", color: t.text, opacity: 0.022, lineHeight: 1 }} aria-hidden>
          {product.name.split(" ")[0]}
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 62% 52% at 50% 50%, ${C.purple}10, transparent 72%)` }} />

        <motion.div initial={{ opacity: 0, y: 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 flex flex-col items-center gap-7 max-w-2xl">
          <span className="pdp-mono text-[11px] uppercase tracking-[0.24em] opacity-42">Ready to own it?</span>
          <h2 className="pdp-display leading-[0.94]" style={{ fontSize: "clamp(3rem,8vw,6.5rem)", color: t.text }}>{product.name}</h2>
          <p className="pdp-body text-lg font-medium leading-relaxed opacity-50">{product.tagline}</p>
          <div className="flex items-center gap-4 flex-wrap justify-center mt-2">
            <MagneticBtn onClick={handleAddToCart} accentColor={selectedColor.hex} confirmed={isAdded}>
              <FontAwesomeIcon icon={isAdded ? faCheck : faCartShopping} /> {isAdded ? "Added to Cart" : `Add to Cart — $${product.price.toLocaleString()}`}
            </MagneticBtn>
            <button className="pdp-body h-14 md:h-16 px-8 rounded-xl border font-semibold text-base transition-all duration-300 hover:opacity-60" style={{ borderColor: t.borderLight, background: "transparent", color: t.text }}>
              Compare Models
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ background: C.emerald, animation: "pdp-breathe 2.2s ease-in-out infinite" }} />
            <span className="pdp-mono text-[10px] uppercase tracking-widest opacity-42">In Stock · Ships within 24hr</span>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════ STICKY BAR ════════════════════ */}
      <motion.div style={{ y: barY, opacity: barOp }} className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-3 md:p-4">
        <div className="max-w-5xl mx-auto rounded-2xl backdrop-blur-2xl border pointer-events-auto flex items-center justify-between px-5 md:px-8 py-3 md:py-4" style={{ background: `${t.bgOverlay}`, borderColor: t.borderLight, boxShadow: `0 -4px 60px rgba(0,0,0,0.18), 0 0 0 1px ${t.borderLight}` }}>
          <div className="hidden md:flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0" style={{ background: t.cardBg, borderColor: t.borderLight }}>
              <img src={product.images[0]} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="pdp-body text-sm font-semibold leading-tight">{product.name}</p>
              <p className="pdp-mono text-[10px] opacity-32 uppercase tracking-widest">{selectedColor.name}</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            {[cpuSpec.split(" ").slice(0, 2).join(" "), `${ramNum}GB DDR5`, `${md.display_hz}Hz`].map((pill, i) => (
              <span key={i} className="pdp-mono text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg" style={{ background: t.cardBg, color: t.textSecondary, border: `1px solid ${t.borderLight}` }}>{pill}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex flex-col items-end leading-none">
              <span className="pdp-display text-[1.6rem]">${product.price.toLocaleString()}</span>
              <span className="pdp-mono text-[10px] uppercase tracking-widest flex items-center gap-1 mt-0.5" style={{ color: C.emerald }}><FontAwesomeIcon icon={faBolt} /> In Stock</span>
            </div>
            <MagneticBtn onClick={handleAddToCart} accentColor={selectedColor.hex} confirmed={isAdded} compact>
              <FontAwesomeIcon icon={isAdded ? faCheck : faCartShopping} /> {isAdded ? "Added!" : "Buy Now"}
            </MagneticBtn>
          </div>
        </div>
      </motion.div>
    </main>
  );
}