import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6">
      <motion.nav 
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-7xl items-center justify-between rounded-full border border-white/10 bg-ink/50 backdrop-blur-md px-6 py-3 transition-colors duration-300"
      >
        <Link to="/" className="text-paper hover:text-lime transition-colors">
          <span className="inline-flex items-center gap-2">
            <Logo className="h-[22px] w-auto object-contain" />
            <span className="font-display font-bold text-[1.25rem] tracking-tight">Escapement</span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 lg:flex">
          <Link to="/services" className="text-sm font-medium tracking-tight text-paper/70 transition-colors hover:text-paper">Services</Link>
          <Link to="/work" className="text-sm font-medium tracking-tight text-paper/70 transition-colors hover:text-paper">Work</Link>
          <Link to="/about" className="text-sm font-medium tracking-tight text-paper/70 transition-colors hover:text-paper">About</Link>
          <Link to="/pricing" className="text-sm font-medium tracking-tight text-paper/70 transition-colors hover:text-paper">Pricing</Link>
          <Link to="/insights" className="text-sm font-medium tracking-tight text-paper/70 transition-colors hover:text-paper">Insights</Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/contact" className="group inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-tight transition-all duration-300 bg-lime text-ink hover:brightness-95 h-10 px-6 text-sm shadow-sm">
            Book a Demo <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
          </Link>
        </div>
      </motion.nav>
    </header>
  );
};

export default Header;