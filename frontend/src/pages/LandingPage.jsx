import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Receipt, 
  QrCode, 
  Calculator, 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp, 
  LogIn, 
  UserPlus, 
  PieChart,
  Heart,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { AppLogo } from '../components/PaymentLogos';

export function LandingPage({
  onEnterApp,
  onOpenAuth,
  currentUser,
  isLoggedIn = false,
  allUsers = []
}) {
  const heroRef = useRef(null);
  const cardTiltRef = useRef(null);
  const badge1Ref = useRef(null);
  const badge2Ref = useRef(null);

  // Interactive Live Split Simulator state
  const [simAmount, setSimAmount] = useState(2400);
  const [simMembersCount, setSimMembersCount] = useState(4);
  const [simCategory, setSimCategory] = useState('Dinner & Drinks');

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // High performance tilt tracker using direct style mutations (0 React re-renders)
  useEffect(() => {
    let animationFrameId = null;

    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const rect = heroRef.current?.getBoundingClientRect();
        if (!rect) return;
        const rawX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const rawY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        const x = Math.max(-1, Math.min(1, rawX));
        const y = Math.max(-1, Math.min(1, rawY));

        if (cardTiltRef.current) {
          cardTiltRef.current.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
        }
        if (badge1Ref.current) {
          badge1Ref.current.style.transform = `translate(${x * -14}px, ${y * -14}px)`;
        }
        if (badge2Ref.current) {
          badge2Ref.current.style.transform = `translate(${x * 16}px, ${y * 16}px)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);


  const perPersonShare = Math.round(simAmount / Math.max(1, simMembersCount));

  const faqs = [
    {
      q: "Is EquiShare linked to my real bank account?",
      a: "No, EquiShare does NOT link to your bank accounts. It is a secure group expense calculator and ledger. When settling, it generates secure UPI deep links (PhonePe, Google Pay, Paytm, BHIM, CRED) where you approve payments safely inside your trusted UPI apps."
    },
    {
      q: "How does the Debt Simplification algorithm work?",
      a: "Instead of having 4 roommates make 6 separate cross-payments back and forth, EquiShare's greedy graph minimization algorithm calculates each person's net balance and resolves all debts in the absolute minimum number of direct transactions (reducing transfers by up to 75%)."
    },
    {
      q: "Is EquiShare completely free?",
      a: "Yes, 100% Free Forever. There are no subscriptions, no locked features, no transaction fees, and zero banner ads."
    },
    {
      q: "How does the AI OCR Receipt Scanner work?",
      a: "You can drag and drop any restaurant receipt, grocery bill, or invoice image. EquiShare automatically parses line items, calculates taxes, and distributes costs to your roommates in seconds."
    },
    {
      q: "Can I use EquiShare for trips and roommates at the same time?",
      a: "Absolutely! You can create unlimited groups — such as 'Flat 402 Roommates', 'Goa Roadtrip 2026', 'Office Lunch Club', or 'Weekend Trek' — each with their own isolated ledger, members, and custom currencies."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-x-hidden font-sans">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-[140px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div 
          className="absolute top-[35%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse"
          style={{ animationDuration: '11s' }}
        />
        <div 
          className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[160px]"
        />
        {/* Subtle Geometric Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* 1. TOP STICKY GLASS NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070A12]/80 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="transition-transform duration-300 group-hover:scale-105">
              <AppLogo size={42} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-outfit">
                  EquiShare
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block font-medium">
                Smart Group & Roommate Settlement
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
            <a href="#simulator" className="hover:text-emerald-400 transition-colors">Live Split Demo</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons: Context-Aware (Guest vs Authenticated) */}
          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onOpenAuth('profile')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200"
                >
                  <img src={currentUser?.avatar} alt={currentUser?.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{currentUser?.name?.split(' ')[0]}</span>
                </button>
                <button
                  onClick={onEnterApp}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-1.5 group"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started Free</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH 3D PARALLAX TILT */}
      <section ref={heroRef} className="relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-7">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>100% Free · Real-Time UPI Settlement · Zero Ads</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-outfit leading-[1.12]">
              Split bills without <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                awkward math.
              </span> <br />
              Settle in 1-Click UPI.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
              EquiShare simplifies roommate and group expenses, minimizes messy debt webs by up to <strong>75%</strong>, and generates instant UPI links for PhonePe, Google Pay, Paytm, and BHIM.
            </p>

            {/* Quick Feature Checklist */}
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Greedy Debt Graph Minimizer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI OCR Receipt Scanner</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant PhonePe & GPay Deep-links</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Roommate Grocery Restock Hub</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {isLoggedIn ? (
                <button
                  onClick={onEnterApp}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm backdrop-blur-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span>Sign In</span>
                  </button>
                </>
              )}

              <a
                href="#simulator"
                className="px-5 py-3.5 rounded-2xl text-slate-400 hover:text-emerald-400 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Calculator className="w-4 h-4" />
                <span>Try Live Split Demo</span>
              </a>
            </div>

            {/* Active User Social Proof Pill */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 border-t border-white/10">
              <div className="flex -space-x-2">
                {allUsers.slice(0, 4).map((u, i) => (
                  <img
                    key={u.id || i}
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-[#070A12]"
                  />
                ))}
              </div>
              <span>
                Joined by <strong className="text-white">roommates & flatmates</strong> across Bengaluru, Mumbai, Delhi, & Pune.
              </span>
            </div>
          </div>

          {/* Right Column: 3D Parallax Tilt Interactive Dashboard Preview */}
          <div className="lg:col-span-6 relative perspective-[1200px]">
            {/* 3D Container with dynamic tilt based on mouse coordinates */}
            <div
              ref={cardTiltRef}
              className="relative transition-transform duration-200 ease-out"
            >
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/30 blur-xl opacity-75 animate-pulse" />

              {/* Main Simulated Mockup Card */}
              <div className="relative rounded-3xl bg-[#0E1528]/90 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl space-y-5 overflow-hidden">
                {/* Window Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-bold text-slate-300 font-mono">
                      EquiShare — Flat 402 Settlement
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Preview
                  </span>
                </div>

                {/* Simulated Net Balance Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">Your Net Balance</span>
                    <h3 className="text-2xl font-extrabold text-emerald-400 font-outfit">
                      +₹1,450.00
                    </h3>
                    <span className="text-[11px] text-emerald-300/80">
                      Roommates owe you for Wi-Fi & Groceries
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <span>Sign Up Free</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Simulated Simplified Debt Stream */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Smart Debt Simplification</span>
                    <span className="text-emerald-400 text-[11px]">Reduced 6 debts → 2 transfers</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center font-bold text-rose-300">
                        R
                      </div>
                      <div>
                        <span className="font-bold text-white block">Rohan owes you</span>
                        <span className="text-[10px] text-slate-400">For Grocery Restock</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">₹850</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300">
                        P
                      </div>
                      <div>
                        <span className="font-bold text-white block">Priya owes you</span>
                        <span className="text-[10px] text-slate-400">For ACT Broadband Bill</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">₹600</span>
                  </div>
                </div>

                {/* Interactive Footer */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>100% Free · No Bank Linking Required</span>
                  </span>
                  <button 
                    onClick={() => onOpenAuth('signup')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
                  >
                    Get Started &rarr;
                  </button>
                </div>
              </div>

              {/* Floating Parallax Badge 1: Instant UPI */}
              <div 
                ref={badge1Ref}
                className="absolute -top-6 -left-6 p-3 rounded-2xl bg-[#131B30]/95 border border-emerald-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-bounce"
                style={{ animationDuration: '4s' }}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">UPI Instant Pay</span>
                  <span className="text-xs font-bold text-white font-mono">GPay · PhonePe · Paytm</span>
                </div>
              </div>

              {/* Floating Parallax Badge 2: AI OCR Scan */}
              <div 
                ref={badge2Ref}
                className="absolute -bottom-6 -right-6 p-3 rounded-2xl bg-[#131B30]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">AI Receipt Scanner</span>
                  <span className="text-xs font-bold text-white">Auto Line-Item Extraction</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* 3. "ABOUT EQUISHARE" & STORYTELLING SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            The EquiShare Story & Vision
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
            Why Roommates Love EquiShare
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Living with flatmates or traveling with friends should be about creating memories — not stressing over who paid for groceries, who forgot the Wi-Fi bill, or chasing people for IOUs on WhatsApp.
          </p>
        </div>

        {/* Before vs. After Comparison Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* The Old Awkward Way */}
          <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/20 space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                ✕
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">The Old Awkward Way</h3>
                <span className="text-xs text-rose-300">Spreadsheets, WhatsApp fights & confusion</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>Writing endless notes on WhatsApp groups that get lost after 2 days.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>Roommate A pays Roommate B, while Roommate B pays Roommate C in a chaotic loop of 12 separate transactions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>Awkward follow-ups: <em>"Hey, did you send that ₹350 for the pizza last Friday?"</em></span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>Calculating tax and split shares by hand on a phone calculator.</span>
              </li>
            </ul>
          </div>

          {/* The EquiShare Way */}
          <div className="p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-5 relative overflow-hidden shadow-xl shadow-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">The EquiShare Solution</h3>
                <span className="text-xs text-emerald-300">Transparent, Automated & 1-Click Settled</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Greedy Debt Minimizer</strong> cuts total transactions down to the bare minimum.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>1-Click Deep UPI</strong>: Tap "Settle" and immediately launch PhonePe or GPay with the exact amount and UPI ID prefilled.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>AI Receipt Scanner</strong> automatically extracts items from bill photos.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Shared Pantry & Grocery Hub</strong> ensures milk, detergent, and oil are never forgotten.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. LIVE INTERACTIVE SPLIT SIMULATOR ("TEST DRIVE") */}
      <section id="simulator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Interactive Test Drive
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
            Simulate a Group Split Right Now
          </h2>
          <p className="text-slate-400 text-sm">
            Adjust the bill amount and roommates to see real-time split calculation and instant settlement.
          </p>
        </div>

        {/* Interactive Simulator Box */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-[#0E1528] border border-white/15 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6 text-xs">
              {/* Bill Amount Slider & Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-300 font-bold text-sm">Total Bill Amount</label>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    ₹{simAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="25000"
                  step="100"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-white/10 accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>₹200 (Lunch)</span>
                  <span>₹10,000 (Goa Villa)</span>
                  <span>₹25,000 (Monthly Rent)</span>
                </div>
              </div>

              {/* Roommates / People Count */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">Number of People in Group</label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSimMembersCount(count)}
                      className={`py-2.5 rounded-xl font-bold transition-all ${
                        simMembersCount === count
                          ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {count} Friends
                    </button>
                  ))}
                </div>
              </div>

              {/* Expense Category Tag */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">Expense Category</label>
                <div className="flex flex-wrap gap-2">
                  {['Dinner & Drinks', 'Apartment Rent', 'Electricity & Wi-Fi', 'Groceries', 'Goa Roadtrip'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSimCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        simCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 text-center space-y-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Calculated Fair Share
              </span>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-3xl font-extrabold text-emerald-400 font-outfit block">
                  ₹{perPersonShare.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">per person (equal split across {simMembersCount})</span>
              </div>

              <div className="text-left text-xs space-y-2 border-t border-white/10 pt-3">
                <div className="flex justify-between text-slate-300">
                  <span>Payer (You):</span>
                  <span className="font-bold text-white">Paid ₹{simAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>You will receive:</span>
                  <span>+₹{(simAmount - perPersonShare).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {isLoggedIn ? (
                <button
                  onClick={onEnterApp}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Split This in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up & Split with Flatmates</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. SUPERPOWERS BENTO GRID */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Engineered for Roommates & Groups
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
            Everything You Need to Live in Harmony
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Power packed with algorithms and modern Indian fintech rails.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Debt Graph Simplifier */}
          <div className="p-7 rounded-3xl bg-[#0E1528]/80 border border-white/10 hover:border-emerald-500/40 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-outfit">Greedy Debt Simplifier</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminate tangled webs of cross-debts. Our algorithm calculates net balance vectors and solves the minimal transfer graph instantly.
            </p>
          </div>

          {/* Card 2: UPI 1-Click Pay */}
          <div className="p-7 rounded-3xl bg-[#0E1528]/80 border border-white/10 hover:border-cyan-500/40 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-outfit">Instant UPI Deep Linking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay debts in 1 click directly via PhonePe, Google Pay, Paytm, BHIM, or CRED with pre-filled VPA, amount, and reference notes.
            </p>
          </div>

          {/* Card 3: AI OCR Scanner */}
          <div className="p-7 rounded-3xl bg-[#0E1528]/80 border border-white/10 hover:border-indigo-500/40 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-outfit">AI OCR Bill Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Snap a picture of grocery or dinner receipts. EquiShare extracts items, tax, and subtotals, allowing quick one-tap splits.
            </p>
          </div>

          {/* Card 4: Shared Pantry */}
          <div className="p-7 rounded-3xl bg-[#0E1528]/80 border border-white/10 hover:border-amber-500/40 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-outfit">Shared Pantry & Groceries</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep a collaborative inventory of apartment essentials like cooking oil, milk, and detergent. Convert bought supplies directly into group expenses.
            </p>
          </div>

          {/* Card 5: Analytics Studio */}
          <div className="p-7 rounded-3xl bg-[#0E1528]/80 border border-white/10 hover:border-emerald-500/40 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-outfit">Spending Insights Matrix</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand monthly household expenses with interactive spending charts, top spenders, category distributions, and exportable ledgers.
            </p>
          </div>

          {/* Card 6: 1-Click Multi-Account Switcher */}
          <div className="p-7 rounded-3xl bg-[#0E1528]/80 border border-white/10 hover:border-teal-500/40 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-outfit">1-Click Roommate Testing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Easily view and verify the balance sheet from any roommate's perspective in 1 click using the built-in switchable demo accounts.
            </p>
          </div>
        </div>
      </section>

      {/* 6. STEP-BY-STEP "HOW IT WORKS" */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
            How EquiShare Works
          </h2>
          <p className="text-slate-400 text-sm">
            Get your household or trip squared away in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Create a Group', desc: 'Add flatmates or friends to Flat 402, Goa Trip, or Office Lunch.' },
            { step: '02', title: 'Add or Scan Bills', desc: 'Log expenses manually or let the OCR scanner auto-extract line items.' },
            { step: '03', title: 'See Net Balances', desc: 'Debts are simplified into clean, consolidated net amounts.' },
            { step: '04', title: '1-Click Settle', desc: 'Tap Settle to open PhonePe or GPay and clear debts instantly.' },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#0E1528] border border-white/10 relative space-y-3">
              <span className="text-3xl font-extrabold text-emerald-400/40 font-mono block">
                {item.step}
              </span>
              <h4 className="text-base font-bold text-white font-outfit">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10 border-t border-white/10">
        <div className="text-center mb-14 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-white font-outfit">
            Got Questions? We’ve Got Answers
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-[#0E1528] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BOTTOM HERO CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Ready for peaceful roommate living?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-outfit max-w-2xl mx-auto leading-tight">
            Start Splitting with EquiShare Today
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            {isLoggedIn
              ? `You are signed in as ${currentUser?.name}. Continue to your live dashboard to manage expenses.`
              : 'Create a free account in 10 seconds or sign in to experience friction-free expense settlements.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isLoggedIn ? (
              <button
                onClick={onEnterApp}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Sign In</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AppLogo size={28} />
          <span className="font-bold text-white font-outfit">EquiShare</span>
          <span>© 2026 — Smart Group Expense Settlement</span>
        </div>

        <div className="flex items-center gap-5 font-semibold">
          {isLoggedIn ? (
            <>
              <button onClick={onEnterApp} className="text-emerald-400 hover:underline flex items-center gap-1">
                <span>Dashboard</span>
              </button>
              <button onClick={() => onOpenAuth('profile')} className="hover:text-emerald-400 transition-colors">
                Profile
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onOpenAuth('signin')} className="hover:text-emerald-400 transition-colors">Sign In</button>
              <button onClick={() => onOpenAuth('signup')} className="hover:text-emerald-400 transition-colors">Sign Up Free</button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
