import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Six geometric icons matching the reference's outlined tech icon aesthetic
const BotIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default function DeFAISentinelHero() {
  return (
    <section className="relative w-full pt-28 pb-16 sm:pb-20 overflow-hidden bg-ink transition-colors duration-500">
      
      {/* ============================================================== */}
      {/* 1. MINT-GREEN STIPPLED / AMBIENT GRADIENT BACKGROUND           */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Left Mint/Lime Ambient Flare with Stippled Grain */}
        <div 
          className="absolute -left-20 top-1/4 w-[48vw] h-[75vh] max-w-[650px] rounded-full opacity-60 dark:opacity-20 blur-[90px]"
          style={{
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.8) 0%, rgba(110, 231, 183, 0.4) 45%, rgba(52, 211, 153, 0) 70%)'
          }}
        />

        {/* Right Mint/Lime Ambient Flare */}
        <div 
          className="absolute -right-20 top-1/3 w-[48vw] h-[75vh] max-w-[650px] rounded-full opacity-60 dark:opacity-20 blur-[90px]"
          style={{
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.75) 0%, rgba(134, 239, 172, 0.35) 45%, rgba(34, 197, 94, 0) 70%)'
          }}
        />

        {/* Subtle center grain/stipple texture overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.22] dark:opacity-[0.12] mix-blend-overlay">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.8  0 0 0 0 0.3  0 0 0 0.15 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>

        {/* Top-down soft vignette to keep navbar clean */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink via-ink/50 to-transparent" />
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN HERO CONTENT CONTAINER (Balanced Vertical Spacing)     */}
      {/* ============================================================== */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Eyebrow Label: "Introducing Autonomous Financial Agent" */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center justify-center px-4 py-1.5 mb-5 sm:mb-6 rounded-full border border-black/15 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-sm"
        >
          <span className="font-sans text-xs sm:text-[13px] font-medium tracking-tight text-zinc-800 dark:text-zinc-200">
            Introducing Autonomous Financial Agent
          </span>
        </motion.div>

        {/* Main Heading: */}
        {/* "SECURE AUTONOMOUS" */}
        {/* "FINANCIAL AGENT" */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-black uppercase tracking-tight leading-[0.92] text-paper mb-4 sm:mb-5"
        >
          <span className="block text-zinc-950 dark:text-white">
            SECURE AUTONOMOUS
          </span>
          <span className="block text-[#84cc16]">
            FINANCIAL AGENT
          </span>
        </motion.h1>

        {/* Description Text */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="max-w-2xl mx-auto text-xs sm:text-sm md:text-[14px] font-sans font-normal leading-relaxed text-zinc-700 dark:text-zinc-300 mb-6 sm:mb-7 px-4"
        >
          We build the secure, autonomous AI agents that handle financial tasks with deterministic policy enforcement.
          Every transaction is evaluated in real-time. Trust is no longer assumed, it is mathematically verified.
        </motion.p>

        {/* CTA Buttons: See more + Chat ↗ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center gap-3 mb-6 sm:mb-8"
        >
          {/* "See more" Button */}
          <Link
            to="/services"
            className="inline-flex items-center justify-center px-6 sm:px-7 h-11 rounded-full text-xs sm:text-sm font-semibold tracking-tight border border-black/15 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-all duration-200 shadow-sm"
          >
            See more
          </Link>

          {/* "Chat ↗" Button */}
          <Link
            to="/chat"
            className="group inline-flex items-center justify-center gap-1.5 px-7 sm:px-8 h-11 rounded-full text-xs sm:text-sm font-bold tracking-tight bg-[#84cc16] text-zinc-950 hover:bg-[#76b813] transition-all duration-200 shadow-md shadow-[#84cc16]/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Chat</span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
          </Link>
        </motion.div>

        {/* ============================================================== */}
        {/* 3. UNIFIED SVG SYSTEM: CONNECTORS + CENTRAL DATABASE STACK     */}
        {/* Both SVG paths and 3D database share the EXACT coordinate grid */}
        {/* ViewBox: 1000 x 440. Center X = 500.                            */}
        {/* Server Stack: X from 432 to 568. Center = 500.                */}
        {/* Tier 1 Y=130..182; Tier 2 Y=182..234; Tier 3 Y=234..286       */}
        {/* Platform Y=280..380                                           */}
        {/* ============================================================== */}
        <div className="relative w-full max-w-5xl mx-auto px-2 select-none">
          
          {/* Desktop & Tablet Diagram Layout */}
          <div className="relative hidden md:block w-full h-[410px] lg:h-[440px]">
            
            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              viewBox="0 0 1000 440"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Traveling Glow Gradient */}
                <linearGradient id="glowPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity="0" />
                  <stop offset="50%" stopColor="#84cc16" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                </linearGradient>

                {/* Soft glow filter */}
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Platform Shading Gradients */}
                <linearGradient id="platTopGrad" x1="370" y1="300" x2="630" y2="350" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#A7F3D0" />
                  <stop offset="50%" stopColor="#6EE7B7" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>

                <linearGradient id="platLeftGrad" x1="370" y1="315" x2="500" y2="375" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#86EFAC" />
                  <stop offset="100%" stopColor="#4ADE80" />
                </linearGradient>

                <linearGradient id="platRightGrad" x1="500" y1="315" x2="630" y2="375" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>

                {/* Server Shading Gradients */}
                <linearGradient id="srvLidGrad" x1="432" y1="110" x2="568" y2="155" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F8FAFC" />
                  <stop offset="50%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>

                <linearGradient id="srvLeftGrad" x1="432" y1="130" x2="500" y2="280" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#CBD5E1" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>

                <linearGradient id="srvRightGrad" x1="500" y1="130" x2="568" y2="280" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>
              </defs>

              {/* ----------------- BASE STATIC CONNECTOR PATHS ----------------- */}
              {/* Left Top: AI Agent Integration (X: 275, Y: 75) -> Server Tier 1 (X: 432, Y: 155) */}
              <path
                d="M 275 75 L 380 75 L 380 155 L 432 155"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Left Mid: Policy Engine (X: 275, Y: 208) -> Server Tier 2 (X: 432, Y: 208) */}
              <path
                d="M 275 208 L 432 208"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Left Bot: Spend Control (X: 275, Y: 345) -> Server Tier 3 (X: 432, Y: 260) */}
              <path
                d="M 275 345 L 380 345 L 380 260 L 432 260"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Right Top: Approval Workflow (X: 725, Y: 75) -> Server Tier 1 (X: 568, Y: 155) */}
              <path
                d="M 725 75 L 620 75 L 620 155 L 568 155"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Right Mid: Audit Trail (X: 725, Y: 208) -> Server Tier 2 (X: 568, Y: 208) */}
              <path
                d="M 725 208 L 568 208"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Right Bot: Transaction Monitoring (X: 725, Y: 345) -> Server Tier 3 (X: 568, Y: 260) */}
              <path
                d="M 725 345 L 620 345 L 620 260 L 568 260"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* ----------------- ANIMATED TRAVELING GLOW PULSES ----------------- */}
              <path
                d="M 275 75 L 380 75 L 380 155 L 432 155"
                stroke="url(#glowPulseGrad)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-1"
                filter="url(#softGlow)"
              />

              <path
                d="M 275 208 L 432 208"
                stroke="url(#glowPulseGrad)"
                strokeWidth="2.5"
                strokeDasharray="30 200"
                className="connector-pulse pulse-delay-2"
                filter="url(#softGlow)"
              />

              <path
                d="M 275 345 L 380 345 L 380 260 L 432 260"
                stroke="url(#glowPulseGrad)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-3"
                filter="url(#softGlow)"
              />

              <path
                d="M 725 75 L 620 75 L 620 155 L 568 155"
                stroke="url(#glowPulseGrad)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-4"
                filter="url(#softGlow)"
              />

              <path
                d="M 725 208 L 568 208"
                stroke="url(#glowPulseGrad)"
                strokeWidth="2.5"
                strokeDasharray="30 200"
                className="connector-pulse pulse-delay-5"
                filter="url(#softGlow)"
              />

              <path
                d="M 725 345 L 620 345 L 620 260 L 568 260"
                stroke="url(#glowPulseGrad)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-6"
                filter="url(#softGlow)"
              />

              {/* ======================================================== */}
              {/* CENTRAL ISOMETRIC DATABASE STACK & MINT PLATFORM         */}
              {/* Mathematically locked at X=500. Direct vector rendering. */}
              {/* ======================================================== */}
              
              {/* Platform Ambient Drop Shadow */}
              <ellipse cx="500" cy="372" rx="145" ry="24" fill="rgba(34, 197, 94, 0.28)" filter="blur(16px)" />
              <ellipse cx="500" cy="376" rx="115" ry="16" fill="rgba(10, 20, 10, 0.22)" filter="blur(10px)" />

              {/* Mint Geometric Platform Base */}
              {/* Left Face */}
              <path
                d="M 370 336 L 500 378 L 500 398 L 370 356 Z"
                fill="url(#platLeftGrad)"
              />
              {/* Right Face */}
              <path
                d="M 500 378 L 630 336 L 630 356 L 500 398 Z"
                fill="url(#platRightGrad)"
              />
              {/* Center Bevel Line */}
              <line x1="500" y1="378" x2="500" y2="398" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              {/* Top Diamond Surface */}
              <path
                d="M 500 294 L 630 336 L 500 378 L 370 336 Z"
                fill="url(#platTopGrad)"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
              />
              {/* Inner Rim Accent */}
              <path
                d="M 500 297 L 624 336 L 500 374 L 376 336 Z"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.8"
              />
              {/* Shadow Cast by Server on Platform */}
              <path
                d="M 500 320 L 570 342 L 500 364 L 430 342 Z"
                fill="rgba(21, 128, 61, 0.45)"
                filter="blur(4px)"
              />

              {/* ----------------- TIER 3 (BOTTOM SERVER LAYER) ----------------- */}
              {/* Left Face */}
              <path
                d="M 432 234 L 500 256 L 500 286 L 432 264 Z"
                fill="url(#srvLeftGrad)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.5"
              />
              {/* Right Face */}
              <path
                d="M 500 256 L 568 234 L 568 264 L 500 286 Z"
                fill="url(#srvRightGrad)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
              />
              {/* Tier 3 Details: LED + Slot Lines */}
              <circle cx="516" cy="270" r="3" fill="#E2E8F0" />
              <circle cx="516" cy="270" r="1.5" fill="#38BDF8" />
              <line x1="528" y1="264" x2="552" y2="256" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="528" y1="271" x2="546" y2="265" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
              {/* Seam Separators */}
              <path d="M 432 234 L 500 256 L 568 234" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.75" />
              <path d="M 432 235 L 500 257 L 568 235" fill="none" stroke="#475569" strokeWidth="0.8" opacity="0.5" />

              {/* ----------------- TIER 2 (MIDDLE SERVER LAYER) ----------------- */}
              {/* Left Face */}
              <path
                d="M 432 182 L 500 204 L 500 234 L 432 212 Z"
                fill="url(#srvLeftGrad)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.5"
              />
              {/* Right Face */}
              <path
                d="M 500 204 L 568 182 L 568 212 L 500 234 Z"
                fill="url(#srvRightGrad)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
              />
              {/* Tier 2 Details: LED + Slot Lines */}
              <circle cx="516" cy="218" r="3" fill="#E2E8F0" />
              <circle cx="516" cy="218" r="1.5" fill="#4ADE80" />
              <line x1="528" y1="212" x2="552" y2="204" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="528" y1="219" x2="546" y2="213" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
              {/* Seam Separators */}
              <path d="M 432 182 L 500 204 L 568 182" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.75" />
              <path d="M 432 183 L 500 205 L 568 183" fill="none" stroke="#475569" strokeWidth="0.8" opacity="0.5" />

              {/* ----------------- TIER 1 (TOP SERVER LAYER) ----------------- */}
              {/* Left Face */}
              <path
                d="M 432 130 L 500 152 L 500 182 L 432 160 Z"
                fill="url(#srvLeftGrad)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.5"
              />
              {/* Right Face */}
              <path
                d="M 500 152 L 568 130 L 568 160 L 500 182 Z"
                fill="url(#srvRightGrad)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
              />
              {/* Tier 1 Details: LED + Slot Lines */}
              <circle cx="516" cy="166" r="3" fill="#E2E8F0" />
              <circle cx="516" cy="166" r="1.5" fill="#A855F7" />
              <line x1="528" y1="160" x2="552" y2="152" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="528" y1="167" x2="546" y2="161" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

              {/* ----------------- SERVER TOP ROOF CAP ----------------- */}
              <path
                d="M 496 109 C 498 108, 502 108, 504 109 L 566 129 C 568 130, 568 132, 566 133 L 504 153 C 502 154, 498 154, 496 153 L 434 133 C 432 132, 432 130, 434 129 Z"
                fill="url(#srvLidGrad)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.2"
              />
              {/* Center Spine Highlight */}
              <line x1="500" y1="152" x2="500" y2="286" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

              {/* Connector Landing Nodes (Touching Connector Endpoints Perfectly) */}
              <circle cx="432" cy="155" r="3" fill="#84cc16" />
              <circle cx="432" cy="208" r="3" fill="#84cc16" />
              <circle cx="432" cy="260" r="3" fill="#84cc16" />
              <circle cx="568" cy="155" r="3" fill="#84cc16" />
              <circle cx="568" cy="208" r="3" fill="#84cc16" />
              <circle cx="568" cy="260" r="3" fill="#84cc16" />
            </svg>

            {/* ----------------- 6 FEATURE LABELS (Accurate Centered Anchors) ----------------- */}
            
            {/* Left 1: AI Agent Integration (Y: 75px) */}
            <div className="absolute right-[72.5%] top-[75px] -translate-y-1/2 z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <BotIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  AI Agent Integration
                </span>
              </div>
            </div>

            {/* Left 2: Policy Engine (Y: 208px) */}
            <div className="absolute right-[72.5%] top-[208px] -translate-y-1/2 z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <ShieldIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Policy Engine
                </span>
              </div>
            </div>

            {/* Left 3: Spend Control (Y: 345px) */}
            <div className="absolute right-[72.5%] top-[345px] -translate-y-1/2 z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <WalletIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Spend Control
                </span>
              </div>
            </div>

            {/* Right 1: Approval Workflow (Y: 75px) */}
            <div className="absolute left-[72.5%] top-[75px] -translate-y-1/2 z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <CheckCircleIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Approval Workflow
                </span>
              </div>
            </div>

            {/* Right 2: Audit Trail (Y: 208px) */}
            <div className="absolute left-[72.5%] top-[208px] -translate-y-1/2 z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <FileTextIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Audit Trail
                </span>
              </div>
            </div>

            {/* Right 3: Transaction Monitoring (Y: 345px) */}
            <div className="absolute left-[72.5%] top-[345px] -translate-y-1/2 z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <ActivityIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Transaction Monitoring
                </span>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* MOBILE RESPONSIVE LAYOUT (Stacked neatly on small viewports)   */}
          {/* ============================================================== */}
          <div className="block md:hidden w-full flex flex-col items-center gap-6 mt-4">
            {/* Top 3 mobile tags */}
            <div className="flex flex-wrap justify-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                <BotIcon />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI Agent Integration</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                <ShieldIcon />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Policy Engine</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                <CheckCircleIcon />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Approval Workflow</span>
              </div>
            </div>

            {/* Mobile Central Database Vector */}
            <div className="w-[280px] aspect-[400/360] my-1">
              <svg viewBox="350 100 300 310" className="w-full h-full overflow-visible" fill="none">
                <ellipse cx="500" cy="372" rx="140" ry="22" fill="rgba(34, 197, 94, 0.28)" filter="blur(16px)" />
                <path d="M 370 336 L 500 378 L 500 398 L 370 356 Z" fill="url(#platLeftGrad)" />
                <path d="M 500 378 L 630 336 L 630 356 L 500 398 Z" fill="url(#platRightGrad)" />
                <path d="M 500 294 L 630 336 L 500 378 L 370 336 Z" fill="url(#platTopGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                
                {/* Tiers */}
                <path d="M 432 234 L 500 256 L 500 286 L 432 264 Z" fill="url(#srvLeftGrad)" />
                <path d="M 500 256 L 568 234 L 568 264 L 500 286 Z" fill="url(#srvRightGrad)" />
                <path d="M 432 182 L 500 204 L 500 234 L 432 212 Z" fill="url(#srvLeftGrad)" />
                <path d="M 500 204 L 568 182 L 568 212 L 500 234 Z" fill="url(#srvRightGrad)" />
                <path d="M 432 130 L 500 152 L 500 182 L 432 160 Z" fill="url(#srvLeftGrad)" />
                <path d="M 500 152 L 568 130 L 568 160 L 500 182 Z" fill="url(#srvRightGrad)" />
                <path d="M 496 109 C 498 108, 502 108, 504 109 L 566 129 C 568 130, 568 132, 566 133 L 504 153 C 502 154, 498 154, 496 153 L 434 133 C 432 132, 432 130, 434 129 Z" fill="url(#srvLidGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
              </svg>
            </div>

            {/* Bottom 3 mobile tags */}
            <div className="flex flex-wrap justify-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                <WalletIcon />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Spend Control</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                <FileTextIcon />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Audit Trail</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                <ActivityIcon />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Transaction Monitoring</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
