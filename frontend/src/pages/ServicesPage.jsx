import React from 'react';
import { motion } from 'framer-motion';

const ServicesPage = () => {
  return (
    <section className="min-h-[100svh] bg-ink pt-32 pb-20 relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/80 to-ink"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 w-[80vw] h-[50vh] rounded-[100%] bg-lime/15 blur-[120px]"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-20">
        <div className="max-w-4xl">
          <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-8">( SERVICES )</p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-6xl sm:text-7xl lg:text-[110px] font-bold text-paper leading-[0.85] tracking-tighter mb-8"
          >
            Full-stack financial security.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-paper/60 font-sans font-medium max-w-2xl"
          >
            Everything you need to automate your financial workflows securely, from intent parsing to mocked execution.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;
