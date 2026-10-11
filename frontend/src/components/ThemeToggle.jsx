import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full border transition-all duration-300 ${
        isDark 
          ? 'bg-white/5 border-white/10 text-paper hover:bg-white/10 hover:border-lime/40' 
          : 'bg-black/5 border-black/10 text-paper hover:bg-black/10 hover:border-black/20 shadow-sm'
      } ${showLabel ? 'px-3 py-1.5 text-xs font-mono' : 'w-10 h-10'} ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative flex items-center justify-center w-5 h-5">
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute"
        >
          <Sun className="w-4 h-4 text-amber-500 stroke-[2.2]" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute"
        >
          <Moon className="w-4 h-4 text-lime stroke-[2.2]" />
        </motion.div>
      </div>

      {showLabel && (
        <span className="capitalize font-mono font-medium tracking-wide">
          {theme}
        </span>
      )}
    </motion.button>
  );
};

export default ThemeToggle;
