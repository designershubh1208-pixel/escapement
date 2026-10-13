import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const partnerLogos = [
  { name: 'stripe', svg: (
    <svg className="h-6 w-auto fill-current" viewBox="0 0 60 25">
      <path d="M59.64 14.28c0-4.44-2.17-7.95-6.52-7.95-4.38 0-7.03 3.51-7.03 7.92 0 5.25 3.23 7.89 7.64 7.89 2.14 0 3.75-.48 4.97-1.16v-3.41c-1.22.61-2.58.96-4.14.96-1.74 0-3.23-.65-3.43-2.67h8.42c.04-.44.09-1.07.09-1.58zm-8.49-1.54c.08-1.84 1.25-2.6 2.37-2.6 1.09 0 2.21.76 2.21 2.6h-4.58zm-9.35-6.41c-1.72 0-2.82.8-3.41 1.36l-.23-1.08h-4.18v20.47l4.79-1.02.02-4.99c.62.48 1.62 1.05 3.1 1.05 3.86 0 6.64-3.1 6.64-7.87 0-4.92-2.82-7.92-6.73-7.92zm-1.4 12.35c-1.11 0-1.78-.39-2.22-.87l-.04-6.49c.47-.53 1.16-.92 2.26-.92 1.74 0 2.76 1.7 2.76 4.14 0 2.4-1.03 4.14-2.76 4.14zm-14.86-9.1v-2.97l-4.79 1.02v1.95h-2.34v3.83h2.34v6.86c0 3.32 1.69 4.75 4.6 4.75 1.58 0 2.73-.29 3.36-.65v-3.71c-.57.22-3.15 1.01-3.15-1.72v-5.53h3.15V9.58h-3.17zm-10.45-3.25l-4.77 1.02v3.71h-1.63v3.83h1.63v10.43h4.77V14.89c.89-.96 2.34-1.19 3.01-1.21v-4.14c-.81.02-2.12.33-3.01 1.35V6.33zm-9.74 7.62c0-.7-.57-1.19-1.54-1.19-1.39 0-3.16.59-4.52 1.36V10.2c1.54-.7 3.23-1.08 4.79-1.08 3.51 0 6.04 1.77 6.04 5.34v10.22h-4.77v-1.21c-.72.85-2.02 1.48-3.7 1.48-2.89 0-4.83-1.88-4.83-4.56 0-3.61 3.23-4.81 7.03-4.81v-.63zm-4.75 4.79c0 1.25.96 2.05 2.19 2.05 1.13 0 2.14-.64 2.56-1.58v-2.3c-1.89.04-4.75.29-4.75 1.83z" />
    </svg>
  )},
  { name: 'Klarna', text: 'Klarna.' },
  { name: 'MAERSK', svg: (
    <div className="flex items-center gap-1.5 font-bold tracking-widest text-sm">
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2l2.6 6.3L21 9.2l-4.8 4.7 1.1 6.8L12 17.5 6.7 20.7l1.1-6.8L3 9.2l6.4-.9L12 2z"/>
      </svg>
      <span>MAERSK</span>
    </div>
  )},
  { name: 'flexport', text: 'flexport' },
  { name: 'Y Combinator', svg: (
    <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight">
      <span className="w-5 h-5 rounded bg-current text-ink flex items-center justify-center font-black text-xs">Y</span>
      <span>Combinator</span>
    </div>
  )},
  { name: 'Brex', svg: (
    <div className="flex items-center gap-1 font-bold text-sm tracking-wider">
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
      <span>Brex</span>
    </div>
  )},
  { name: 'SEQUOIA', text: 'SEQUOIA' }
];

export default function StarterPayHero() {
  return (
    <section className="relative w-full min-h-screen bg-ink flex flex-col justify-between overflow-hidden">
      
      {/* ============================================================== */}
      {/* TOP ART BACKGROUND: Full-Width 3D Neon Ribbon Flow */}
      {/* ============================================================== */}
      <div className="relative w-full h-[52vh] sm:h-[58vh] md:h-[62vh] min-h-[380px] overflow-hidden select-none">
        {/* Full Edge-to-Edge Abstract 3D Wave */}
        <img 
          src="/hero-wave.jpg" 
          alt="Neural Routing 3D Wave Visual" 
          className="w-full h-full object-cover object-center scale-[1.02]"
        />

        {/* Crisp horizontal refraction beam across the top header zone */}
        <div className="absolute top-[88px] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

        {/* Seamless bottom fade into body canvas */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/60 to-transparent pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* BOTTOM CONTENT: Typography, CTAs & Full-Width Partner Logos */}
      {/* ============================================================== */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 -mt-16 sm:-mt-24 md:-mt-32 pb-12 sm:pb-16 flex-1 flex flex-col justify-between">
        
        {/* Chip + Headline + CTA Section */}
        <div>
          {/* Mini Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-xs sm:text-sm font-medium tracking-wide text-paper/70"
          >
            <span className="text-amber-500 dark:text-orange-400 text-sm">⚡</span>
            <span>Neural Routing Active, 99.98% Efficiency</span>
          </motion.div>

          {/* Headline and CTAs row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12 mb-14 sm:mb-20">
            {/* Display Headline */}
            <div className="max-w-4xl">
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] xl:text-[98px] font-extrabold tracking-[-0.035em] leading-[0.92] text-paper">
                <span className="block">Global Transfers</span>
                <span className="inline-flex items-center gap-3 sm:gap-5 flex-wrap">
                  <span className="inline-block transform translate-y-[-2px] text-paper font-normal text-4xl sm:text-6xl lg:text-[80px]">
                    →
                  </span>
                  <span>managed by AI.</span>
                </span>
              </h1>
            </div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3 sm:gap-4 shrink-0"
            >
              {/* Secondary Pill Button */}
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-6 sm:px-7 h-12 sm:h-13 rounded-full text-xs sm:text-sm font-semibold tracking-tight border border-white/15 bg-white/5 hover:bg-white/10 text-paper transition-all duration-200 shadow-sm"
              >
                See more
              </Link>

              {/* Primary Sunrise Gradient Button */}
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 h-12 sm:h-13 rounded-full text-xs sm:text-sm font-bold tracking-tight text-zinc-950 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(105deg, #f97316 0%, #fb923c 45%, #fca5a5 100%)'
                }}
              >
                <span className="relative z-10">Create your account</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Full-Width Divider Line & Partner Wall */}
        <div>
          <div className="w-full h-px bg-white/10 mb-8" />
          
          <div className="flex flex-wrap items-center justify-between gap-6 sm:gap-8 opacity-75 hover:opacity-95 transition-opacity text-paper/70">
            {partnerLogos.map((partner, index) => (
              <div 
                key={index} 
                className="flex items-center transition-colors hover:text-paper cursor-default select-none"
              >
                {partner.svg ? (
                  partner.svg
                ) : (
                  <span className="font-display font-black text-base sm:text-lg tracking-tight">
                    {partner.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
