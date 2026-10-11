import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const articles = [
  { 
    id: 'architecture',
    tag: 'ARCHITECTURE', date: 'Oct 12, 2026', 
    title: 'Building the Escapement Backend: FastAPI & Nemotron', 
    desc: 'An inside look at how we combined Python, FastAPI, and Nvidia\'s Nemotron LLM to create an incredibly fast intent-parsing engine for autonomous financial tasks.',
    readTime: '6 min read' 
  },
  { 
    id: 'escapement-policy',
    tag: 'ESCAPEMENT', date: 'Sep 28, 2026', 
    title: 'Engineering a Deterministic Policy Engine', 
    desc: 'How we built a hardcoded interception layer that evaluates AI-generated transaction requests against strict user allowances before they ever reach the blockchain.',
    readTime: '8 min read' 
  },
  { 
    id: 'ui-ux',
    tag: 'UI/UX', date: 'Sep 15, 2026', 
    title: 'Designing a Premium Autonomous Interface', 
    desc: 'Our approach to using React, Tailwind CSS, and Framer Motion to build a high-performance, dark-mode-first dashboard that feels instantaneous.',
    readTime: '5 min read' 
  },
  { 
    id: 'integration',
    tag: 'INTEGRATION', date: 'Aug 30, 2026', 
    title: 'Persistent Chat History & Session Management', 
    desc: 'The technical breakdown of our SQLite-backed session system, allowing the AI to perfectly maintain context across different financial workflows.',
    readTime: '4 min read' 
  }
];

const InsightsPage = () => {
  return (
    <div className="bg-ink min-h-screen">
      <section className="pt-40 pb-20 relative border-b border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] rounded-[100%] bg-lime/10 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-8">( INSIGHTS )</p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl sm:text-7xl lg:text-[110px] font-bold text-paper leading-[0.85] tracking-tighter mb-8"
            >
              Ideas that move businesses forward.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-paper/60 font-sans font-medium max-w-2xl"
            >
              Practical thinking on financial automation, security, and growth — no fluff, just what's actually working.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article, i) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  to={`/insights/${article.id}`} 
                  state={{ article }}
                  className="group flex flex-col border border-white/10 rounded-2xl p-8 hover:bg-white/5 hover:border-lime/30 transition-all duration-300 h-full block"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-mono text-xs font-bold tracking-widest text-lime bg-lime/10 px-3 py-1 rounded-full">{article.tag}</span>
                    <span className="font-mono text-xs text-paper/40">{article.date}</span>
                  </div>
                  <h3 className="font-display text-3xl font-bold text-paper mb-4 group-hover:text-lime transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-paper/60 font-medium leading-relaxed flex-1">
                    {article.desc}
                  </p>
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                    <span className="text-sm font-medium text-paper/60">{article.readTime}</span>
                    <span className="text-lime transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default InsightsPage;
