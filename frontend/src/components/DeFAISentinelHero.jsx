import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Tech SVG Icons for Stage Visualization
const BotChipIcon = () => (
  <svg className="w-4 h-4 text-[#84cc16] stroke-[2] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const ShieldLockIcon = () => (
  <svg className="w-5 h-5 text-[#84cc16] stroke-[2] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CheckCircleSolidIcon = () => (
  <svg className="w-4 h-4 text-[#84cc16] shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const LedgerReceiptIcon = () => (
  <svg className="w-4 h-4 text-[#84cc16] stroke-[2] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#84cc16] fill-currentColor" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function DeFAISentinelHero() {
  return (
    <section className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 overflow-hidden bg-ink transition-colors duration-500">
      
      {/* ============================================================== */}
      {/* 1. MINT-GREEN STIPPLED & AMBIENT GRADIENT BACKGROUND           */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Left Mint/Lime Ambient Flare */}
        <div 
          className="absolute -left-24 top-1/6 w-[55vw] h-[75vh] max-w-[800px] rounded-full opacity-60 dark:opacity-20 blur-[110px]"
          style={{
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.85) 0%, rgba(110, 231, 183, 0.45) 45%, rgba(52, 211, 153, 0) 70%)'
          }}
        />

        {/* Right Mint/Lime Ambient Flare */}
        <div 
          className="absolute -right-24 top-1/4 w-[55vw] h-[75vh] max-w-[800px] rounded-full opacity-60 dark:opacity-20 blur-[110px]"
          style={{
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.8) 0%, rgba(134, 239, 172, 0.4) 45%, rgba(34, 197, 94, 0) 70%)'
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

        {/* Top vignette to keep floating navbar clean */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink via-ink/50 to-transparent" />
      </div>

      {/* ============================================================== */}
      {/* 2. CENTERED STATEMENT + FULL-WIDTH VISUAL COMPOSITION          */}
      {/* Matches Mission Container: mx-auto w-full max-w-7xl px-6 lg:px-8 */}
      {/* ============================================================== */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* ----------------- 1. Announcement Eyebrow Badge ----------------- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84cc16] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#84cc16]"></span>
          </span>
          <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-800 dark:text-zinc-200 uppercase">
            Deterministic Policy Engine v2.4 Active
          </span>
        </motion.div>

        {/* ----------------- 2. Large Centered Headline ----------------- */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          style={{ 
            fontFamily: "'Bricolage Grotesque', sans-serif",
            letterSpacing: "-2.5px",
            lineHeight: "1.02"
          }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-bold text-paper max-w-5xl mb-6 mx-auto tracking-tight"
        >
          <span className="block text-zinc-950 dark:text-white">
            Autonomous financial operations,
          </span>
          <span className="text-[#84cc16]">
            mathematically verified.
          </span>
        </motion.h1>

        {/* ----------------- 3. Short Supporting Description ----------------- */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-sans font-normal leading-relaxed text-zinc-600 dark:text-zinc-300 mb-8 sm:mb-9 px-4"
        >
          Escapement evaluates every agent action in real time against cryptographic policy constraints—guaranteeing zero spend overruns, instant auditability, and autonomous execution you can trust.
        </motion.p>

        {/* ----------------- 4. Centered CTA Button Group ----------------- */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-12 sm:mb-16"
        >
          {/* Primary CTA: Launch Sentinel Agent */}
          <Link
            to="/chat"
            className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 h-12 rounded-full text-xs sm:text-sm font-bold tracking-tight bg-[#84cc16] text-zinc-950 hover:bg-[#76b813] transition-all duration-200 shadow-md shadow-[#84cc16]/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Sentinel Agent</span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
          </Link>

          {/* Secondary CTA: Explore Policies */}
          <Link
            to="/policies"
            className="inline-flex items-center justify-center px-6 sm:px-7 h-12 rounded-full text-xs sm:text-sm font-semibold tracking-tight border border-black/15 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-all duration-200 shadow-sm"
          >
            Explore Policies
          </Link>
        </motion.div>

        {/* ----------------- 5. ORIGINAL FULL-WIDTH VISUAL COMPOSITION ----------------- */}
        {/* Spans ~88% of container width: A Layered Real-Time Policy Verification Console */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="w-full max-w-[1140px] mx-auto select-none"
        >
          {/* Outer Glassmorphic Chassis */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-black/10 dark:border-white/10 bg-gradient-to-b from-white/95 via-white/80 to-white/60 dark:from-[#111312]/95 dark:via-[#0c0e0d]/90 dark:to-[#080908]/95 backdrop-blur-xl shadow-[0_20px_70px_-15px_rgba(132,204,22,0.14)] overflow-hidden text-left">
            
            {/* Top Terminal Status Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="hidden sm:inline-block ml-3 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  ESCAPEMENT // DETERMINISTIC_EXECUTION_RUNNING
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-medium border border-[#84cc16]/30 bg-[#84cc16]/10 text-zinc-900 dark:text-[#a3e635]">
                  <ZapIcon />
                  LATENCY: ~1.18ms
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <CheckCircleSolidIcon />
                  ZERO POLICY DRIFT
                </span>
              </div>
            </div>

            {/* Central 3-Stage Visual Pipeline */}
            <div className="relative p-5 sm:p-7 lg:p-8">
              
              {/* Subtle background circuit bus grid lines */}
              <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

              {/* Connecting animated conduit line across stages (desktop) */}
              <div className="hidden lg:block absolute left-[12%] right-[12%] top-[48%] h-[2px] bg-gradient-to-r from-transparent via-[#84cc16]/40 to-transparent pointer-events-none">
                <div className="w-24 h-[3px] bg-[#84cc16] blur-[1px] animate-[connectorTravel_3s_linear_infinite]" />
              </div>

              {/* 3 Interconnected Execution Stages */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
                
                {/* ----------------- STAGE 1: INGESTION (Agent Intent) ----------------- */}
                <div className="flex flex-col justify-between p-4 sm:p-5 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md shadow-sm transition-all hover:border-[#84cc16]/40 duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px] tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-semibold">
                        Stage 01 // Intent Ingest
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Autonomous
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="p-2 rounded-lg bg-[#84cc16]/10 border border-[#84cc16]/20">
                        <BotChipIcon />
                      </div>
                      <div>
                        <div className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                          AI Agent Intent Stream
                        </div>
                        <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          Agent ID: 0x89A...TreasuryBot
                        </div>
                      </div>
                    </div>

                    {/* Transaction Payload Spec */}
                    <div className="space-y-1.5 p-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Action:</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">REBALANCE_YIELD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Requested:</span>
                        <span className="font-semibold text-[#84cc16]">$24,500.00 USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Target Protocol:</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Aave V3 Liquidity</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-600 dark:text-zinc-400">Schema Validation:</span>
                    <span className="text-[#84cc16] font-semibold flex items-center gap-1">
                      <CheckCircleSolidIcon /> PASSED
                    </span>
                  </div>
                </div>

                {/* ----------------- STAGE 2: POLICY CORE (Focal Point) ----------------- */}
                <div className="relative flex flex-col justify-between p-4 sm:p-5 rounded-xl border-2 border-[#84cc16]/60 dark:border-[#84cc16]/50 bg-gradient-to-b from-[#84cc16]/[0.08] to-transparent dark:from-[#84cc16]/[0.05] dark:to-transparent backdrop-blur-md shadow-lg shadow-[#84cc16]/10">
                  
                  {/* Subtle active laser scan bar animation across the core */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#84cc16] to-transparent animate-pulse" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px] tracking-wider uppercase text-[#84cc16] font-bold">
                        Stage 02 // Policy Core
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#84cc16] text-zinc-950">
                        ENFORCING
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="p-2 rounded-lg bg-[#84cc16] text-zinc-950 shadow-sm shadow-[#84cc16]/40">
                        <ShieldLockIcon />
                      </div>
                      <div>
                        <div className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                          Deterministic Guardrails
                        </div>
                        <div className="font-mono text-[11px] text-[#84cc16]">
                          Cryptographic Policy Evaluation
                        </div>
                      </div>
                    </div>

                    {/* 3 Real-time Rule Verifications */}
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex items-center justify-between p-2 rounded-md bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/10">
                        <span className="text-zinc-700 dark:text-zinc-300">Cap: ≤ $50,000/day</span>
                        <span className="text-[#84cc16] font-bold">PASS ✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/10">
                        <span className="text-zinc-700 dark:text-zinc-300">Smart Contract Whitelist</span>
                        <span className="text-[#84cc16] font-bold">VERIFIED ✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/10">
                        <span className="text-zinc-700 dark:text-zinc-300">Multi-Sig Anomaly Scan</span>
                        <span className="text-[#84cc16] font-bold">0.00% RISK ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#84cc16]/20 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-600 dark:text-zinc-400">Cryptographic Proof:</span>
                    <span className="font-bold text-[#84cc16]">ZK-SNARK #4092 VALID</span>
                  </div>
                </div>

                {/* ----------------- STAGE 3: SETTLEMENT & AUDIT ----------------- */}
                <div className="flex flex-col justify-between p-4 sm:p-5 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md shadow-sm transition-all hover:border-[#84cc16]/40 duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px] tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-semibold">
                        Stage 03 // Settlement & Audit
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Immutable
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="p-2 rounded-lg bg-[#84cc16]/10 border border-[#84cc16]/20">
                        <LedgerReceiptIcon />
                      </div>
                      <div>
                        <div className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                          Deterministic Execution
                        </div>
                        <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          Tx Hash: 0x9e7a...2f1c
                        </div>
                      </div>
                    </div>

                    {/* Receipt Output */}
                    <div className="space-y-1.5 p-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Execution State:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">COMMITTED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Audit Timestamp:</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Real-Time Sync</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Policy Overrun:</span>
                        <span className="font-semibold text-[#84cc16]">$0.00 (Zero Drift)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-600 dark:text-zinc-400">Ledger Block:</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold">#19,842,012</span>
                  </div>
                </div>

              </div>

              {/* Bottom Live Metric Strip */}
              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div>
                  <div className="font-mono text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Average Latency</div>
                  <div className="font-mono text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">1.18 ms</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Policy Adherence</div>
                  <div className="font-mono text-xs sm:text-[13px] font-bold text-[#84cc16] mt-0.5">100.0% Pass</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Spend Overruns</div>
                  <div className="font-mono text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">$0.00 Blocked</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Verification Proof</div>
                  <div className="font-mono text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Cryptographic</div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>

      </div>

    </section>
  );
}
