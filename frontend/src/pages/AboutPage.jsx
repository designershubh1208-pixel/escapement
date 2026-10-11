import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="bg-ink min-h-screen">
      <section className="pt-40 pb-20 relative border-b border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] rounded-[100%] bg-lime/10 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-8">( ABOUT US )</p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl sm:text-7xl lg:text-[110px] font-bold text-paper leading-[0.85] tracking-tighter mb-8"
            >
              Building digital solutions that drive growth.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-paper/60 font-sans font-medium max-w-2xl"
            >
              Escapement helps businesses build secure, AI-powered financial systems that create measurable business growth and efficiency.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-paper mb-6">We believe trust should be mathematically verified.</h2>
              <p className="text-paper/60 text-lg leading-relaxed mb-6">
                The era of assuming an AI agent will always do the right thing is over. We build deterministic, on-chain policy engines that act as an unbreakable firewall between LLM reasoning and actual financial execution.
              </p>
              <p className="text-paper/60 text-lg leading-relaxed">
                Our team consists of cryptographic engineers, AI researchers, and financial security experts dedicated to making autonomous money safe.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-lime/30 transition-colors">
                <div className="text-4xl font-display font-bold text-lime mb-2">100%</div>
                <div className="text-sm font-mono text-paper/40 uppercase tracking-wide">Deterministic Execution</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-lime/30 transition-colors">
                <div className="text-4xl font-display font-bold text-lime mb-2">0</div>
                <div className="text-sm font-mono text-paper/40 uppercase tracking-wide">Security Breaches</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-lime/30 transition-colors">
                <div className="text-4xl font-display font-bold text-lime mb-2">~12ms</div>
                <div className="text-sm font-mono text-paper/40 uppercase tracking-wide">Avg Policy Latency</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-lime/30 transition-colors">
                <div className="text-4xl font-display font-bold text-lime mb-2">24/7</div>
                <div className="text-sm font-mono text-paper/40 uppercase tracking-wide">Autonomous Operation</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
