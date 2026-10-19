import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

export default function DeFAISentinelHero() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);

  // ==========================================================================
  // 1. MOUSE-DRIVEN PARALLAX (Spring Physics)
  // ==========================================================================
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 100, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Normalize coordinates between -1 and 1
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // ==========================================================================
  // 2. SCROLL-DRIVEN PARALLAX
  // ==========================================================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Background Ellipse Parallax
  const ellipseMouseX = useTransform(smoothMouseX, [-1, 1], [-30, 30]);
  const ellipseMouseY = useTransform(smoothMouseY, [-1, 1], [-25, 25]);
  const ellipseScrollY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  // Main Ribbon Background Parallax
  const ribbonMouseX = useTransform(smoothMouseX, [-1, 1], [-12, 12]);
  const ribbonMouseY = useTransform(smoothMouseY, [-1, 1], [-8, 8]);
  const ribbonScrollY = useTransform(scrollYProgress, [0, 1], [0, -35]);

  // USDC Coin (left foreground - highest parallax depth)
  const usdcMouseX = useTransform(smoothMouseX, [-1, 1], [-32, 32]);
  const usdcMouseY = useTransform(smoothMouseY, [-1, 1], [-24, 24]);
  const usdcRotate = useTransform(smoothMouseX, [-1, 1], [-5, 5]);
  const usdcScrollY = useTransform(scrollYProgress, [0, 1], [0, -110]);

  // Bitcoin Coin (center midground)
  const btcMouseX = useTransform(smoothMouseX, [-1, 1], [-18, 18]);
  const btcMouseY = useTransform(smoothMouseY, [-1, 1], [-14, 14]);
  const btcRotate = useTransform(smoothMouseX, [-1, 1], [-3, 3]);
  const btcScrollY = useTransform(scrollYProgress, [0, 1], [0, -65]);

  // Tether Coin (mid-right)
  const tetherMouseX = useTransform(smoothMouseX, [-1, 1], [-24, 24]);
  const tetherMouseY = useTransform(smoothMouseY, [-1, 1], [-18, 18]);
  const tetherRotate = useTransform(smoothMouseX, [-1, 1], [3, -3]);
  const tetherScrollY = useTransform(scrollYProgress, [0, 1], [0, -85]);

  // ETH Coin (right foreground - high parallax depth)
  const ethMouseX = useTransform(smoothMouseX, [-1, 1], [-38, 38]);
  const ethMouseY = useTransform(smoothMouseY, [-1, 1], [-28, 28]);
  const ethRotate = useTransform(smoothMouseX, [-1, 1], [6, -6]);
  const ethScrollY = useTransform(scrollYProgress, [0, 1], [0, -125]);

  // Text scroll translation & fade
  const textScrollY = useTransform(scrollYProgress, [0, 0.8], [0, 50]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-white text-zinc-950 flex flex-col items-center justify-between min-h-screen" 
    >
      
      {/* ============================================================== */}
      {/* 1. TOP SAPPHIRE/ROYAL BLUE AMBIENT GLOW ELLIPSE WITH PARALLAX  */}
      {/* ============================================================== */}
      <motion.div 
        style={{
          x: ellipseMouseX,
          y: ellipseMouseY,
          translateY: ellipseScrollY,
          aspectRatio: '1',
          backgroundColor: '#0066ff',
          borderRadius: '50%',
          width: '88rem',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '-46rem',
          filter: 'blur(15rem)',
          WebkitFilter: 'blur(15rem)'
        }}
        className="hero-bg-ellipse pointer-events-none"
      />

      {/* Glitching Noise Overlay - strictly masked over the top blue glow, zero on white canvas */}
      <div className="hero-bg-noise" />

      {/* ============================================================== */}
      {/* 2. MINIMALIST TOP HEADER WITH CRISP STATIONARY ESCAPEMENT LOGO */}
      {/* ============================================================== */}
      <header className="relative z-30 w-full flex items-center justify-between max-w-7xl px-6 sm:px-8 pt-7 pb-2">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <img 
            src="/escapement-logo-blue.png" 
            alt="Escapement" 
            className="h-[18px] sm:h-[20px] w-auto object-contain select-none" 
          />
          <span className="font-display font-bold text-base sm:text-lg text-[#0b0f19] tracking-tight group-hover:text-[#0066ff] transition-colors leading-none">
            Escapement
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 transition-colors">
            Sign In
          </Link>
          <a 
            href="#waitlist" 
            className="rounded-full bg-[#010320] hover:bg-[#0066ff] text-white font-semibold px-5 py-2.5 text-xs transition-all duration-300 shadow-sm hover:shadow-[0_4px_15px_rgba(0,102,255,0.3)] cursor-pointer"
          >
            Join waitlist
          </a>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 3. HERO 3D COIN & RIBBON ILLUSTRATION LAYER WITH PARALLAX      */}
      {/* Multi-layered depth with mouse motion + scroll translation     */}
      {/* ============================================================== */}
      <div className="relative z-10 w-full max-w-[96rem] mx-auto px-2 sm:px-4 flex justify-center mt-2 sm:mt-4">
        <div className="relative w-full max-w-6xl lg:max-w-7xl xl:max-w-[86rem]" style={{ aspectRatio: '32 / 12' }}>
          
          {/* Main swooping layered ribbons & light rays */}
          <motion.div 
            style={{ y: ribbonScrollY }}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 hero-bg-image s1"
          >
            <motion.div 
              style={{ x: ribbonMouseX, y: ribbonMouseY }}
              className="w-full h-full"
            >
              <img 
                src="/nexaris/main-bg.png" 
                alt="Escapement Autonomous Infrastructure" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* 3D USDC Coin (Levitation 1 + Parallax Layer) */}
          <motion.div 
            style={{ y: usdcScrollY }}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-20"
          >
            <motion.div 
              style={{ x: usdcMouseX, y: usdcMouseY, rotate: usdcRotate }}
              data-levitation="1" 
              className="w-full h-full"
            >
              <img 
                src="/nexaris/usdc.png" 
                alt="USDC Settlement" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* 3D Bitcoin Coin (Levitation 2 + Parallax Layer) */}
          <motion.div 
            style={{ y: btcScrollY }}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-30"
          >
            <motion.div 
              style={{ x: btcMouseX, y: btcMouseY, rotate: btcRotate }}
              data-levitation="2" 
              className="w-full h-full"
            >
              <img 
                src="/nexaris/btc.png" 
                alt="Bitcoin Vault" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* 3D Tether Coin (Levitation 1 + Parallax Layer) */}
          <motion.div 
            style={{ y: tetherScrollY }}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-20"
          >
            <motion.div 
              style={{ x: tetherMouseX, y: tetherMouseY, rotate: tetherRotate }}
              data-levitation="1" 
              className="w-full h-full"
            >
              <img 
                src="/nexaris/tether.png" 
                alt="Tether Liquidity" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* 3D Ethereum Coin (Levitation 2 + Parallax Layer) */}
          <motion.div 
            style={{ y: ethScrollY }}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-30"
          >
            <motion.div 
              style={{ x: ethMouseX, y: ethMouseY, rotate: ethRotate }}
              data-levitation="2" 
              className="w-full h-full"
            >
              <img 
                src="/nexaris/eth.png" 
                alt="Ethereum Enclave" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. HERO MAIN TITLE & WAITLIST FORM WITH PARALLAX FADE          */}
      {/* ============================================================== */}
      <motion.div 
        style={{ y: textScrollY, opacity: textOpacity }}
        className="relative z-20 w-full max-w-5xl mx-auto px-6 text-center mt-2 sm:mt-4 pb-16 sm:pb-24 flex flex-col items-center"
      >
        
        {/* Large bold display headline strictly in two lines */}
        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.2rem] font-bold text-[#0b0f19] tracking-[-0.038em] leading-[1.05] max-w-5xl mx-auto"
        >
          <span className="block">The Future of</span>
          <span className="block whitespace-nowrap">Autonomous Defense</span>
        </motion.h1>

        {/* Nexaris-Style Waitlist Form directly below heading */}
        <motion.div 
          id="waitlist"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mt-8 w-full max-w-lg"
        >
          {!submitted ? (
            <form 
              onSubmit={handleSubmit}
              className="relative flex items-center w-full rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-xl p-1.5 sm:p-2 shadow-[0_15px_40px_rgba(0,0,0,0.06)] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full bg-transparent px-6 py-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center shrink-0 rounded-full bg-[#010320] hover:bg-[#0066ff] text-white font-sans font-semibold text-xs sm:text-sm px-7 sm:px-9 py-3.5 transition-all duration-300 shadow-sm cursor-pointer"
              >
                {loading ? 'Please wait...' : 'Join waitlist'}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 backdrop-blur-md p-4 text-center">
              <div className="text-sm font-semibold text-blue-700 flex items-center justify-center gap-2">
                <span>✓</span> Thank you for your message!
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Someone will get in touch with you soon! We will contact you at <span className="font-semibold text-slate-900">{email}</span>
              </p>
            </div>
          )}
        </motion.div>

      </motion.div>

    </section>
  );
}
