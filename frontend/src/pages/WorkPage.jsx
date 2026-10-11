import React from 'react';
import { motion } from 'framer-motion';

const cases = [
  { id: '01', title: 'Automated Global Payroll', client: 'Nexus Corp', desc: 'Deployed an autonomous agent to manage international crypto payouts with zero auth errors.' },
  { id: '02', title: 'DeFi Yield Rebalancing', client: 'Apex Capital', desc: 'Created a policy-bound AI that dynamically rebalances yield portfolios while strictly adhering to hardcoded risk limits.' },
  { id: '03', title: 'B2B Invoice Settlement', client: 'Velocity Trade', desc: 'Integrated an intent-parser that reads natural language emails and executes B2B settlements securely.' },
  { id: '04', title: 'Subscription Terminator', client: 'FinGuard App', desc: 'Built a consumer-facing agent capable of terminating ghost subscriptions by freezing associated virtual cards.' }
];

const WorkPage = () => {
  return (
    <div className="bg-ink min-h-screen">
      <section className="pt-40 pb-20 relative border-b border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] rounded-[100%] bg-lime/10 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-8">( SELECTED WORK )</p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl sm:text-7xl lg:text-[110px] font-bold text-paper leading-[0.85] tracking-tighter mb-8"
            >
              Results we're proud to put our name on.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-paper/60 font-sans font-medium max-w-2xl"
            >
              A look at how we've helped businesses turn digital finance into measurable, secure, compounding growth.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {cases.map((c, i) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] bg-white/5 rounded-2xl mb-8 overflow-hidden relative border border-white/10 group-hover:border-lime/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white/5 font-display text-[15rem] font-bold group-hover:scale-110 group-hover:text-white/10 transition-all duration-700">
                  {c.id}
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display text-3xl font-bold text-paper group-hover:text-lime transition-colors">{c.title}</h3>
                <span className="font-mono text-sm text-paper/40">{c.client}</span>
              </div>
              <p className="text-paper/60 font-medium leading-relaxed max-w-md">
                {c.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      
      <section className="py-32 bg-lime text-ink text-center px-6">
        <p className="font-mono text-xs font-bold tracking-widest uppercase mb-8">( Let's Build )</p>
        <h2 className="font-display text-5xl sm:text-7xl font-bold leading-[0.9] tracking-tighter mb-12">
          Ready to automate<br/>your financial ops?
        </h2>
        <button className="inline-flex items-center justify-center rounded-full font-bold bg-ink text-lime hover:bg-ink/90 transition-colors h-14 px-8 text-sm">
          Start a project ↗
        </button>
      </section>
    </div>
  );
};

export default WorkPage;
