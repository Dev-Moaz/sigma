"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence
} from "framer-motion";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBolt,
  faShieldHalved,
  faTruck,
  faPhone,
  faStar,
  faTag,
  faChevronLeft,
  faChevronRight,
  faGaugeHigh,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";
import { Particles } from "@/components/ui/Particles";
import { CinematicReveal as CinematicScrollReveal } from "@/components/ui/CinematicReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import ProductCard from "@/components/ui/ProductCard";
import { getLaptopsFromDb } from "@/lib/supabase-service";
import type { Product } from "@/lib/laptop-schema";

/* ─── البيانات الأساسية ─────────────────────────────────────────── */
const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "2K+", label: "Products" },
  { value: "99%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
];

const TRUST_BADGES = [
  { icon: faTruck, label: "Free Shipping", sub: "Orders over $999", color: "#0ea5e9" },
  { icon: faShieldHalved, label: "2-Year Warranty", sub: "All products", color: "#10b981" },
  { icon: faPhone, label: "24/7 Support", sub: "Always here", color: "#8b5cf6" },
  { icon: faTag, label: "Best Price", sub: "Price match guarantee", color: "#f59e0b" },
];

const FEATURED_CHIPS = ["Gaming", "Ultrabooks", "Workstations", "2-in-1"];

const BRANDS = [
  "Apple", "ASUS ROG", "MSI", "Razer", "Dell XPS",
  "Lenovo", "HP Omen", "Samsung", "Acer Predator", "Gigabyte",
];

const MARQUEE_SET = [...BRANDS, ...BRANDS];

const SPEC_CARDS_DARK = [
  { id: 1, label: "GPU", value: "RTX 5090", color: "#76b900", delay: 0, position: { bottom: "28%", left: "4%" }, align: "left" },
  { id: 2, label: "CPU", value: "Ultra 9 285HX", color: "#0071c5", delay: 0.3, position: { bottom: "28%", right: "4%" }, align: "right" },
  { id: 3, label: "RAM", value: "64GB DDR5", color: "#8b5cf6", delay: 0.6, position: { top: "12%", left: "4%" }, align: "left" },
  { id: 4, label: "Storage", value: "4TB NVMe", color: "#06b6d4", delay: 0.9, position: { top: "12%", right: "4%" }, align: "right" },
];

const SPEC_CARDS_LIGHT = [
  { id: 1, label: "GPU", value: "RTX™ 5080", color: "#76b900", delay: 0, position: { bottom: "28%", left: "4%" }, align: "left" },
  { id: 2, label: "CPU", value: "Ryzen™ 9 HX", color: "#ef4444", delay: 0.3, position: { bottom: "28%", right: "4%" }, align: "right" },
  { id: 3, label: "Display", value: "3K OLED", color: "#8b5cf6", delay: 0.6, position: { top: "12%", left: "4%" }, align: "left" },
  { id: 4, label: "Refresh", value: "120Hz", color: "#06b6d4", delay: 0.9, position: { top: "12%", right: "4%" }, align: "right" },
];

const REVIEW_AVATARS = [
  { letter: "J", color: "#0ea5e9" },
  { letter: "M", color: "#7c3aed" },
  { letter: "A", color: "#06b6d4" },
  { letter: "K", color: "#3b82f6" },
];

/* ─── المكونات الفرعية التفاعلية ────────────────────────────────────── */

function TypewriterText({ text, delay = 0, speed = 60, accentText }: { text: string; delay?: number; speed?: number; accentText?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(start);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(timer);
  }, [started, displayed, text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="inline-block w-0.5 h-[0.85em] rounded-sm ml-1 align-middle"
          style={{
            background: accentText || "linear-gradient(180deg,#06b6d4,#3b82f6)",
            boxShadow: `0 0 8px ${accentText || "#06b6d4"}`,
          }}
        />
      )}
    </span>
  );
}

function RotatingTypewriter({
  words,
  delay = 0,
  typeSpeed = 100,
  deleteSpeed = 60,
  pauseDuration = 1800,
  accentText,
}: {
  words: string[];
  delay?: number;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  accentText?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"waiting" | "typing" | "pausing" | "deleting">("waiting");

  useEffect(() => {
    const startTimer = setTimeout(() => setPhase("typing"), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (phase === "waiting") return;

    const currentWord = words[wordIndex % words.length];

    if (phase === "typing") {
      if (displayed.length < currentWord.length) {
        const t = setTimeout(() => setDisplayed(currentWord.slice(0, displayed.length + 1)), typeSpeed);
        return () => clearTimeout(t);
      } else {
        setPhase("pausing");
      }
    }

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), pauseDuration);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), deleteSpeed);
        return () => clearTimeout(t);
      } else {
        setWordIndex((i) => i + 1);
        setPhase("typing");
      }
    }
  }, [phase, displayed, wordIndex, words, typeSpeed, deleteSpeed, pauseDuration]);

  return (
    <span>
      {displayed}
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        className="inline-block w-0.5 h-[0.85em] rounded-sm ml-1 align-middle"
        style={{
          background: accentText || "linear-gradient(180deg,#06b6d4,#3b82f6)",
          boxShadow: `0 0 8px ${accentText || "#06b6d4"}`,
        }}
      />
    </span>
  );
}

function CountUp({ target }: { target: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  const match = target.match(/^([\d.]+)(.*)$/);
  const numeric = match ? parseFloat(match[1]) : NaN;
  const rest = match ? match[2] : target;

  useEffect(() => {
    if (!inView || isNaN(numeric)) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * numeric));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(numeric);
    };
    requestAnimationFrame(step);
  }, [inView, numeric]);

  if (isNaN(numeric)) return <span ref={ref}>{target}</span>;
  return <span ref={ref}>{val}{rest}</span>;
}

/* ─── شبكة الخلفية التفاعلية ────────────────────────────────── */
function GridBg({ parallaxX, parallaxY, isBlurred }: { parallaxX: any; parallaxY: any; isBlurred: boolean }) {
  const { t } = useTheme();
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden z-0 will-change-[transform,filter] transition-all duration-700 ease-out max-md:!transform-none"
      style={{
        x: parallaxX,
        y: parallaxY,
        filter: isBlurred ? "blur(8px) scale(1.02)" : "blur(0px) scale(1)"
      }}
    >
      <svg aria-hidden="true" className="absolute inset-0 w-[110%] h-[110%] left-[5%] top-[5%] opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={t.gridStroke} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, ${t.radialMask} 75%)` }} />
    </motion.div>
  );
}

/* ─── بطاقة المواصفات الذكية HUD مع محاكاة عمق المجال ───────────────── */
interface SpecCardProps {
  id: number;
  label: string;
  value: string;
  color: string;
  delay: number;
  style: React.CSSProperties;
  align: string;
  isAnyHovered: boolean;
  isSelfHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function SpecCard({
  id, label, value, color, delay, style, align,
  isAnyHovered, isSelfHovered, onHoverStart, onHoverEnd
}: SpecCardProps) {
  const { t } = useTheme();
  const baseRevealDelay = 0.2;

  // الحالات البصرية المستوحاة من السينما للتضبيب والتركيز
  const cardScale = isSelfHovered ? 1.12 : (isAnyHovered ? 0.92 : 1);
  const cardBlur = isSelfHovered ? "blur(0px)" : (isAnyHovered ? "blur(4px)" : "blur(0px)");
  const cardOpacity = isSelfHovered ? 1 : (isAnyHovered ? 0.35 : 1);
  const cardDepthZ = isSelfHovered ? "60px" : "0px";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 15 }}
      animate={{
        opacity: cardOpacity,
        scale: cardScale,
        y: 0,
        filter: cardBlur,
        z: cardDepthZ
      }}
      transition={{
        opacity: { duration: 0.4, ease: "easeOut" },
        scale: { type: "spring", stiffness: 180, damping: 15 },
        filter: { duration: 0.4 },
        z: { duration: 0.3 }
      }}
      style={{
        ...style,
        zIndex: isSelfHovered ? 50 : 20,
        transformStyle: "preserve-3d"
      }}
      className="absolute cursor-pointer group hidden md:block will-change-[transform,filter,opacity]"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <motion.div
        animate={{ y: isSelfHovered ? 0 : [0, -4, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 overflow-hidden"
        style={{
          background: t.bgSecondary,
          borderColor: isSelfHovered ? color : `${color}40`,
          boxShadow: isSelfHovered
            ? `0 0 30px ${color}40, inset 0 0 15px ${color}15`
            : `0 0 20px ${color}10, inset 0 0 10px ${color}05`,
        }}
      >
        {/* تأثير التوهج الخلفي الطيفي للبطاقة المحددة */}
        <AnimatePresence>
          {isSelfHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none -z-10"
              style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
            />
          )}
        </AnimatePresence>

        {/* خط التوصيل والنقطة الذكية */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
          style={{
            [align === "left" ? "left" : "right"]: "100%",
            flexDirection: align === "left" ? "row" : "row-reverse",
            width: 40
          }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isSelfHovered ? 1.2 : 1 }}
            className="h-px w-full"
            style={{
              background: `linear-gradient(to ${align === "left" ? "right" : "left"}, ${color}${isSelfHovered ? 'FF' : '80'}, transparent)`,
              originX: align === "left" ? 0 : 1,
            }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isSelfHovered ? 1.5 : 1, opacity: 1 }}
            className="w-1 h-1 rounded-full shadow-[0_0_8px] shrink-0"
            style={{ background: color, color: color, boxShadow: `0 0 8px ${color}` }}
          />
        </div>

        {/* النقطة النابضة بمحيط بؤرة التركيز */}
        <div className="relative w-2 h-2 rounded-full shrink-0 transition-transform duration-300" style={{ background: color, boxShadow: `0 0 10px ${color}` }}>
          <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: color }} />
        </div>

        <div className="leading-tight">
          <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5 opacity-70 transition-colors duration-300" style={{ color: t.textSecondary }}>{label}</p>
          <p className="hf text-sm font-bold tracking-wide transition-colors duration-300" style={{ color: t.text }}>{value}</p>
        </div>

        {/* تأثير لمعان سينمائي أفقي (Anamorphic Flare Style Line) يمر عبر البطاقة المفعلة */}
        {isSelfHovered && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-[50%] skew-x-12 opacity-30 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── اللابتوب مع تأثير سحب التركيز البصري السينمائي ─────────────────────── */
interface LaptopImageProps {
  parallaxX: any;
  parallaxY: any;
  rotateX: any;
  rotateY: any;
  isBlurred: boolean; // استلام إشارة التركيز لسحب البؤرة خلف البطاقات
}

function LaptopImage({ parallaxX, parallaxY, rotateX, rotateY, isBlurred }: LaptopImageProps) {
  const { theme, t } = useTheme();

  // تضبيب وتظليم المنتج ومحاكاة تشتيت العدسة السينمائية
  const laptopFilter = isBlurred
    ? "blur(6px) saturate(70%) brightness(75%)"
    : "blur(0px) saturate(100%) brightness(100%)";

  return (
    <motion.div
      style={{
        perspective: 1200,
        x: parallaxX,
        y: parallaxY,
        willChange: "transform"
      }}
      className="relative w-full max-w-xl mx-auto z-10 flex justify-center items-center max-md:!transform-none"
    >
      {/* هالة التوهج المحيطية تتضخم لتعطي طابع بؤرة مشتتة (Bokeh) عند تشتيت التركيز */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square rounded-full -z-10 pointer-events-none transition-all duration-700"
        style={{
          background: theme === "dark"
            ? `radial-gradient(circle closest-side, ${t.glowCyan}35 0%, ${t.glowPurple}18 50%, transparent 100%)`
            : `radial-gradient(circle closest-side, #0ea5e91A 0%, #8b5cf60A 50%, transparent 100%)`
        }}
        animate={{
          scale: isBlurred ? 1.15 : 1,
          opacity: isBlurred ? 0.9 : 0.7
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      <motion.div
        initial={{ opacity: 0.3, scale: 0.95, y: 20 }}
        animate={{
          opacity: 1,
          scale: isBlurred ? 0.97 : 1,
          y: 0,
          filter: laptopFilter
        }}
        transition={{
          scale: { duration: 0.6, ease: "easeOut" },
          filter: { duration: 0.6, ease: "easeOut" },
          opacity: { delay: 0.1, duration: 0.8 }
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-md:!opacity-100 max-md:!transform-none will-change-[transform,filter]"
      >
        {/* الظل الفيزيائي */}
        <div
          aria-hidden="true"
          className="absolute -bottom-6 left-[10%] right-[10%] h-16 -z-10"
          style={{
            background: theme === "dark"
              ? "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 75%)"
              : "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 40%, transparent 75%)"
          }}
        />

        <Image
          src={theme === "light" ? "/laptop-hero-light-theme.png" : "/laptop-hero-dark-theme.png"}
          alt="Elite Gaming Laptop"
          width={1000}
          height={814}
          priority={true}
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-auto object-contain select-none relative z-10"
          draggable={false}
          style={{
            transform: "translateZ(30px)"
          }}
        />

        <motion.div
          className="absolute -bottom-8 left-[15%] right-[15%] h-12 -z-10 rounded-[100%]"
          style={{
            background: theme === "dark"
              ? `radial-gradient(ellipse closest-side, ${t.glowCyan}60 0%, ${t.glowPurple}30 50%, transparent 100%)`
              : `radial-gradient(ellipse closest-side, #06b6d440 0%, #8b5cf620 50%, transparent 100%)`
          }}
          animate={{ opacity: [0.6, 0.9, 0.6], scaleX: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── مؤشر التمرير ─────────────────────────────────────────────── */
function ScrollIndicator() {
  const { t } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="flex flex-col items-center gap-2 py-6"
    >
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: t.textMuted }}>Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-6 h-10 rounded-full flex items-start justify-center pt-2"
        style={{ border: `2px solid ${t.borderLight}` }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1], scaleY: [1, 0.6, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-1 h-2 rounded-full"
          style={{ background: t.accentText }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── شريط العلامات التجارية المتحرك ──────────────────────────── */
function FeaturedBrands() {
  const { t } = useTheme();
  return (
    <div className="border-t overflow-hidden" style={{ borderTopColor: t.borderLight, background: t.bgSecondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: t.textMuted }}>Trusted by leading brands</p>
        <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {MARQUEE_SET.map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="text-sm font-bold tracking-wide shrink-0 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-default select-none"
                style={{ color: t.textSecondary }}
              >
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const CarouselStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
    }}
  />
);

/* ─── المكون الرئيسي لصفحة الـ Hero ────────────────────────────────── */
export default function HeroSection() {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);

  // حالة التحكم بالـ Depth of Field
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 40, damping: 20, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const bgX = useTransform(springX, [-500, 500], [15, -15]);
  const bgY = useTransform(springY, [-500, 500], [15, -15]);
  const laptopX = useTransform(springX, [-500, 500], [-15, 15]);
  const laptopY = useTransform(springY, [-500, 500], [-15, 15]);

  const laptopRotateX = useTransform(springY, [-500, 500], [6, -6]);
  const laptopRotateY = useTransform(springX, [-500, 500], [-6, 6]);

  const { theme, t } = useTheme();

  // State for below-the-fold content
  const [laptops, setLaptops] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLaptopsFromDb();
        setLaptops(data || []);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const trendingProducts = laptops.filter(p => p.isDeal).slice(0, 8);
  const carouselProducts = trendingProducts.length > 0 ? trendingProducts : laptops.slice(0, 8);
  const newArrivals = laptops.slice(0, 6);

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const amount = clientWidth * 0.8;
      const targetScroll = direction === "left" ? scrollLeft - amount : scrollLeft + amount;
      carouselRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  const VALUE_PROPS = [
    {
      icon: faGaugeHigh,
      title: "⚡ Next-Gen Performance",
      description: "All configurations are optimized for max thermal TDP, liquid metal application, and strictly stress-tested to guarantee peak unlocked capability.",
      color: "#06b6d4",
      bgGradient: "from-cyan-500/10 to-transparent",
    },
    {
      icon: faShieldHalved,
      title: "🛡️ Lifetime Support & 2-Yr Warranty",
      description: "Includes our industry-leading 2-year no-hassle warranty with advance replacements shipped first, plus direct 24/7 engineer support.",
      color: "#10b981",
      bgGradient: "from-emerald-500/10 to-transparent",
    },
    {
      icon: faTruck,
      title: "📦 Secure Flight Case Delivery",
      description: "Shipped in custom heavy-duty armored waterproof carry cases, securing your rig from warehouse to your battle station pristine.",
      color: "#8b5cf6",
      bgGradient: "from-purple-500/10 to-transparent",
    },
    {
      icon: faCreditCard,
      title: "💳 Elite Payment Flexibility",
      description: "Enjoy zero-percent installment options up to 36 months, instant crypto processing, and zero restocking fee standard 14-day returns.",
      color: "#f59e0b",
      bgGradient: "from-amber-500/10 to-transparent",
    },
  ];

  const currentSpecCards = useMemo(() => {
    return theme === "light" ? SPEC_CARDS_LIGHT : SPEC_CARDS_DARK;
  }, [theme]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(e.clientX - r.left - r.width / 2);
    mouseY.set(e.clientY - r.top - r.height / 2);
  };

  return (
    <>
      <section
        ref={ref}
        aria-label="Hero — Shop premium laptops and PC components"
        onMouseMove={handleMouseMove}
        style={{ backgroundColor: t.bgSecondary }}
        className="bf relative flex flex-col overflow-hidden"
      >
        {/* خلفية تشتيتية عامة (Vignette) تزداد كثافة وتعتيم لتنقل المشاهد إلى تجربة بصرية مغلقة */}
        {/* <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-40 transition-all duration-700"
          style={{
            background: hoveredCardId !== null
              ? `transparent`
              : `transparent`,
            mixBlendMode: theme === 'dark' ? 'normal' : 'multiply'
          }}
        /> */}

        {/* الهالة التوهجية الكبيرة في الخلفية */}
        <motion.div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 800,
            height: 800,
            background: `radial-gradient(circle closest-side, ${t.glowCyan}15 0%, transparent 100%)`,
            mixBlendMode: theme === 'dark' ? "screen" : "multiply",
          }}
          animate={{ opacity: hoveredCardId !== null ? [0.3, 0.4, 0.3] : [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* عناصر المحاكاة في الخلفية والجسيمات الطائرة (التي يتم تضبيبها أيضاً أثناء التركيز) */}
        <div aria-hidden="true" className="absolute inset-0 w-full h-full">
          <GridBg parallaxX={bgX} parallaxY={bgY} isBlurred={hoveredCardId !== null} />
          <div
            className="absolute inset-0 w-full h-full transition-all duration-700"
            style={{ filter: hoveredCardId !== null ? "blur(4px)" : "blur(0px)", opacity: hoveredCardId !== null ? 0.3 : 1 }}
          >
            <Particles count={30} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full flex flex-col z-20 pt-20 sm:pt-24 lg:pt-28 max-md:!opacity-100 max-md:!transform-none"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,55%)] max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-20 gap-6 sm:gap-8 lg:gap-0 items-center">

            {/* الكتلة النصية لليسار - تقل شفافيتها بنسبة خفيفة جداً للتركيز على محتوى اللابتوب والبطاقات */}
            <div
              className="flex flex-col items-center lg:items-start text-center lg:text-left z-20 transition-all duration-700"
              style={{
                filter: hoveredCardId !== null ? "blur(1.5px)" : "blur(0px)",
                opacity: hoveredCardId !== null ? 0.45 : 1
              }}
            >
              <motion.a href="/pc/gpu" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} whileHover={{ scale: 1.04, backgroundColor: t.accentTextHover }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold cursor-pointer transition-colors max-md:!opacity-100 max-md:!transform-none" style={{ background: t.accentBadge, border: `1px solid ${t.accentBadgeBorder}`, color: t.accentText }}>
                <motion.span aria-hidden="true" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.accentText }} />
                New Arrivals — RTX 5090 Series
                <motion.span className="inline-block" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="text-xs" /></motion.span>
              </motion.a>

              <div className="relative mb-6">
                <motion.h1
                  initial={{ opacity: 0.3, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="hf text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter max-md:!opacity-100 max-md:!scale-100 max-md:!translate-y-0 max-md:!transform-none"
                  style={{ color: t.text }}
                >
                  <span>Power Beyond</span>
                </motion.h1>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="relative max-md:!opacity-100">
                  <h1 aria-hidden="true" className="hf text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter invisible select-none">Limits.</h1>
                  <h1 className={`hf absolute inset-0 text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter bg-clip-text text-transparent bg-linear-to-r ${theme === "dark" ? "from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]" : "from-[#0891b2] via-[#2563eb] to-[#7c3aed]"}`}>
                    <RotatingTypewriter words={["Limits.", "Rivals.", "Speed.", "Reason."]} delay={0.3} typeSpeed={120} deleteSpeed={70} pauseDuration={2000} accentText={t.accentText} />
                  </h1>
                </motion.div>
              </div>

              <div className="relative text-base sm:text-lg leading-relaxed max-w-md mb-8">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="max-md:!opacity-100" style={{ color: t.textSecondary }}>
                  Unleash the future with our curated selection of elite laptops and PC components — built for creators, gamers, and visionaries.
                </motion.p>
              </div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="flex flex-wrap gap-2 justify-center lg:justify-start mb-10 max-md:!opacity-100 max-md:!transform-none">
                {FEATURED_CHIPS.map((chip) => (
                  <motion.button key={chip} whileHover={{ scale: 1.06, borderColor: t.chipBorder }} whileTap={{ scale: 0.96 }} className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors" style={{ background: t.cardBg, border: `1px solid ${t.border}`, color: t.textLink }}>{chip}</motion.button>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 z-30 max-md:!opacity-100 max-md:!transform-none">
                <MagneticButton onClick={() => router.push("/shop")} className="group flex w-full sm:w-auto items-center justify-center gap-3 h-14 px-10 rounded-2xl text-base font-bold shadow-2xl" style={{ color: t.text, background: theme === "dark" ? "linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#7c3aed 100%)" : "linear-gradient(135deg,#06b6d4 0%,#2563eb 70%,#7c3aed 100%)" }}>
                  <motion.div className="absolute inset-0 -skew-x-12 opacity-50" style={{ background: t.shimmer }} animate={{ x: ["-150%", "250%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }} />
                  <FontAwesomeIcon icon={faBolt} aria-hidden="true" className="relative z-10" />
                  <span className="relative z-10">Shop Now</span>
                  <motion.span className="group-hover:translate-x-1 transition-transform relative z-10"><FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="text-sm" /></motion.span>
                </MagneticButton>

                <MagneticButton onClick={() => router.push("/deals")} className="group flex w-full sm:w-auto items-center justify-center gap-3 h-14 px-10 rounded-2xl text-base font-bold shadow-lg transition-all" style={{ color: t.text, background: t.cardBg, border: `1px solid ${t.borderLight}` }}>
                  <FontAwesomeIcon icon={faTag} aria-hidden="true" className="relative z-10 text-amber-500" />
                  <span className="relative z-10">Deals</span>
                </MagneticButton>
              </motion.div>

              {/* Mini Trust Strip — contextual signal قرب الـ CTA */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-6 max-md:!opacity-100"
              >
                {TRUST_BADGES.slice(0, 3).map((badge) => (
                  <span key={badge.label} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: t.textSecondary }}>
                    <FontAwesomeIcon icon={badge.icon} aria-hidden="true" className="text-[11px]" style={{ color: badge.color }} />
                    {badge.label}
                  </span>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }} className="flex items-center gap-3 mt-6 max-md:!opacity-100">
                <div className="flex -space-x-2">
                  {REVIEW_AVATARS.map((av, i) => (
                    <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md" style={{ background: `linear-gradient(135deg, ${av.color}, ${t.bg})`, color: t.text, outline: `2px solid ${t.ring}`, outlineOffset: "-1px" }}>{av.letter}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1" role="img" aria-label="Rating: 4.9 out of 5 stars">
                    {[...Array(5)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} aria-hidden="true" className="text-amber-400 text-[10px]" />)}
                    <span className="font-bold text-sm ml-1" style={{ color: t.text }}>4.9</span>
                  </div>
                  <p className="text-xs" style={{ color: t.textMuted }}>from 12,000+ reviews</p>
                </div>
              </motion.div>
            </div>

            {/* مساحة العرض التفاعلية ثلاثية الأبعاد اليمين - بؤرة التركيز */}
            <div className="relative flex items-center justify-center w-full overflow-visible z-10">
              <div className="hidden md:block">
                {currentSpecCards.map((card) => (
                  <SpecCard
                    key={card.id}
                    id={card.id}
                    label={card.label}
                    value={card.value}
                    color={card.color}
                    delay={card.delay}
                    style={card.position}
                    align={card.align}
                    isAnyHovered={hoveredCardId !== null}
                    isSelfHovered={hoveredCardId === card.id}
                    onHoverStart={() => setHoveredCardId(card.id)}
                    onHoverEnd={() => setHoveredCardId(null)}
                  />
                ))}
              </div>

              {/* اللابتوب يستقبل إشارة التضبيب البصري */}
              <LaptopImage
                parallaxX={laptopX}
                parallaxY={laptopY}
                rotateX={laptopRotateX}
                rotateY={laptopRotateY}
                isBlurred={hoveredCardId !== null}
              />
            </div>
          </div>

          <ScrollIndicator />
        </motion.div>

        <CinematicScrollReveal delay={0.1} className="relative z-20">
          <FeaturedBrands />
        </CinematicScrollReveal>

      </section>

      {/* --- Below-the-Fold content --- */}
      <div className="relative z-10 w-full" style={{ backgroundColor: t.bgSecondary }}>
        <CarouselStyles />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col gap-24">

          {/* ========================================================
            SECTION 1: 🔥 TRENDING PRODUCTS CAROUSEL
           ======================================================== */}
          <section aria-label="Trending Products" className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-3 mb-3">
                  <span className="w-8 h-1 rounded-full shrink-0" style={{ background: "linear-gradient(90deg,#06b6d4,#3b82f6)", boxShadow: "0 0 10px rgba(6,182,212,0.8)" }} />
                  <h3 className="hf text-[12px] font-extrabold uppercase tracking-[0.2em]" style={{ color: t.accentText }}>
                    Hot Picks
                  </h3>
                  <span className="w-8 h-1 rounded-full shrink-0" style={{ background: "linear-gradient(90deg,#3b82f6,#06b6d4)", boxShadow: "0 0 10px rgba(6,182,212,0.8)" }} />
                </div>
                <h2 className="hf text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold tracking-tighter" style={{ color: t.text }}>
                  🔥 Trending Rigs
                </h2>
                <p className="text-sm font-medium mt-1" style={{ color: t.textSecondary }}>
                  The most sought-after extreme-performance machines available right now.
                </p>
              </div>

              {/* Carousel navigation controls */}
              {!loading && carouselProducts.length > 0 && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollCarousel("left")}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300"
                    style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
                    aria-label="Scroll left"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollCarousel("right")}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300"
                    style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
                    aria-label="Scroll right"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                  </motion.button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex gap-6 overflow-hidden pb-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[310px] md:w-[340px] rounded-2xl border p-4 flex flex-col gap-4 animate-pulse shrink-0"
                    style={{ background: t.cardBg, borderColor: t.borderLight }}
                  >
                    <div className="h-44 rounded-xl bg-white/5" />
                    <div className="h-6 w-2/3 rounded-md bg-white/5" />
                    <div className="h-4 w-1/2 rounded-md bg-white/5" />
                    <div className="h-10 rounded-xl bg-white/5 mt-auto" />
                  </div>
                ))}
              </div>
            ) : carouselProducts.length > 0 ? (
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 scrollbar-hide"
              >
                {carouselProducts.map((product, idx) => (
                  <div
                    key={`trending-${product.id}`}
                    className="snap-start shrink-0 w-[310px] md:w-[340px] relative hover:z-50"
                  >
                    <ProductCard
                      product={product}
                      index={idx}
                      onQuickView={(p) => router.push(`/product/${p.id}`)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-2xl" style={{ borderColor: t.borderLight, background: t.cardBg }}>
                <p style={{ color: t.textSecondary }}>No trending products available.</p>
              </div>
            )}
          </section>

          {/* ========================================================
            TRUST BADGES — بعد المنتجات مباشرةً (contextual trust signal)
           ======================================================== */}
          <CinematicScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {TRUST_BADGES.map((badge) => (
                <motion.div
                  key={badge.label}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative flex items-center gap-5 p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300"
                  style={{ background: t.cardBg, border: `1px solid ${t.borderLight}`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${badge.color}0f, transparent 80%)` }} />
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg] shadow-xl" style={{ background: `${badge.color}15`, color: badge.color, border: `1px solid ${badge.color}30` }}>
                    <FontAwesomeIcon icon={badge.icon} aria-hidden="true" className="text-xl" />
                  </div>
                  <div className="leading-none z-10">
                    <p className="text-[16px] font-bold mb-1.5 transition-colors" style={{ color: t.text }}>{badge.label}</p>
                    <p className="text-[13px] font-medium" style={{ color: t.textSubtle }}>{badge.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CinematicScrollReveal>

          {/* ========================================================
            SECTION 2: 📦 NEW ARRIVALS GRID
           ======================================================== */}
          <section aria-label="New Arrivals" className="relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="w-8 h-1 rounded-full shrink-0" style={{ background: "linear-gradient(90deg,#06b6d4,#3b82f6)", boxShadow: "0 0 10px rgba(6,182,212,0.8)" }} />
                <h3 className="hf text-[12px] font-extrabold uppercase tracking-[0.2em]" style={{ color: t.accentText }}>
                  Latest Hardware
                </h3>
                <span className="w-8 h-1 rounded-full shrink-0" style={{ background: "linear-gradient(90deg,#3b82f6,#06b6d4)", boxShadow: "0 0 10px rgba(6,182,212,0.8)" }} />
              </div>
              <h2 className="hf text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold tracking-tighter" style={{ color: t.text }}>
                📦 New Arrivals
              </h2>
              <p className="text-sm font-medium mt-1 max-w-xl mx-auto" style={{ color: t.textSecondary }}>
                Direct from the silicon fabs. The absolute newest gaming rigs, pro ultrabooks, and dual-purpose setups.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border p-4 flex flex-col gap-4 animate-pulse"
                    style={{ background: t.cardBg, borderColor: t.borderLight }}
                  >
                    <div className="h-48 rounded-xl bg-white/5" />
                    <div className="h-6 w-2/3 rounded-md bg-white/5" />
                    <div className="h-4 w-1/2 rounded-md bg-white/5" />
                    <div className="h-10 rounded-xl bg-white/5 mt-auto" />
                  </div>
                ))}
              </div>
            ) : newArrivals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                {newArrivals.map((product, idx) => (
                  <CinematicScrollReveal
                    key={`new-arrival-${product.id}`}
                    delay={0.1 * (idx % 3)}
                    className="relative hover:z-50"
                  >
                    <ProductCard
                      product={product}
                      index={idx}
                      onQuickView={(p) => router.push(`/product/${p.id}`)}
                    />
                  </CinematicScrollReveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-2xl" style={{ borderColor: t.borderLight, background: t.cardBg }}>
                <p style={{ color: t.textSecondary }}>No new hardware arrivals at this moment.</p>
              </div>
            )}
          </section>

          {/* ========================================================
            STATS ROW — social proof قبل قرار الشراء النهائي
           ======================================================== */}
          <CinematicScrollReveal delay={0.1}>
            <div className="border-t border-b py-10" style={{ borderColor: t.borderLight }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.8 }}
                    className="flex flex-col items-center gap-1 border-r last:border-none px-2 lg:px-6 first:pl-0"
                    style={{ borderRightColor: t.borderLight }}
                  >
                    <span className={`hf text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r ${theme === "dark" ? "from-[#06b6d4] to-[#3b82f6]" : "from-[#0891b2] to-[#2563eb]"}`}>
                      <CountUp target={s.value} />
                    </span>
                    <span className="text-xs sm:text-sm font-medium tracking-wide uppercase" style={{ color: t.textTertiary }}>{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CinematicScrollReveal>

          {/* ========================================================
            SECTION 3: 📰 WHY CHOOSE SIGMA (Cinematic Grid)
           ======================================================== */}
          <section aria-label="Why Choose Sigma" className="relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="w-8 h-1 rounded-full shrink-0" style={{ background: "linear-gradient(90deg,#0ea5e9,#8b5cf6)", boxShadow: "0 0 10px rgba(139,92,246,0.8)" }} />
                <h3 className="hf text-[12px] font-extrabold uppercase tracking-[0.2em]" style={{ color: t.accentText }}>
                  The Sigma Standard
                </h3>
                <span className="w-8 h-1 rounded-full shrink-0" style={{ background: "linear-gradient(90deg,#8b5cf6,#0ea5e9)", boxShadow: "0 0 10px rgba(139,92,246,0.8)" }} />
              </div>
              <h2 className="hf text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold tracking-tighter" style={{ color: t.text }}>
                📰 Why Choose Sigma
              </h2>
              <p className="text-sm font-medium mt-1 max-w-xl mx-auto" style={{ color: t.textSecondary }}>
                We build machines to defy expectations. Discover the values that define our products and support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {VALUE_PROPS.map((prop, idx) => (
                <CinematicScrollReveal
                  key={idx}
                  delay={0.1 * idx}
                  className="group relative flex flex-col p-8 rounded-3xl border transition-all duration-500 overflow-hidden cursor-default"
                >
                  {/* Background glow & gradients */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 10% 20%, ${prop.color}15, transparent 70%)`
                    }}
                  />

                  {/* The card inner container */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
                    {/* Icon Panel */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[6deg] shadow-lg border"
                      style={{
                        background: `${prop.color}10`,
                        borderColor: `${prop.color}35`,
                        color: prop.color
                      }}
                    >
                      <FontAwesomeIcon icon={prop.icon} className="text-2xl" />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                      <h3
                        className="hf text-[20px] font-bold mb-3 transition-colors duration-300"
                        style={{ color: t.text }}
                      >
                        {prop.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed font-medium"
                        style={{ color: t.textSecondary }}
                      >
                        {prop.description}
                      </p>
                    </div>
                  </div>

                  {/* Subtle horizontal flare sweep on hover */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-[40%] skew-x-12 opacity-0 group-hover:opacity-20 pointer-events-none"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "250%" }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                    style={{
                      background: `linear-gradient(90deg, transparent, ${prop.color}, transparent)`
                    }}
                  />

                  {/* Styled structural border */}
                  <div
                    className="absolute inset-0 rounded-3xl border-2 transition-colors duration-500 pointer-events-none"
                    style={{
                      borderColor: `${t.borderLight}`,
                    }}
                  />
                  {/* Group hover glowing border accent */}
                  <div
                    className="absolute inset-0 rounded-3xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      borderColor: `${prop.color}30`,
                      boxShadow: `inset 0 0 12px ${prop.color}05`
                    }}
                  />
                </CinematicScrollReveal>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}