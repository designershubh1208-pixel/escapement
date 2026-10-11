import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-ink border-t border-white/5 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="col-span-1 md:col-span-1">
            <h4 className="font-display font-bold text-xl text-paper mb-4 flex items-center gap-2">
              Escapement
            </h4>
            <p className="text-paper/50 text-sm leading-relaxed pr-4">
              Secure autonomous financial agent. Deterministic policy enforcement for AI-driven payments.
            </p>
          </div>
          
          <div>
            <h4 className="text-paper/40 font-mono text-xs tracking-widest uppercase mb-6">Pages</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/services" className="text-paper hover:text-lime transition-colors">Services</Link></li>
              <li><Link to="/work" className="text-paper hover:text-lime transition-colors">Work</Link></li>
              <li><Link to="/about" className="text-paper hover:text-lime transition-colors">About</Link></li>
              <li><Link to="/pricing" className="text-paper hover:text-lime transition-colors">Pricing</Link></li>
              <li><Link to="/insights" className="text-paper hover:text-lime transition-colors">Insights</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-paper/40 font-mono text-xs tracking-widest uppercase mb-6">Features</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><span className="text-paper/80">Policy Engine</span></li>
              <li><span className="text-paper/80">Intent Parsing</span></li>
              <li><span className="text-paper/80">Approval Workflow</span></li>
              <li><span className="text-paper/80">Mock Execution</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-paper/40 font-mono text-xs tracking-widest uppercase mb-6">Get in touch</h4>
            <ul className="space-y-4 text-sm font-medium text-paper/80">
              <li className="flex items-center gap-3">
                <span className="text-lime">✉</span> hello@escapement.finance
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lime">⚲</span> San Francisco, CA
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-4 text-paper/40 text-xs font-mono">
          <p>© 2026 Escapement. All rights reserved.</p>
          <p>Prototype - Not for production financial transactions</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;