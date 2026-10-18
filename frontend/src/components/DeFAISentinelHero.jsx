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
    <section className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 overflow-hidden bg-ink transition-colors duration-500">
      
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
      {/* 2. TWO-COLUMN HERO COMPOSITION                                 */}
      {/* Left: ~48% Hero Content | Right: ~52% Complete Illustration     */}
      {/* ============================================================== */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.15fr] xl:grid-cols-[1fr_1.1fr] gap-10 lg:gap-8 xl:gap-12 items-center">
          
          {/* ----------------- LEFT COLUMN: HERO CONTENT ----------------- */}
          <div className="flex flex-col items-start text-left w-full">
            
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

            {/* Main Heading: Left-aligned Bricolage Grotesque bold display */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              style={{ 
                fontFamily: "'Bricolage Grotesque', sans-serif",
                letterSpacing: "-2px",
                lineHeight: "1.02"
              }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[44px] xl:text-[54px] 2xl:text-[62px] font-bold text-paper mb-5 sm:mb-6 text-left"
            >
              <span className="block text-zinc-950 dark:text-white">
                Secure autonomous
              </span>
              <span className="block text-[#84cc16]">
                financial agent
              </span>
            </motion.h1>

            {/* Description Text: Left-aligned comfortable max-width */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="text-xs sm:text-sm md:text-base lg:text-[15.5px] font-sans font-normal leading-relaxed text-zinc-700 dark:text-zinc-300 max-w-xl mb-7 sm:mb-8 text-left"
            >
              We build the secure, autonomous AI agents that handle financial tasks with deterministic policy enforcement.
              Every transaction is evaluated in real-time. Trust is no longer assumed, it is mathematically verified.
            </motion.p>

            {/* CTA Buttons: Left-aligned See more + Chat ↗ */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex items-center gap-3 sm:gap-4 justify-start"
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
          </div>

          {/* ----------------- RIGHT COLUMN: COMPLETE DATABASE ILLUSTRATION ----------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="w-full flex items-center justify-center select-none"
          >
            <div className="relative w-full max-w-[680px] lg:max-w-none">
              
              {/* Desktop & Tablet Diagram Layout (ViewBox: 1000 x 440) */}
              <div className="relative hidden md:block w-full aspect-[1000/440]">
                
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
                    <linearGradient id="platTopGrad" x1="370" y1="315" x2="630" y2="365" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#A7F3D0" />
                      <stop offset="50%" stopColor="#6EE7B7" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>

                    <linearGradient id="platLeftGrad" x1="370" y1="330" x2="500" y2="390" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#86EFAC" />
                      <stop offset="100%" stopColor="#4ADE80" />
                    </linearGradient>

                    <linearGradient id="platRightGrad" x1="500" y1="330" x2="630" y2="390" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#15803D" />
                    </linearGradient>

                    {/* Server Shading Gradients */}
                    <linearGradient id="srvLidGrad" x1="432" y1="120" x2="568" y2="165" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F8FAFC" />
                      <stop offset="50%" stopColor="#E2E8F0" />
                      <stop offset="100%" stopColor="#CBD5E1" />
                    </linearGradient>

                    <linearGradient id="srvLeftGrad" x1="432" y1="145" x2="500" y2="317" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#CBD5E1" />
                      <stop offset="100%" stopColor="#94A3B8" />
                    </linearGradient>

                    <linearGradient id="srvRightGrad" x1="500" y1="145" x2="568" y2="317" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#94A3B8" />
                      <stop offset="100%" stopColor="#64748B" />
                    </linearGradient>
                  </defs>

                  {/* ----------------- BASE STATIC CONNECTOR PATHS ----------------- */}
                  {/* Left Top: AI Agent Integration (X: 275, Y: 85) -> Tier 1 (X: 432, Y: 173) */}
                  <path
                    d="M 275 85 L 375 85 L 375 173 L 432 173"
                    className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Left Mid: Policy Engine (X: 275, Y: 231) -> Tier 2 (X: 432, Y: 231) */}
                  <path
                    d="M 275 231 L 432 231"
                    className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Left Bot: Spend Control (X: 275, Y: 345) -> Tier 3 (X: 432, Y: 289) */}
                  <path
                    d="M 275 345 L 375 345 L 375 289 L 432 289"
                    className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Right Top: Approval Workflow (X: 725, Y: 85) -> Tier 1 (X: 568, Y: 173) */}
                  <path
                    d="M 725 85 L 625 85 L 625 173 L 568 173"
                    className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Right Mid: Audit Trail (X: 725, Y: 231) -> Tier 2 (X: 568, Y: 231) */}
                  <path
                    d="M 725 231 L 568 231"
                    className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Right Bot: Transaction Monitoring (X: 725, Y: 345) -> Tier 3 (X: 568, Y: 289) */}
                  <path
                    d="M 725 345 L 625 345 L 625 289 L 568 289"
                    className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ----------------- ANIMATED TRAVELING GLOW PULSES ----------------- */}
                  <path
                    d="M 275 85 L 375 85 L 375 173 L 432 173"
                    stroke="url(#glowPulseGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="40 320"
                    className="connector-pulse pulse-delay-1"
                    filter="url(#softGlow)"
                  />

                  <path
                    d="M 275 231 L 432 231"
                    stroke="url(#glowPulseGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="30 200"
                    className="connector-pulse pulse-delay-2"
                    filter="url(#softGlow)"
                  />

                  <path
                    d="M 275 345 L 375 345 L 375 289 L 432 289"
                    stroke="url(#glowPulseGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="40 320"
                    className="connector-pulse pulse-delay-3"
                    filter="url(#softGlow)"
                  />

                  <path
                    d="M 725 85 L 625 85 L 625 173 L 568 173"
                    stroke="url(#glowPulseGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="40 320"
                    className="connector-pulse pulse-delay-4"
                    filter="url(#softGlow)"
                  />

                  <path
                    d="M 725 231 L 568 231"
                    stroke="url(#glowPulseGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="30 200"
                    className="connector-pulse pulse-delay-5"
                    filter="url(#softGlow)"
                  />

                  <path
                    d="M 725 345 L 625 345 L 625 289 L 568 289"
                    stroke="url(#glowPulseGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="40 320"
                    className="connector-pulse pulse-delay-6"
                    filter="url(#softGlow)"
                  />

                  {/* ======================================================== */}
                  {/* CENTRAL ISOMETRIC DATABASE STACK & MINT PLATFORM         */}
                  {/* ======================================================== */}
                  
                  {/* Platform Ambient Drop Shadow */}
                  <ellipse cx="500" cy="380" rx="145" ry="24" fill="rgba(34, 197, 94, 0.28)" filter="blur(16px)" />
                  <ellipse cx="500" cy="384" rx="115" ry="16" fill="rgba(10, 20, 10, 0.22)" filter="blur(10px)" />

                  {/* Mint Geometric Platform Base */}
                  {/* Left Face */}
                  <path
                    d="M 370 345 L 500 387 L 500 407 L 370 365 Z"
                    fill="url(#platLeftGrad)"
                  />
                  {/* Right Face */}
                  <path
                    d="M 500 387 L 630 345 L 630 365 L 500 407 Z"
                    fill="url(#platRightGrad)"
                  />
                  {/* Center Bevel Line */}
                  <line x1="500" y1="387" x2="500" y2="407" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  {/* Top Diamond Surface */}
                  <path
                    d="M 500 303 L 630 345 L 500 387 L 370 345 Z"
                    fill="url(#platTopGrad)"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.2"
                  />
                  {/* Inner Rim Accent */}
                  <path
                    d="M 500 306 L 624 345 L 500 383 L 376 345 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.8"
                  />
                  {/* Direct Soft Shadow Cast by Server on Platform Top */}
                  <path
                    d="M 500 327 L 565 348 L 500 370 L 435 348 Z"
                    fill="rgba(21, 128, 61, 0.45)"
                    filter="blur(4px)"
                  />

                  {/* ----------------- TIER 3 (BOTTOM SERVER LAYER, Y: 261..317) ----------------- */}
                  {/* Left Face */}
                  <path
                    d="M 432 261 L 500 283 L 500 317 L 432 295 Z"
                    fill="url(#srvLeftGrad)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.5"
                  />
                  {/* Right Face */}
                  <path
                    d="M 500 283 L 568 261 L 568 295 L 500 317 Z"
                    fill="url(#srvRightGrad)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.5"
                  />
                  {/* Tier 3 Details: LED + Slot Lines */}
                  <circle cx="516" cy="298" r="3" fill="#E2E8F0" />
                  <circle cx="516" cy="298" r="1.5" fill="#38BDF8" />
                  <line x1="528" y1="292" x2="552" y2="284" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="528" y1="299" x2="546" y2="293" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Seam Separator between Tier 3 & Tier 2 */}
                  <path d="M 432 261 L 500 283 L 568 261" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.85" />
                  <path d="M 432 262 L 500 284 L 568 262" fill="none" stroke="#334155" strokeWidth="0.75" opacity="0.6" />

                  {/* ----------------- TIER 2 (MIDDLE SERVER LAYER, Y: 203..259) ----------------- */}
                  {/* Left Face */}
                  <path
                    d="M 432 203 L 500 225 L 500 259 L 432 237 Z"
                    fill="url(#srvLeftGrad)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.5"
                  />
                  {/* Right Face */}
                  <path
                    d="M 500 225 L 568 203 L 568 237 L 500 259 Z"
                    fill="url(#srvRightGrad)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.5"
                  />
                  {/* Tier 2 Details: LED + Slot Lines */}
                  <circle cx="516" cy="240" r="3" fill="#E2E8F0" />
                  <circle cx="516" cy="240" r="1.5" fill="#4ADE80" />
                  <line x1="528" y1="234" x2="552" y2="226" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="528" y1="241" x2="546" y2="235" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Seam Separator between Tier 2 & Tier 1 */}
                  <path d="M 432 203 L 500 225 L 568 203" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.85" />
                  <path d="M 432 204 L 500 226 L 568 204" fill="none" stroke="#334155" strokeWidth="0.75" opacity="0.6" />

                  {/* ----------------- TIER 1 (TOP SERVER LAYER, Y: 145..201) ----------------- */}
                  {/* Left Face */}
                  <path
                    d="M 432 145 L 500 167 L 500 201 L 432 179 Z"
                    fill="url(#srvLeftGrad)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.5"
                  />
                  {/* Right Face */}
                  <path
                    d="M 500 167 L 568 145 L 568 179 L 500 201 Z"
                    fill="url(#srvRightGrad)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.5"
                  />
                  {/* Tier 1 Details: LED + Slot Lines */}
                  <circle cx="516" cy="182" r="3" fill="#E2E8F0" />
                  <circle cx="516" cy="182" r="1.5" fill="#A855F7" />
                  <line x1="528" y1="176" x2="552" y2="168" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="528" y1="183" x2="546" y2="177" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

                  {/* ----------------- SERVER TOP ROOF CAP ----------------- */}
                  <path
                    d="M 496 124 C 498 123, 502 123, 504 124 L 566 144 C 568 145, 568 147, 566 148 L 504 168 C 502 169, 498 169, 496 168 L 434 148 C 432 147, 432 145, 434 144 Z"
                    fill="url(#srvLidGrad)"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="1.2"
                  />
                  {/* Center Vertical Spine Line */}
                  <line x1="500" y1="167" x2="500" y2="317" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

                  {/* Connector Landing Nodes on Tightly Stacked Tiers */}
                  <circle cx="432" cy="173" r="3" fill="#84cc16" />
                  <circle cx="432" cy="231" r="3" fill="#84cc16" />
                  <circle cx="432" cy="289" r="3" fill="#84cc16" />
                  <circle cx="568" cy="173" r="3" fill="#84cc16" />
                  <circle cx="568" cy="231" r="3" fill="#84cc16" />
                  <circle cx="568" cy="289" r="3" fill="#84cc16" />
                </svg>

                {/* ----------------- 6 FEATURE LABELS (Proportional Coordinates) ----------------- */}
                
                {/* Left 1: AI Agent Integration (Y: 85px / 440 = 19.32%, X: 275 / 1000 = 27.5%) */}
                <div 
                  className="absolute -translate-y-1/2 z-20"
                  style={{ right: '72.5%', top: '19.32%' }}
                >
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 xl:px-4 xl:py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                    <BotIcon />
                    <span className="text-[11px] sm:text-xs xl:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      AI Agent Integration
                    </span>
                  </div>
                </div>

                {/* Left 2: Policy Engine (Y: 231px / 440 = 52.5%, X: 275 / 1000 = 27.5%) */}
                <div 
                  className="absolute -translate-y-1/2 z-20"
                  style={{ right: '72.5%', top: '52.5%' }}
                >
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 xl:px-4 xl:py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                    <ShieldIcon />
                    <span className="text-[11px] sm:text-xs xl:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      Policy Engine
                    </span>
                  </div>
                </div>

                {/* Left 3: Spend Control (Y: 345px / 440 = 78.41%, X: 275 / 1000 = 27.5%) */}
                <div 
                  className="absolute -translate-y-1/2 z-20"
                  style={{ right: '72.5%', top: '78.41%' }}
                >
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 xl:px-4 xl:py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                    <WalletIcon />
                    <span className="text-[11px] sm:text-xs xl:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      Spend Control
                    </span>
                  </div>
                </div>

                {/* Right 1: Approval Workflow (Y: 85px / 440 = 19.32%, X: 725 / 1000 = 72.5%) */}
                <div 
                  className="absolute -translate-y-1/2 z-20"
                  style={{ left: '72.5%', top: '19.32%' }}
                >
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 xl:px-4 xl:py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                    <CheckCircleIcon />
                    <span className="text-[11px] sm:text-xs xl:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      Approval Workflow
                    </span>
                  </div>
                </div>

                {/* Right 2: Audit Trail (Y: 231px / 440 = 52.5%, X: 725 / 1000 = 72.5%) */}
                <div 
                  className="absolute -translate-y-1/2 z-20"
                  style={{ left: '72.5%', top: '52.5%' }}
                >
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 xl:px-4 xl:py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                    <FileTextIcon />
                    <span className="text-[11px] sm:text-xs xl:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      Audit Trail
                    </span>
                  </div>
                </div>

                {/* Right 3: Transaction Monitoring (Y: 345px / 440 = 78.41%, X: 725 / 1000 = 72.5%) */}
                <div 
                  className="absolute -translate-y-1/2 z-20"
                  style={{ left: '72.5%', top: '78.41%' }}
                >
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 xl:px-4 xl:py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                    <ActivityIcon />
                    <span className="text-[11px] sm:text-xs xl:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      Transaction Monitoring
                    </span>
                  </div>
                </div>

              </div>

              {/* ============================================================== */}
              {/* MOBILE RESPONSIVE LAYOUT (Stacked neatly on small viewports)   */}
              {/* ============================================================== */}
              <div className="block md:hidden w-full flex flex-col items-center gap-5 mt-4">
                {/* Top 3 mobile tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                    <BotIcon />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI Agent Integration</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                    <ShieldIcon />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Policy Engine</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                    <CheckCircleIcon />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Approval Workflow</span>
                  </div>
                </div>

                {/* Mobile Central Database Vector */}
                <div className="w-[260px] aspect-[400/360] my-1">
                  <svg viewBox="350 110 300 310" className="w-full h-full overflow-visible" fill="none">
                    <ellipse cx="500" cy="380" rx="140" ry="22" fill="rgba(34, 197, 94, 0.28)" filter="blur(16px)" />
                    <path d="M 370 345 L 500 387 L 500 407 L 370 365 Z" fill="url(#platLeftGrad)" />
                    <path d="M 500 387 L 630 345 L 630 365 L 500 407 Z" fill="url(#platRightGrad)" />
                    <path d="M 500 303 L 630 345 L 500 387 L 370 345 Z" fill="url(#platTopGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                    
                    {/* Flush Tiers on Mobile */}
                    <path d="M 432 261 L 500 283 L 500 317 L 432 295 Z" fill="url(#srvLeftGrad)" />
                    <path d="M 500 283 L 568 261 L 568 295 L 500 317 Z" fill="url(#srvRightGrad)" />
                    <path d="M 432 203 L 500 225 L 500 259 L 432 237 Z" fill="url(#srvLeftGrad)" />
                    <path d="M 500 225 L 568 203 L 568 259 L 500 259 Z" fill="url(#srvRightGrad)" />
                    <path d="M 432 145 L 500 167 L 500 201 L 432 179 Z" fill="url(#srvLeftGrad)" />
                    <path d="M 500 167 L 568 145 L 568 179 L 500 201 Z" fill="url(#srvRightGrad)" />
                    <path d="M 496 124 C 498 123, 502 123, 504 124 L 566 144 C 568 145, 568 147, 566 148 L 504 168 C 502 169, 498 169, 496 168 L 434 148 C 432 147, 432 145, 434 144 Z" fill="url(#srvLidGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
                  </svg>
                </div>

                {/* Bottom 3 mobile tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                    <WalletIcon />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Spend Control</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                    <FileTextIcon />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Audit Trail</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-sm">
                    <ActivityIcon />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Transaction Monitoring</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

    </section>
  );
}
