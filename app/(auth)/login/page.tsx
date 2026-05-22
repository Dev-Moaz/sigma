// ── app/(auth)/login/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faApple } from "@fortawesome/free-brands-svg-icons";
import { useTheme } from "@/store/useAppStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LoginStep = "idle" | "loading" | "success";

// ==========================================
// 1. NOISE GRAIN OVERLAY (Subtle)
// ==========================================
function NoiseGrain({ opacity = 0.025 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity, mixBlendMode: "overlay" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="vt-noise-grain-clean">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#vt-noise-grain-clean)" />
      </svg>
    </div>
  );
}

// ==========================================
// 2. ACCENT LINE
// ==========================================
function AccentLine() {
  return (
    <motion.div
      className="absolute top-0 left-0 right-0 h-px z-20 pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, transparent, #06b6d4, #3b82f6, #7c3aed, transparent)",
      }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ==========================================
// 3. PASSWORD STRENGTH BAR
// ==========================================
function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const LABELS = ["Weak", "Fair", "Good", "Strong"];
  const color = COLORS[Math.max(0, strength - 1)];

  if (!password) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-3 overflow-hidden"
      >
        <div className="flex gap-1 mb-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(150, 150, 150, 0.15)" }}
            >
              <motion.div
                className="h-full w-full rounded-full"
                style={{
                  originX: 0,
                  background: color,
                  boxShadow: `0 0 8px ${color}80`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: strength > i ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between px-0.5">
          {LABELS.map((label, i) => (
            <span
              key={i}
              className="text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300"
              style={{
                color: strength > i ? color : "rgba(150, 150, 150, 0.4)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ==========================================
// 4. CLEAN SUBMIT BUTTON
// ==========================================
function SubmitButton({ className = "", step, onClick }: { className?: string, step: LoginStep, onClick: () => void }) {
  const { theme } = useTheme();
  const isCompact = step !== "idle";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center font-bold text-white transition-shadow duration-300 ${className}`}
      style={{
        background:
          step === "success"
            ? "linear-gradient(135deg, #22c55e, #16a34a)"
            : theme === "dark"
            ? "linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#7c3aed 100%)"
            : "linear-gradient(135deg,#06b6d4 0%,#2563eb 70%,#7c3aed 100%)",
        height: 52,
        overflow: "hidden",
        boxShadow:
          step === "success"
            ? "0 8px 25px rgba(34,197,94,0.4)"
            : "0 8px 25px rgba(14,165,233,0.3)",
      }}
      initial={{ borderRadius: 14, width: "100%" }}
      animate={{
        width: isCompact ? 52 : "100%",
        borderRadius: isCompact ? 26 : 14,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      whileHover={step === "idle" ? { scale: 1.02 } : {}}
      whileTap={step === "idle" ? { scale: 0.98 } : {}}
    >
      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.span
            key="idle"
            className="flex items-center gap-3 z-10 text-[15px] tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            Sign In
            <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
          </motion.span>
        )}
        {step === "loading" && (
          <motion.div
            key="loading"
            className="z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.2 },
              rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            }}
          >
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M 11 2 A 9 9 0 0 1 20 11" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
        {step === "success" && (
          <motion.div
            key="success"
            className="z-10 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <FontAwesomeIcon icon={faCheck} className="text-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ==========================================
// 5. MAIN LOGIN PAGE
// ==========================================
export default function LoginPage() {
  const { theme, t } = useTheme();
  const router = useRouter();

  // Form state
  const [emailValue, setEmailValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [loginStep, setLoginStep] = useState<LoginStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (loginStep !== "idle") return;
    setErrorMessage("");

    if (!emailValue || !passwordValue) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setLoginStep("loading");
    
    // تسجيل الدخول حياً من الـ Client Side
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue,
    });
    
    if (!error && data.user) {
      // التحقق الدفاعي وإنشاء الملف الشخصي إذا لم يكن موجوداً (للمستخدمين القدامى)
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();
        
        if (!profile) {
          const fullName = data.user.user_metadata?.full_name || emailValue.split("@")[0];
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: fullName,
            email: emailValue,
            volt_points: 100,
          });
        }
      } catch (profileErr) {
        console.error("Defensive profile creation failed:", profileErr);
      }

      setLoginStep("success");
      // توجيه للملف الشخصي بعد نجاح تسجيل الدخول
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } else {
      setLoginStep("idle");
      setErrorMessage(error?.message || "Invalid login credentials.");
    }
  };

  const gradientTextClass = `bg-clip-text text-transparent bg-linear-to-r ${
    theme === "dark"
      ? "from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]"
      : "from-[#0891b2] via-[#2563eb] to-[#7c3aed]"
  }`;

  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: t.bg }}
    >
      <NoiseGrain />
      <AccentLine />

      {/* ── Background Elements (Clean & Static) ── */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${t.gridStroke} 1px, transparent 1px), linear-gradient(90deg, ${t.gridStroke} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          }}
        />
        {/* Soft Center Glow */}
        <div
          className="w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{ background: `radial-gradient(circle, ${t.glowCyan}, transparent)` }}
        />
      </div>

      {/* ── Main Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-[440px] px-5 sm:px-0"
      >
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 backdrop-blur-xl border shadow-2xl transition-colors duration-500"
          style={{
            background: t.cardBg,
            borderColor: t.borderLight,
            boxShadow: `0 20px 40px -10px rgba(0,0,0,0.2), inset 0 1px 0 ${t.borderLight}`,
          }}
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${gradientTextClass}`}>
              Welcome Back
            </h1>
            <p className="text-sm font-medium" style={{ color: t.textSecondary }}>
              Sign in to your Sigma account
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            
            {/* Error Message */}
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs font-bold rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ml-1"
                style={{ color: emailFocused ? t.accentText : t.textSubtle }}
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-4 text-[15px] transition-colors duration-300 z-10"
                  style={{ color: emailFocused ? t.accentText : t.textMuted }}
                />
                <input
                  type="email"
                  placeholder="commander@sigma.com"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="w-full h-14 pl-11 pr-4 rounded-xl text-sm font-medium outline-none transition-all duration-300"
                  style={{
                    color: t.text,
                    background: t.bgSecondary,
                    border: `1px solid ${emailFocused ? t.accentText : t.borderSubtle}`,
                    boxShadow: emailFocused ? `0 0 0 3px ${t.glowCyan}20` : "none",
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end ml-1 mr-1">
                <label
                  className="text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
                  style={{ color: passFocused ? t.accentText : t.textSubtle }}
                >
                  Password
                </label>
                <Link href="#" className="text-[11px] font-bold hover:underline transition-colors" style={{ color: t.accentText }}>
                  Forgot?
                </Link>
              </div>
              <div className="relative flex items-center">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-4 text-[15px] transition-colors duration-300 z-10"
                  style={{ color: passFocused ? t.accentText : t.textMuted }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  className="w-full h-14 pl-11 pr-12 rounded-xl text-sm font-medium outline-none transition-all duration-300"
                  style={{
                    color: t.text,
                    background: t.bgSecondary,
                    border: `1px solid ${passFocused ? t.accentText : t.borderSubtle}`,
                    boxShadow: passFocused ? `0 0 0 3px ${t.glowCyan}20` : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[15px] transition-colors duration-200 hover:scale-110 z-10 focus:outline-none"
                  style={{ color: t.textMuted }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthBar password={passwordValue} />
            </div>

            {/* Submit Action */}
            <div className="mt-4 flex justify-center">
              <SubmitButton step={loginStep} onClick={handleLogin} />
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px w-full" style={{ background: t.borderSubtle }} />
            <span className="text-[10px] font-bold uppercase tracking-widest shrink-0" style={{ color: t.textMuted }}>
              Or Continue With
            </span>
            <div className="h-px w-full" style={{ background: t.borderSubtle }} />
          </div>

          {/* Social Logins */}
          <div className="flex items-center justify-center gap-4">
            {[
              { icon: faGoogle, label: "Google" },
              { icon: faApple, label: "Apple" },
            ].map((social, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Sign in with ${social.label}`}
                className="w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300 hover:-translate-y-1 focus:outline-none"
                style={{
                  background: t.bgSecondary,
                  borderColor: t.borderSubtle,
                  color: t.textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.accentText;
                  e.currentTarget.style.color = t.text;
                  e.currentTarget.style.boxShadow = `0 4px 15px ${t.glowCyan}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.borderSubtle;
                  e.currentTarget.style.color = t.textSecondary;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <FontAwesomeIcon icon={social.icon} className="text-[20px]" />
              </button>
            ))}
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-[13px] font-medium mt-8" style={{ color: t.textSecondary }}>
            Don&apos;t have an account?{" "}
            <Link href="/create_account" className="font-bold ml-1 transition-colors hover:underline" style={{ color: t.accentText }}>
              Create Account
            </Link>
          </p>

        </div>
      </motion.div>
    </section>
  );
}