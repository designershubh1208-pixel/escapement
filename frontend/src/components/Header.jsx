import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

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
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/dashboard/chat" 
                className="inline-flex items-center gap-2 rounded-full font-bold tracking-tight bg-white/10 hover:bg-white/15 text-paper border border-white/10 h-10 px-4 text-xs transition-colors shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-lime text-ink flex items-center justify-center font-bold text-[10px]">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user?.name || user?.phone_number || 'Dashboard'}</span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="h-10 w-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-paper/60 border border-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="text-sm font-medium tracking-tight text-paper/80 hover:text-paper px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="group inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-tight transition-all duration-300 bg-lime text-ink hover:brightness-95 h-10 px-5 text-sm shadow-sm"
              >
                Get Started <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
              </Link>
            </div>
          )}
        </div>
      </motion.nav>
    </header>
  );
};

export default Header;