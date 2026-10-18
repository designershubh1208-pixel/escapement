import React from 'react';

/**
 * Isometric Database / Server Stack on Hexagonal-Diamond Mint-Green Platform
 * Pure vector SVG component with layered 3-tier servers, status LED dots,
 * geometric mint-green base platform, drop shadow, and ambient lighting.
 * ViewBox: 400 x 360, Center at X=200.
 * Server tier left edges: X=128 (Y=140, 195, 250)
 * Server tier right edges: X=272 (Y=140, 195, 250)
 */
export default function CentralDatabaseIllustration({ className = "" }) {
  return (
    <div className={`relative w-[300px] sm:w-[340px] md:w-[380px] lg:w-[420px] aspect-[400/360] mx-auto select-none ${className}`}>
      <svg
        viewBox="0 0 400 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-[0_20px_40px_rgba(132,204,22,0.18)] dark:drop-shadow-[0_25px_50px_rgba(132,204,22,0.25)]"
      >
        <defs>
          {/* Platform Top Face - Gradient from Soft Mint to Vibrant Lime */}
          <linearGradient id="platformTopGrad" x1="60" y1="270" x2="340" y2="330" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="50%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Platform Left Side - Light Mint Green */}
          <linearGradient id="platformLeftGrad" x1="60" y1="285" x2="200" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>

          {/* Platform Right Side - Emerald Vivid Green */}
          <linearGradient id="platformRightGrad" x1="200" y1="285" x2="340" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Server Top Lid - Soft Light Silver-Gray */}
          <linearGradient id="serverLidGrad" x1="120" y1="120" x2="280" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Server Tier Left Faces - Medium Light Silver */}
          <linearGradient id="serverLeftGrad" x1="120" y1="150" x2="200" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Server Tier Right Faces - Deeper Slate/Steel Gray */}
          <linearGradient id="serverRightGrad" x1="200" y1="150" x2="280" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Platform Bottom Ambient Drop Shadow Filter */}
          <filter id="softShadow" x="0" y="270" width="400" height="90" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="10" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.05   0 0 0 0 0.35   0 0 0 0 0.15  0 0 0 0.35 0" />
          </filter>
        </defs>

        {/* ======================================================== */}
        {/* AMBIENT GLOW / DROP SHADOW UNDERNEATH PLATFORM */}
        {/* ======================================================== */}
        <ellipse cx="200" cy="325" rx="140" ry="24" fill="rgba(34, 197, 94, 0.28)" filter="blur(16px)" />
        <ellipse cx="200" cy="330" rx="110" ry="16" fill="rgba(10, 20, 10, 0.2)" filter="blur(10px)" />

        {/* ======================================================== */}
        {/* GEOMETRIC BASE PLATFORM (Mint-Green to Vivid Emerald) */}
        {/* Diamond isometric slab: Left (60, 286), Center-Top (200, 242), Right (340, 286), Center-Front (200, 331) */}
        {/* Platform Height = 23px */}
        {/* ======================================================== */}

        {/* Platform Left Vertical Face */}
        <path
          d="M60 286 L200 331 L200 354 L60 309 Z"
          fill="url(#platformLeftGrad)"
        />

        {/* Platform Right Vertical Face */}
        <path
          d="M200 331 L340 286 L340 309 L200 354 Z"
          fill="url(#platformRightGrad)"
        />

        {/* Platform Center Bevel Seam Line */}
        <line x1="200" y1="331" x2="200" y2="354" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* Platform Top Diamond Surface */}
        <path
          d="M200 242 L340 286 L200 331 L60 286 Z"
          fill="url(#platformTopGrad)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.2"
        />

        {/* Subtle Platform Inner Glow Rim */}
        <path
          d="M200 245 L334 286 L200 327 L66 286 Z"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
        />

        {/* Soft shadow cast by the server onto the platform top */}
        <path
          d="M200 270 L275 292 L200 316 L125 292 Z"
          fill="rgba(21, 128, 61, 0.45)"
          filter="blur(4px)"
        />

        {/* ======================================================== */}
        {/* CENTRAL THREE-TIER DATABASE / SERVER STACK */}
        {/* Center column width = 144px (X: 128 to 272), Center X = 200 */}
        {/* Left corner (128, Y), Center corner (200, Y+24), Right corner (272, Y) */}
        {/* ======================================================== */}

        {/* ----------------- TIER 3 (BOTTOM LAYER) ----------------- */}
        {/* Left Side Face */}
        <path
          d="M128 250 L200 274 L200 304 L128 280 Z"
          fill="url(#serverLeftGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />
        {/* Right Side Face */}
        <path
          d="M200 274 L272 250 L272 280 L200 304 Z"
          fill="url(#serverRightGrad)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        {/* Bottom Tier Status Indicators on Right Face */}
        <circle cx="218" cy="287" r="3" fill="#E2E8F0" />
        <circle cx="218" cy="287" r="1.5" fill="#38BDF8" />
        <line x1="232" y1="281" x2="256" y2="273" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="232" y1="288" x2="250" y2="282" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Tier 3 Seam Divider Highlight */}
        <path d="M128 250 L200 274 L272 250" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.75" />
        <path d="M128 251 L200 275 L272 251" fill="none" stroke="#475569" strokeWidth="0.8" opacity="0.5" />

        {/* ----------------- TIER 2 (MIDDLE LAYER) ----------------- */}
        {/* Left Side Face */}
        <path
          d="M128 195 L200 219 L200 249 L128 225 Z"
          fill="url(#serverLeftGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />
        {/* Right Side Face */}
        <path
          d="M200 219 L272 195 L272 225 L200 249 Z"
          fill="url(#serverRightGrad)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        {/* Middle Tier Status Indicators on Right Face */}
        <circle cx="218" cy="232" r="3" fill="#E2E8F0" />
        <circle cx="218" cy="232" r="1.5" fill="#4ADE80" />
        <line x1="232" y1="226" x2="256" y2="218" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="232" y1="233" x2="250" y2="227" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Tier 2 Seam Divider Highlight */}
        <path d="M128 195 L200 219 L272 195" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.75" />
        <path d="M128 196 L200 220 L272 196" fill="none" stroke="#475569" strokeWidth="0.8" opacity="0.5" />

        {/* ----------------- TIER 1 (TOP LAYER) ----------------- */}
        {/* Left Side Face */}
        <path
          d="M128 140 L200 164 L200 194 L128 170 Z"
          fill="url(#serverLeftGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />
        {/* Right Side Face */}
        <path
          d="M200 164 L272 140 L272 170 L200 194 Z"
          fill="url(#serverRightGrad)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        {/* Top Tier Status Indicators on Right Face */}
        <circle cx="218" cy="177" r="3" fill="#E2E8F0" />
        <circle cx="218" cy="177" r="1.5" fill="#A855F7" />
        <line x1="232" y1="171" x2="256" y2="163" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="232" y1="178" x2="250" y2="172" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

        {/* ----------------- SERVER TOP ROOF LID ----------------- */}
        <path
          d="M196 117 C 198 116, 202 116, 204 117 L 270 139 C 272 140, 272 142, 270 143 L 204 165 C 202 166, 198 166, 196 165 L 130 143 C 128 142, 128 140, 130 139 Z"
          fill="url(#serverLidGrad)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.2"
        />

        {/* Central Spine Bevel Highlight */}
        <line x1="200" y1="164" x2="200" y2="304" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* Subtle Connector Landing Nodes at Tier Seams */}
        {/* Left Side Connection Junctions (Y = 160, 215, 270) */}
        <circle cx="128" cy="160" r="3" fill="#94A3B8" />
        <circle cx="128" cy="215" r="3" fill="#94A3B8" />
        <circle cx="128" cy="270" r="3" fill="#94A3B8" />

        {/* Right Side Connection Junctions (Y = 160, 215, 270) */}
        <circle cx="272" cy="160" r="3" fill="#64748B" />
        <circle cx="272" cy="215" r="3" fill="#64748B" />
        <circle cx="272" cy="270" r="3" fill="#64748B" />
      </svg>
    </div>
  );
}
