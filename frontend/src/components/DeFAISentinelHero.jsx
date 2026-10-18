import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CentralDatabaseIllustration from './CentralDatabaseIllustration';

// Six geometric icons matching the reference's outlined tech icon aesthetic
const BotIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default function DeFAISentinelHero() {
  return (
    <section className="relative w-full min-h-[100svh] pt-32 pb-24 overflow-hidden bg-ink transition-colors duration-500">
      
      {/* ============================================================== */}
      {/* 1. MINT-GREEN STIPPLED / GRADIENT TEXTURE BACKGROUND          */}
      {/* Concentrated around the outer edges as specified in prompt     */}
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
        <svg className="absolute inset-0 w-full h-full opacity-[0.25] dark:opacity-[0.12] mix-blend-overlay">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.8  0 0 0 0 0.3  0 0 0 0.15 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>

        {/* Top-down soft vignette to keep navbar clean */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink via-ink/50 to-transparent" />
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN HERO CONTENT CONTAINER                                 */}
      {/* ============================================================== */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Eyebrow Label: "Introducing Autonomous Financial Agent" */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center justify-center px-5 py-1.5 mb-8 rounded-full border border-black/15 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-sm"
        >
          <span className="font-sans text-xs sm:text-[13px] font-medium tracking-tight text-zinc-800 dark:text-zinc-200">
            Introducing Autonomous Financial Agent
          </span>
        </motion.div>

        {/* Main Heading: */}
        {/* "SECURE AUTONOMOUS" */}
        {/* "FINANCIAL AGENT" */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[104px] font-black uppercase tracking-tight leading-[0.92] text-paper mb-6"
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl mx-auto text-xs sm:text-sm md:text-[15px] font-sans font-normal leading-relaxed text-zinc-700 dark:text-zinc-300 mb-9 px-4"
        >
          We build the secure, autonomous AI agents that handle financial tasks with deterministic policy enforcement.
          Every transaction is evaluated in real-time. Trust is no longer assumed, it is mathematically verified.
        </motion.p>

        {/* CTA Buttons: See more + Chat ↗ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex items-center justify-center gap-3.5 mb-14 sm:mb-18"
        >
          {/* "See more" Button */}
          <Link
            to="/services"
            className="inline-flex items-center justify-center px-6 sm:px-7 h-11 sm:h-12 rounded-full text-xs sm:text-sm font-semibold tracking-tight border border-black/15 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-all duration-200 shadow-sm"
          >
            See more
          </Link>

          {/* "Chat ↗" Button */}
          <Link
            to="/chat"
            className="group inline-flex items-center justify-center gap-1.5 px-7 sm:px-8 h-11 sm:h-12 rounded-full text-xs sm:text-sm font-bold tracking-tight bg-[#84cc16] text-zinc-950 hover:bg-[#76b813] transition-all duration-200 shadow-md shadow-[#84cc16]/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Chat</span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
          </Link>
        </motion.div>

        {/* ============================================================== */}
        {/* 3. CENTRAL DATABASE ILLUSTRATION & 6 CONNECTED LABELS          */}
        {/* Responsive Diagram with Animated Connector Paths & Traveling Glow*/}
        {/* ============================================================== */}
        <div className="relative w-full max-w-5xl mx-auto mt-4 px-2 select-none">
          
          {/* Desktop & Tablet Diagram Layout (Hidden on small mobile) */}
          <div className="relative hidden md:block w-full h-[380px] lg:h-[420px]">
            
            {/* SVG Connector Geometry with Glowing Traveling Pulses */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 1000 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Traveling Glow Pulse Gradient */}
                <linearGradient id="travelGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity="0" />
                  <stop offset="50%" stopColor="#84cc16" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                </linearGradient>

                {/* Soft glow filter */}
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* ----------------- BASE STATIC CONNECTOR PATHS ----------------- */}
              {/* Left Top: AI Agent Integration -> Server (Path 1) */}
              <path
                id="path-left-top"
                d="M 280 90 L 390 90 L 390 190 L 460 190"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Left Middle: Policy Engine -> Server (Path 2) */}
              <path
                id="path-left-mid"
                d="M 330 215 L 460 215"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Left Bottom: Spend Control -> Platform Base (Path 3) */}
              <path
                id="path-left-bot"
                d="M 250 320 L 410 320 L 410 260 L 460 260"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Right Top: Approval Workflow -> Server (Path 4) */}
              <path
                id="path-right-top"
                d="M 720 90 L 610 90 L 610 190 L 540 190"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Right Middle: Audit Trail -> Server (Path 5) */}
              <path
                id="path-right-mid"
                d="M 670 215 L 540 215"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Right Bottom: Transaction Monitoring -> Platform Base (Path 6) */}
              <path
                id="path-right-bot"
                d="M 750 320 L 590 320 L 590 260 L 540 260"
                className="stroke-zinc-400/50 dark:stroke-zinc-600/60"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* ----------------- ANIMATED TRAVELING GLOW PULSES ----------------- */}
              {/* Path 1 Glow */}
              <path
                d="M 280 90 L 390 90 L 390 190 L 460 190"
                stroke="url(#travelGlow)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-1"
                filter="url(#glowFilter)"
              />

              {/* Path 2 Glow */}
              <path
                d="M 330 215 L 460 215"
                stroke="url(#travelGlow)"
                strokeWidth="2.5"
                strokeDasharray="30 200"
                className="connector-pulse pulse-delay-2"
                filter="url(#glowFilter)"
              />

              {/* Path 3 Glow */}
              <path
                d="M 250 320 L 410 320 L 410 260 L 460 260"
                stroke="url(#travelGlow)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-3"
                filter="url(#glowFilter)"
              />

              {/* Path 4 Glow */}
              <path
                d="M 720 90 L 610 90 L 610 190 L 540 190"
                stroke="url(#travelGlow)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-4"
                filter="url(#glowFilter)"
              />

              {/* Path 5 Glow */}
              <path
                d="M 670 215 L 540 215"
                stroke="url(#travelGlow)"
                strokeWidth="2.5"
                strokeDasharray="30 200"
                className="connector-pulse pulse-delay-5"
                filter="url(#glowFilter)"
              />

              {/* Path 6 Glow */}
              <path
                d="M 750 320 L 590 320 L 590 260 L 540 260"
                stroke="url(#travelGlow)"
                strokeWidth="2.5"
                strokeDasharray="40 320"
                className="connector-pulse pulse-delay-6"
                filter="url(#glowFilter)"
              />
            </svg>

            {/* ----------------- FLOATING CENTRAL DATABASE ----------------- */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <CentralDatabaseIllustration />
            </motion.div>

            {/* ----------------- 6 FEATURE LABELS AROUND DATABASE ----------------- */}
            
            {/* Left 1: AI Agent Integration */}
            <div className="absolute left-[7%] lg:left-[10%] top-[14%] z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <BotIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  AI Agent Integration
                </span>
              </div>
            </div>

            {/* Left 2: Policy Engine */}
            <div className="absolute left-[13%] lg:left-[17%] top-[45%] z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <ShieldIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Policy Engine
                </span>
              </div>
            </div>

            {/* Left 3: Spend Control */}
            <div className="absolute left-[5%] lg:left-[8%] top-[72%] z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <WalletIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Spend Control
                </span>
              </div>
            </div>

            {/* Right 1: Approval Workflow */}
            <div className="absolute right-[7%] lg:right-[10%] top-[14%] z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <CheckCircleIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Approval Workflow
                </span>
              </div>
            </div>

            {/* Right 2: Audit Trail */}
            <div className="absolute right-[13%] lg:right-[17%] top-[45%] z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <FileTextIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Audit Trail
                </span>
              </div>
            </div>

            {/* Right 3: Transaction Monitoring */}
            <div className="absolute right-[5%] lg:right-[7%] top-[72%] z-20">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#121413] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 duration-200">
                <ActivityIcon />
                <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Transaction Monitoring
                </span>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* MOBILE RESPONSIVE LAYOUT (Stacked nicely on small screens)     */}
          {/* ============================================================== */}
          <div className="block md:hidden w-full flex flex-col items-center gap-8">
            {/* Top 3 mobile tags */}
            <div className="flex flex-wrap justify-center gap-3">
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

            {/* Central Database Float */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="my-2"
            >
              <CentralDatabaseIllustration className="scale-90" />
            </motion.div>

            {/* Bottom 3 mobile tags */}
            <div className="flex flex-wrap justify-center gap-3">
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
