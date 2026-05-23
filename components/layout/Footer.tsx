// components/layout/Footer.tsx
"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faHeart,
  faShieldHalved,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import {
  faXTwitter,
  faInstagram,
  faYoutube,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import { useTheme } from "@/store/useAppStore";
import { Logo } from "@/components/ui/Logo";
import { AccentLine } from "@/components/ui/AccentLine";
import { Particles } from "@/components/ui/Particles";

/* ─── Data ──────────────────────────────────────────── */
const LINKS = [
  {
    heading: "Shop",
    items: [
      { label: "Laptops", href: "#" },
      { label: "Gaming PCs", href: "#" },
      { label: "Brands", href: "#" },
      { label: "Accessories", href: "#" },
    ],
  },
  {
    heading: "Support",
    items: [
      { label: "Help Center", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Warranty", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: faXTwitter, href: "#", label: "X / Twitter" },
  { icon: faInstagram, href: "#", label: "Instagram" },
  { icon: faYoutube, href: "#", label: "YouTube" },
  { icon: faDiscord, href: "#", label: "Discord" },
];

const PROMISES = [
  { icon: faTruck, text: "Free shipping over $999" },
  { icon: faShieldHalved, text: "2-year warranty on all items" },
];

const LEGAL = ["Privacy Policy", "Terms of Service", "Cookie Settings"];

/* ── Simplified Social Link ── */
function SocialLink({ icon, href, ariaLabel }: { icon: any, href: string, ariaLabel: string }) {
  const { t } = useTheme();

  return (
    <motion.a
      href={href}
      aria-label={ariaLabel}
      style={{ background: t.cardBg, borderColor: t.borderAccent, color: t.textSecondary }}
      whileHover={{ scale: 1.1, color: t.accentText, borderColor: t.accentText }}
      className="relative w-11 h-11 rounded-xl flex items-center justify-center border transition-colors duration-300 z-10"
    >
      <FontAwesomeIcon icon={icon} aria-hidden="true" className="text-sm relative z-10" />
    </motion.a>
  );
}

/* ── Static Grid Background ────────── */
function FooterGridBg() {
  const { t } = useTheme();
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <svg aria-hidden="true" className="absolute inset-0 w-[110%] h-[110%] left-[5%] top-[5%] opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-footer" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={t.gridStroke} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-footer)" />
      </svg>
      
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, ${t.radialMask} 75%)` }} />
    </div>
  );
}

/* ── Main Footer ── */
export default function Footer() {
  const { theme, t } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer 
      aria-label="Site footer" 
      className="bf relative overflow-hidden transition-colors duration-500" 
      style={{ 
        backgroundColor: isDark ? "rgba(3, 7, 18, 1)" : "#ffffff",
        borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)"
      }}
    >
      
      {isDark && (
        <>
          {/* Subtle Cyan Tint */}
          <div 
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-10 opacity-[0.08]" 
            style={{ 
              background: `radial-gradient(circle at 50% 50%, ${t.glowCyan} 0%, transparent 80%)`,
              mixBlendMode: "screen"
            }} 
          />

          {/* Vignette Overlay matching Hero Section */}
          <div 
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-40" 
            style={{ 
              background: `radial-gradient(circle at center, transparent 30%, #000000e6 110%)`, 
              mixBlendMode: "normal"
            }} 
          />
        </>
      )}

      <div aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <FooterGridBg />
        <Particles count={isDark ? 20 : 10} />
      </div>

      <AccentLine duration={5} opacity={0.6} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] gap-10 lg:gap-8 pb-10 border-b" style={{ borderBottomColor: t.borderLight }}>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }} 
            className="flex flex-col gap-5 md:col-span-2 lg:col-span-1"
          >
            {/* تم تحديث رابط اللوجو لإضافة نص Recovery trade باللون الأحمر */}
            <a href="/" className="hf inline-flex items-center gap-3 w-fit group" aria-label="Home">
              <Logo variant="fixed" />
              <span 
                className="text-lg font-black tracking-wider uppercase transition-all duration-300 group-hover:opacity-85 select-none"
                style={{ color: "#ef4444" }}
              >
                Recovery trade
              </span>
            </a>
            <p className="text-[14px] leading-relaxed max-w-md font-medium" style={{ color: t.textSecondary }}>
              Premium laptops & PC components for creators, gamers, and visionaries. Authorized reseller of 20+ leading brands.
            </p>
            
            <div className="flex flex-col gap-3 mt-1">
              {PROMISES.map((p) => (
                <div key={p.text} className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: t.textSecondary }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg" style={{ background: t.accentBadge, border: `1px solid ${t.accentBadgeBorder}` }}>
                    <FontAwesomeIcon icon={p.icon} aria-hidden="true" className="text-[11px]" style={{ color: t.accentText }} />
                  </div>
                  {p.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3">
              {SOCIALS.map((s) => (
                <SocialLink key={s.label} icon={s.icon} href={s.href} ariaLabel={s.label} />
              ))}
            </div>
          </motion.div>

          {LINKS.map((col) => (
            <motion.nav 
              key={col.heading} 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8 }} 
              className="flex flex-col gap-4" 
              aria-label={`Footer ${col.heading} Links`}
            >
              <div className="flex items-center gap-3">
                <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "linear-gradient(180deg,#06b6d4,#3b82f6)" }} />
                <h3 className="hf text-[14px] font-extrabold uppercase tracking-[0.2em]" style={{ color: t.text }}>{col.heading}</h3>
              </div>
              <ul className="flex flex-col gap-2">
                {col.items.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="group relative inline-flex items-center gap-2 py-1.5 text-[14px] font-semibold transition-colors duration-300"
                      style={{ color: t.textSecondary }}
                      whileHover={{ x: 5, color: t.accentText }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="text-[10px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          transition={{ duration: 1 }} 
          className="flex flex-col lg:flex-row items-center justify-between gap-5 pt-6 text-center lg:text-left"
        >
          <p className="text-[12px] font-bold tracking-wide uppercase order-3 lg:order-1" style={{ color: t.textSubtle }}>
            © {new Date().getFullYear()} Sigma. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3 flex-wrap justify-center order-1 lg:order-2">
            {LEGAL.map((item, i) => (
              <span key={item} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full shrink-0 opacity-50" style={{ background: t.borderSubtle }} />}
                <motion.a 
                  href="#" 
                  className="text-[12px] font-bold px-2 py-1 rounded-lg transition-colors" 
                  style={{ color: t.textSubtle }}
                  whileHover={{ color: t.text }}
                >
                  {item}
                </motion.a>
              </span>
            ))}
          </div>
          
          <p className="text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 order-2 lg:order-3" style={{ color: t.textSubtle }}>
            Crafted with
            <motion.span 
              aria-hidden="true"
              className="inline-flex"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <FontAwesomeIcon icon={faHeart} aria-hidden="true" className="text-red-500 text-[12px]" />
            </motion.span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}