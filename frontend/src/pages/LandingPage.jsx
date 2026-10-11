import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const wordVariants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 0.5, ease: "easeOut" } }
};

const StoryScrollSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const t1Opacity = useTransform(scrollYProgress, [0, 0.20, 0.23, 1], [1, 1, 0, 0]);
  const t1Y = useTransform(scrollYProgress, [0, 0.20, 0.23, 1], [0, 0, -50, -50]);

  const t2Opacity = useTransform(scrollYProgress, [0, 0.23, 0.25, 0.45, 0.48, 1], [0, 0, 1, 1, 0, 0]);
  const t2Y = useTransform(scrollYProgress, [0, 0.23, 0.25, 0.45, 0.48, 1], [50, 50, 0, 0, -50, -50]);

  const t3Opacity = useTransform(scrollYProgress, [0, 0.48, 0.50, 0.70, 0.73, 1], [0, 0, 1, 1, 0, 0]);
  const t3Y = useTransform(scrollYProgress, [0, 0.48, 0.50, 0.70, 0.73, 1], [50, 50, 0, 0, -50, -50]);

  const t4Opacity = useTransform(scrollYProgress, [0, 0.73, 0.75, 1], [0, 0, 1, 1]);
  const t4Y = useTransform(scrollYProgress, [0, 0.73, 0.75, 1], [50, 50, 0, 0]);

  return (
    <section ref={containerRef} className="h-[400vh] relative bg-ink border-t border-white/5">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden py-32">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-8">( The Mission )</p>
          
          <div className="relative h-[45vh] sm:h-[40vh] w-full">
            <motion.h2 
              style={{ opacity: t1Opacity, y: t1Y }}
              className="absolute top-0 left-0 w-full font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-paper leading-[1.1] tracking-tight max-w-4xl"
            >
              We build the secure, autonomous AI agents that handle financial tasks with deterministic policy enforcement.
            </motion.h2>
            
            <motion.h2 
              style={{ opacity: t2Opacity, y: t2Y }}
              className="absolute top-0 left-0 w-full font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-paper leading-[1.1] tracking-tight max-w-4xl"
            >
              Every transaction is evaluated in real-time. Trust is no longer assumed, it is mathematically verified.
            </motion.h2>
            
            <motion.h2 
              style={{ opacity: t3Opacity, y: t3Y }}
              className="absolute top-0 left-0 w-full font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-paper leading-[1.1] tracking-tight max-w-4xl"
            >
              From complex corporate payments to automated invoices, Escapement scales your operations securely.
            </motion.h2>
            
            <motion.h2 
              style={{ opacity: t4Opacity, y: t4Y }}
              className="absolute top-0 left-0 w-full font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-paper leading-[1.1] tracking-tight max-w-4xl"
            >
              AI provides the intelligent intent. Our engine provides the unyielding boundaries. The perfect synergy.
            </motion.h2>
          </div>
          
          <div className="mt-8 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 border-t border-white/10 pt-12">
            <div>
              <div className="font-display text-5xl sm:text-7xl font-bold text-lime">100<span className="text-4xl">%</span></div>
              <p className="mt-4 text-sm font-mono text-paper/40 uppercase tracking-wider">Policy Enforced</p>
            </div>
            <div>
              <div className="font-display text-5xl sm:text-7xl font-bold text-lime">0</div>
              <p className="mt-4 text-sm font-mono text-paper/40 uppercase tracking-wider">Auth Errors</p>
            </div>
            <div>
              <div className="font-display text-5xl sm:text-7xl font-bold text-lime">~12<span className="text-4xl">ms</span></div>
              <p className="mt-4 text-sm font-mono text-paper/40 uppercase tracking-wider">Avg Latency</p>
            </div>
            <div>
              <div className="font-display text-5xl sm:text-7xl font-bold text-lime">24/7</div>
              <p className="mt-4 text-sm font-mono text-paper/40 uppercase tracking-wider">Availability</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  return (
    <div className="bg-ink min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/80 to-ink"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 w-[80vw] h-[50vh] rounded-[100%] bg-lime/15 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="size-2 rounded-full bg-lime shadow-[0_0_12px_2px] shadow-lime/60"></span>
            <span className="font-mono text-xs font-bold tracking-widest text-paper/60 uppercase">AUTONOMOUS FINANCIAL AGENT</span>
          </motion.div>
          
          <div className="relative">
            <h1 className="font-display text-[18vw] sm:text-[15vw] lg:text-[180px] font-bold text-paper leading-[0.8] tracking-tighter">
              <span className="block overflow-hidden pb-4">
                <motion.span variants={wordVariants} initial="hidden" animate="visible" className="inline-block">Secure</motion.span>
              </span>
              <span className="block overflow-hidden pb-4">
                <motion.span variants={wordVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="inline-block">autonomous</motion.span>
              </span>
              <span className="block text-lime overflow-hidden pb-4">
                <motion.span variants={wordVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="inline-block">financial</motion.span>
              </span>
              <span className="block text-lime overflow-hidden pb-4">
                <motion.span variants={wordVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="inline-block">agent</motion.span>
              </span>
            </h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 lg:mt-0 lg:absolute lg:right-0 lg:bottom-4 lg:max-w-lg xl:max-w-xl"
            >
              <p className="text-lg sm:text-xl text-paper/70 font-sans font-medium leading-relaxed mb-8">
                Let an AI act on your behalf while enforcing deterministic<br className="hidden lg:block" />
                financial permissions before any payment is executed.<br className="hidden lg:block" />
                AI decides, policy protects.
              </p>
              
              <Link to="/chat" className="inline-flex items-center justify-center gap-2 rounded-full font-bold bg-lime text-ink hover:bg-lime/90 transition-colors h-14 px-8 text-sm">
                Chat ↗
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* StoryTelling Scroll Section replacing the static 'What we do' section */}
      <StoryScrollSection />

      {/* Features Section */}
      <section className="py-32 relative bg-ink">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 mb-20 flex flex-col md:flex-row justify-between md:items-end gap-8">
          <div>
            <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-6">( Features )</p>
            <h2 className="font-display text-5xl sm:text-7xl font-bold text-paper leading-[0.9] tracking-tighter">
              Full-stack<br/>financial security
            </h2>
          </div>
          <Link to="/policies" className="inline-flex items-center justify-center rounded-full border border-white/20 hover:bg-white/5 transition-colors h-14 px-8 text-sm font-medium text-paper">
            View policies
          </Link>
        </div>
        
        <div className="border-t border-white/10">
          {[
            { id: '01', title: 'Intent Parsing', desc: 'Natural language translated into structured, validated transactional intent.' },
            { id: '02', title: 'Deterministic Policy', desc: 'Hardcoded limits, merchant allowlists, and boundaries the AI cannot bypass.' },
            { id: '03', title: 'Approval Workflow', desc: 'Human-in-the-loop review for transactions exceeding predefined thresholds.' },
            { id: '04', title: 'Mock Execution', desc: 'Safe, simulated execution environment for testing agent actions.' }
          ].map((feature) => (
            <div key={feature.id} className="group flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-6 lg:px-8 py-10 sm:py-12 border-b border-white/10 hover:bg-paper hover:text-ink transition-colors duration-500 cursor-pointer">
              <div className="flex items-baseline gap-6 sm:gap-12">
                <span className="font-mono text-sm text-paper/40 group-hover:text-ink/40 transition-colors">{feature.id}</span>
                <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-paper group-hover:text-ink transition-colors">{feature.title}</h3>
              </div>
              <div className="flex items-center gap-8 lg:w-1/3 justify-between">
                <p className="text-sm font-medium text-paper/60 group-hover:text-ink/70 transition-colors max-w-xs">{feature.desc}</p>
                <span className="text-paper group-hover:text-ink transform group-hover:rotate-45 transition-transform duration-500 text-2xl">↗</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Approach Section */}
      <section className="py-32 bg-paper text-ink">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-20">
          <div className="lg:sticky lg:top-32 self-start">
            <p className="font-mono text-xs font-bold tracking-widest text-ink/40 uppercase mb-6">( The approach )</p>
            <h2 className="font-display text-6xl sm:text-8xl font-bold leading-[0.9] tracking-tighter mb-8">
              How we<br/>drive security
            </h2>
            <p className="text-lg text-ink/60 font-medium max-w-sm mb-12">
              A proven pipeline that separates AI reasoning from actual payment authorization.
            </p>
            <Link to="/audit" className="inline-flex items-center justify-center gap-2 rounded-full font-bold bg-lime text-ink hover:brightness-95 transition-all h-14 px-8 text-sm">
              View audit logs ↗
            </Link>
          </div>
          
          <div className="flex flex-col gap-16 pt-12">
            {[
              { id: '01', title: 'User Request', desc: 'We start with natural language. You tell the agent what to do, just like a human assistant.' },
              { id: '02', title: 'AI Reasoning', desc: 'The LLM interprets the request and formats it into a standardized JSON payload. It does not execute the transaction.' },
              { id: '03', title: 'Policy Enforcer', desc: 'Deterministic code intercepts the payload, comparing amount, merchant, and context against your strict limits.' },
              { id: '04', title: 'Secure Execution', desc: 'Only if the policy passes (or human approves) does the system proceed to simulate the payment.' }
            ].map((step) => (
              <div key={step.id}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-mono text-sm text-ink/30 font-bold">{step.id}</span>
                  <h3 className="font-display text-3xl font-bold tracking-tight">{step.title}</h3>
                </div>
                <p className="text-ink/60 font-medium pl-10 text-lg leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-40 bg-ink flex items-center justify-center text-center px-6">
        <div className="max-w-5xl">
          <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-12">( What users say )</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-paper leading-[1.1] tracking-tight mb-12">
            "Escapement didn't just give us an AI agent<br className="hidden sm:block"/>— they built the secure engine that<br className="hidden sm:block"/>runs our automated finances."
          </h2>
          <div className="font-sans">
            <p className="text-paper font-bold">Jane Doe</p>
            <p className="text-paper/40 text-sm">CTO, FutureBank</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-lime text-ink pt-32 relative overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 pb-32">
          <p className="font-mono text-xs font-bold tracking-widest uppercase mb-8">( Start the conversation )</p>
          <h2 className="font-display text-[12vw] sm:text-[10vw] lg:text-[120px] font-bold leading-[0.85] tracking-tighter mb-12 max-w-4xl">
            Let's secure your<br/>digital finance.
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-12 sm:gap-24">
            <p className="text-xl font-medium max-w-sm">
              Try the interactive demo. We'll show you exactly how deterministic policy protects AI.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/chat" className="inline-flex items-center justify-center gap-2 rounded-full font-bold bg-ink text-lime hover:bg-ink/90 transition-colors h-14 px-8 text-sm">
                Try Demo ↗
              </Link>
              <Link to="/policies" className="inline-flex items-center justify-center rounded-full font-bold border border-ink/20 hover:bg-ink/5 transition-colors h-14 px-8 text-sm">
                View policies
              </Link>
            </div>
          </div>
        </div>
        
        {/* Marquee */}
        <div className="bg-ink border-t border-b border-white/10 py-5 overflow-hidden">
          <div className="flex font-display text-xl font-bold uppercase tracking-wide text-paper/40 whitespace-nowrap">
            <div className="flex animate-marquee gap-12 pr-12">
              <span className="flex items-center gap-12">Policy Engine <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">AI Parsing <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">Approval Flow <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">Mock Execution <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">Audit Logs <span className="text-lime">✦</span></span>
            </div>
            <div className="flex animate-marquee gap-12 pr-12" aria-hidden="true">
              <span className="flex items-center gap-12">Policy Engine <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">AI Parsing <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">Approval Flow <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">Mock Execution <span className="text-lime">✦</span></span>
              <span className="flex items-center gap-12">Audit Logs <span className="text-lime">✦</span></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;