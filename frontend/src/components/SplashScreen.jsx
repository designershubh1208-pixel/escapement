import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentProgress = 0;
    
    // Simulate loading by increasing progress rapidly
    const interval = setInterval(() => {
      // Random jump between 2 and 15
      currentProgress += Math.floor(Math.random() * 13) + 2;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        // Wait a short moment at 100% before triggering the exit animation
        setTimeout(onComplete, 400); 
      }
      
      setProgress(currentProgress);
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-paper"
      initial={{ opacity: 1 }}
      exit={{ 
        y: "-100%", 
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid"></div>
      </div>
      
      <div className="relative z-10 text-center flex flex-col items-center justify-center overflow-hidden">
        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4"
        >
          Escapement
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-mono text-lime font-bold text-xl md:text-2xl overflow-hidden relative w-32 flex justify-center"
        >
          {/* Progress number */}
          <span className="inline-block w-[3ch] text-right">{progress}</span>%
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
