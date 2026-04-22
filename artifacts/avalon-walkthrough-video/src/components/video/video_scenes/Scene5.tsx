import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-secondary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="w-[12vw] h-[12vw] rounded-full border-4 border-accent mb-8 flex items-center justify-center relative overflow-hidden"
        initial={{ scale: 0, rotate: -90 }}
        animate={phase >= 1 ? { scale: 1, rotate: 0 } : {}}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <motion.div 
          className="absolute inset-0 bg-accent/20 mix-blend-overlay"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        {/* Placeholder logo shape */}
        <svg viewBox="0 0 24 24" className="w-[6vw] h-[6vw] text-white" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      </motion.div>

      <motion.h2 
        className="text-[4vw] font-display font-bold text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        avalonhealing.org
      </motion.h2>

      <motion.p 
        className="text-[1.5vw] text-white/60 font-body tracking-wider uppercase"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
      >
        Empowered by TymFlo
      </motion.p>
    </motion.div>
  );
}
