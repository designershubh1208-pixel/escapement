import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import DeFAISentinelHero from '../components/DeFAISentinelHero';
import LottiePlayer from '../components/LottiePlayer';

// ============================================================================
// 1. VALUES / BENTO SECTION (EXACT NEXARIS .values-sc)
// ============================================================================
const ValuesSection = () => {
  return (
    <section className="relative w-full bg-white text-zinc-950 py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 text-xs font-semibold text-slate-700 shadow-sm mb-6">
            <span>Welcome to Escapement</span>
            <span className="w-4 h-4 rounded-full bg-[#0066ff] text-white flex items-center justify-center text-[10px]">✦</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.8rem] font-bold text-[#0b0f19] tracking-[-0.03em] leading-[1.08] max-w-3xl">
            Next-gen Autonomous Security
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-500 font-sans max-w-xl">
            Built to empower every financial agent with next-generation deterministic solutions
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="flex flex-col gap-6 sm:gap-8">
          
          {/* PAIR 1: Big Left (1.3fr : 0.9fr) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6 sm:gap-8">
            
            {/* Card 1 (Big Left) */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[2.2rem] border border-slate-200/80 bg-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] group"
            >
              {/* Lottie 1 illustration */}
              <div className="relative w-full h-48 sm:h-56 flex items-center justify-center mb-6">
                <LottiePlayer src="/nexaris/card1.json" className="w-full h-full max-h-52 object-contain" />
              </div>

              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0b0f19] tracking-tight mb-3">
                  Evolving Beyond Probabilistic AI
                </h3>
                <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  We address the fundamental risks of generative models in finance by replacing hallucination-prone probabilistic decisions with non-negotiable cryptographic rules.
                </p>
              </div>
            </motion.div>

            {/* Card 2 (Small Right) */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[2.2rem] border border-slate-200/80 bg-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] group"
            >
              <div>
                <p className="font-sans text-base sm:text-lg text-slate-700 leading-relaxed">
                  Decentralized rails built for speed, scalability, and integration, from algorithmic trading bots to enterprise blockchain treasuries.
                </p>
              </div>

              {/* Lottie 2 illustration */}
              <div className="relative w-full h-48 sm:h-56 flex items-center justify-center mt-6">
                <LottiePlayer src="/nexaris/card2.json" className="w-full h-full max-h-52 object-contain" />
              </div>
            </motion.div>

          </div>

          {/* PAIR 2: Big Right (0.9fr : 1.3fr) */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.3fr] gap-6 sm:gap-8">
            
            {/* Card 3 (Small Left with Join Waitlist Button) */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[2.2rem] border border-slate-200/80 bg-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] group"
            >
              <div>
                <p className="font-sans text-base sm:text-lg text-slate-700 leading-relaxed">
                  Our mission is to equip autonomous agents with cryptographic armor to operate safely across global capital rails.
                </p>
              </div>

              {/* Lottie 3 illustration with concentric ripples */}
              <div className="relative w-full h-44 flex items-center justify-center my-4">
                <LottiePlayer src="/nexaris/card3.json" className="w-full h-full max-h-44 object-contain" />
              </div>

              {/* Nexaris Blue Pill Button */}
              <div>
                <a 
                  href="#waitlist"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0066ff] hover:bg-blue-700 text-white font-sans font-semibold text-sm py-3.5 px-6 transition-all duration-300 shadow-[0_10px_25px_rgba(0,102,255,0.25)] hover:shadow-[0_15px_35px_rgba(0,102,255,0.35)]"
                >
                  Join waitlist
                </a>
              </div>
            </motion.div>

            {/* Card 4 (Big Right) */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[2.2rem] border border-slate-200/80 bg-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] group"
            >
              {/* Lottie 4 illustration with black badge */}
              <div className="relative w-full h-48 sm:h-56 flex items-center justify-center mb-6">
                <LottiePlayer src="/nexaris/card4.json" className="w-full h-full max-h-52 object-contain" />
              </div>

              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0b0f19] tracking-tight mb-3">
                  Disrupting the Status Quo
                </h3>
                <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  We replace outdated financial systems with tools that give merchants better margins, faster settlements, and greater control.
                </p>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};


// ============================================================================
// 2. SOLUTIONS SECTION (EXACT NEXARIS .solutions-sc)
// Vibrant Royal Blue Rounded Card with 3-Tab Interactive Showcase
// ============================================================================
const SolutionsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      title: "Sentinel Gateway",
      lottieSrc: "/nexaris/list1.json",
      bullets: [
        { label: "Quick setup", desc: "Get started in under 10 minutes with our non-custodial middleware platform." },
        { label: "Deterministic Intent", desc: "Translates high-level agent prompts into strictly scoped cryptographic authorizations." }
      ]
    },
    {
      id: 1,
      title: "Deterministic Policy Matrix",
      lottieSrc: "/nexaris/list2.json",
      bullets: [
        { label: "Custom policy plans", desc: "Flexible velocity limits and spend ceilings to cater to all agent operations effortlessly." },
        { label: "Multi-Sig Circuit Breakers", desc: "Automatic human-in-the-loop escalation whenever anomalous transactions are detected." }
      ]
    },
    {
      id: 2,
      title: "Cryptographic Audit Ledger",
      lottieSrc: "/nexaris/list3.json",
      bullets: [
        { label: "Zero-Knowledge trails", desc: "Easily verify complete mathematical execution provenance with zero privacy leakage." },
        { label: "Automated receipts", desc: "Managed compliance telemetry ensures your operations stay audit-ready 24/7." }
      ]
    }
  ];

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 pb-16">
      
      {/* Nexaris Full Rounded Royal Blue Container */}
      <div 
        className="relative w-full rounded-[3rem] sm:rounded-[4.5rem] bg-[#0066ff] text-white py-20 sm:py-28 px-6 sm:px-12 lg:px-20 overflow-hidden shadow-2xl"
        data-noise=""
      >
        
        {/* Subtle radial sheen on top */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle farthest-corner at 50% 0%, rgba(255, 255, 255, 0.22), transparent 45%)'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
          
          {/* Top 3D Isometric Lottie (ETH crystal over floating slider) - Significantly Enlarged */}
          <div className="w-72 sm:w-96 md:w-[28rem] h-48 sm:h-60 md:h-64 flex items-center justify-center mb-6 -mt-2">
            <LottiePlayer src="/nexaris/eth-lottie.json" className="w-full h-full object-contain scale-125 sm:scale-135" />
          </div>

          {/* Section Tag */}
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white mb-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <span>Our Architecture</span>
            <span className="w-3.5 h-3.5 flex items-center justify-center text-white text-xs">⚡</span>
          </div>

          {/* Large Section Headline */}
          <h2 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-white tracking-[-0.03em] leading-[1.14] max-w-4xl">
            Our Solution Streamlines Autonomous Transactions, Ensuring Deterministic Compliance for AI Agents.
          </h2>

          {/* 3-Column Description Block with Significantly Enlarged Floating Coin Graphic */}
          <div className="relative w-full mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-14 text-left pb-16 border-b border-white/15">
            <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed">
              DeFAI Sentinel provides no-code and SDK solutions for autonomous agent payments, boosting security and removing banking hurdles. On-chain or off-chain, we've got you covered.
            </p>

            {/* Levitating coin insertion image in center - Significantly Enlarged */}
            <div data-levitation="1" className="flex items-center justify-center shrink-0 my-6 lg:my-0 px-2">
              <img 
                src="/nexaris/description-image.png" 
                alt="Payment Terminal" 
                className="w-56 sm:w-72 md:w-84 lg:w-96 h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.4)]"
              />
            </div>

            <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed">
              Our architecture suits any agentic workflow, letting you harness autonomous treasury operations without traditional compliance bottlenecks. Step into the future of payments.
            </p>
          </div>

          {/* Interactive 3-Tab Product Showcase */}
          <div className="w-full mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
            
            {/* Left Column: 3 Clickable Tabs */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(idx)}
                    className="p-6 sm:p-7 rounded-2xl transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: isActive ? 'rgba(255, 255, 255, 0.35)' : 'transparent',
                      backdropFilter: isActive ? 'blur(16px)' : 'none',
                      WebkitBackdropFilter: isActive ? 'blur(16px)' : 'none',
                      boxShadow: isActive ? '0 12px 30px rgba(0, 0, 0, 0.12)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <h3 className={`font-display text-xl sm:text-2xl font-bold tracking-tight transition-opacity ${isActive ? 'text-white opacity-100' : 'text-white opacity-60'}`}>
                        {tab.title}
                      </h3>
                    </div>

                    <ul className="space-y-2 font-sans text-xs sm:text-sm">
                      {tab.bullets.map((b, bIdx) => (
                        <li key={bIdx} className={`leading-relaxed transition-opacity ${isActive ? 'text-white opacity-90' : 'text-white opacity-45'}`}>
                          <strong className={isActive ? 'text-white font-semibold' : 'text-white font-medium'}>{b.label}:</strong> {b.desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Dynamic Lottie Device Screen */}
            <div className="lg:col-span-7 flex justify-center">
              <div 
                className="relative w-full max-w-md aspect-[42/46] rounded-3xl p-8 flex items-center justify-center overflow-hidden shadow-2xl"
                style={{
                  backgroundColor: '#010320',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <LottiePlayer 
                      src={tabs[activeTab].lottieSrc} 
                      className="w-full h-full object-contain" 
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};


// ============================================================================
// 3. FOOTER SECTION (EXACT NEXARIS .footer-sc)
// Continuing Royal Blue background with 3D levitating coins
// ============================================================================
const FooterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const footerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  const coin1Y = useTransform(scrollYProgress, [0, 1], [60, -40]);
  const coin2Y = useTransform(scrollYProgress, [0, 1], [80, -50]);
  const coin1Rotate = useTransform(scrollYProgress, [0, 1], [-8, 6]);
  const coin2Rotate = useTransform(scrollYProgress, [0, 1], [6, -8]);

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
    <footer ref={footerRef} className="relative w-full bg-[#0066ff] text-white pt-24 pb-12 overflow-hidden" data-noise="">
      
      {/* Floating 3D Coins on Left and Right with Parallax Animation */}
      <motion.div 
        style={{ y: coin1Y, rotate: coin1Rotate }}
        data-levitation="1" 
        className="absolute bottom-16 -left-12 sm:left-4 lg:left-12 pointer-events-none select-none hidden sm:block"
      >
        <img 
          src="/nexaris/footer-coin-1.png" 
          alt="Floating Coin Left" 
          className="w-44 sm:w-56 lg:w-72 h-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      <motion.div 
        style={{ y: coin2Y, rotate: coin2Rotate }}
        data-levitation="2" 
        className="absolute bottom-16 -right-12 sm:right-4 lg:right-12 pointer-events-none select-none hidden sm:block"
      >
        <img 
          src="/nexaris/footer-coin-2.png" 
          alt="Floating Coin Right" 
          className="w-44 sm:w-56 lg:w-72 h-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Center Glowing Logo Icon with Escapement Brand Mark */}
        <div className="mb-8">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg p-2.5 transition-transform hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.32)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <img 
              src="/escapement-logo-footer.png" 
              alt="Escapement" 
              className="w-10 h-auto object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" 
            />
          </div>
        </div>

        {/* Large Footer Headline */}
        <h2 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-[-0.03em] leading-[1.08] max-w-2xl">
          Unlock the Future of Autonomous Finance
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-white/80 font-sans max-w-md">
          Join the waitlist to unlock next-gen autonomous agent security with Escapement.
        </p>

        {/* Waitlist Email Form */}
        <div className="mt-8 w-full max-w-md">
          {!submitted ? (
            <form 
              onSubmit={handleSubmit}
              className="relative flex items-center w-full rounded-full bg-white p-1.5 shadow-2xl"
            >
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full bg-transparent px-5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center shrink-0 rounded-full bg-[#010320] hover:bg-slate-900 text-white font-sans font-semibold text-sm px-6 sm:px-7 py-3 transition-all duration-300 shadow-sm cursor-pointer"
              >
                {loading ? 'Please wait...' : 'Join waitlist'}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md p-4 text-center">
              <div className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                <span>✓</span> Thank you for your interest!
              </div>
              <p className="mt-1 text-xs text-white/80">
                Someone will get in touch with you soon! We will contact you at <span className="font-semibold text-white">{email}</span>
              </p>
            </div>
          )}
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="mt-24 pt-8 w-full border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/70 font-sans">
          <div>
            © 2026 Escapement™. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Twitter / X
            </a>
            <a href="https://telegram.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Telegram
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>

      </div>

    </footer>
  );
};


// ============================================================================
// MAIN PAGE EXPORT
// ============================================================================
export default function LandingPage() {
  return (
    <div className="w-full bg-white font-sans selection:bg-[#0defd1] selection:text-[#010320]">
      {/* 1. Exact Nexaris Hero with Royal Blue Gradient & 3D Coins */}
      <DeFAISentinelHero />

      {/* 2. Exact Nexaris Bento Grid with 4 Asymmetric Cards & Lotties */}
      <ValuesSection />

      {/* 3. Exact Nexaris Solutions Section with Royal Blue Card & 3D Tabs */}
      <SolutionsSection />

      {/* 4. Exact Nexaris Footer with 3D Levitating Coins */}
      <FooterSection />
    </div>
  );
}