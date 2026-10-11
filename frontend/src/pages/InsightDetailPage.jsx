import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const InsightDetailPage = () => {
  const location = useLocation();
  const article = location.state?.article;

  if (!article) {
    return <Navigate to="/insights" replace />;
  }

  return (
    <div className="bg-ink min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link to="/insights" className="inline-flex items-center gap-2 text-paper/60 hover:text-lime transition-colors mb-12 font-medium">
          <span>←</span> Back to Insights
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-xs font-bold tracking-widest text-lime bg-lime/10 px-3 py-1 rounded-full">{article.tag}</span>
            <span className="font-mono text-xs text-paper/40">{article.date}</span>
            <span className="font-mono text-xs text-paper/40">• {article.readTime}</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-paper leading-[1.1] tracking-tight mb-8">
            {article.title}
          </h1>
          
          <p className="text-xl text-paper/80 font-medium leading-relaxed mb-12">
            {article.desc}
          </p>
          
          <div className="prose prose-invert prose-lg max-w-none text-paper/70">
            <p className="mb-6">
              This is a full article view. In a complete production application, this page would fetch the full Markdown or rich-text content from a CMS (like Sanity, Strapi, or Contentful) or a database based on the article ID.
            </p>
            <p className="mb-6">
              The Escapement platform is built on modern Web technologies (React, Tailwind) combined with an incredibly fast backend (Python, FastAPI). By utilizing an intelligent routing system, we ensure that every interaction feels completely seamless and instantaneous.
            </p>
            <h2 className="text-2xl font-display font-bold text-paper mt-12 mb-6">The Future of Financial Automation</h2>
            <p className="mb-6">
              As AI models become more capable, the primary bottleneck transitions from reasoning capability to execution safety. Deterministic policy engines act as the mathematical firewall, ensuring that AI-driven intent can be translated into on-chain action without exposing users to unbound risk.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InsightDetailPage;
