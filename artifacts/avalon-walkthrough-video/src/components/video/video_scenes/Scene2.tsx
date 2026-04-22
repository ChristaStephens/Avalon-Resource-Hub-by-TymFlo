import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import screenshot1 from "@assets/screenshots/guide-resources-loaded.jpg";

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),  // Image enters
      setTimeout(() => setPhase(2), 2000), // Callout 1: Search
      setTimeout(() => setPhase(3), 4000), // Callout 2: Filters
      setTimeout(() => setPhase(4), 6000), // Callout 3: Cards
      setTimeout(() => setPhase(5), 8500), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-bg-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute top-[10%] left-[10%] z-20">
        <motion.div
          className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl border border-primary/20 shadow-xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-[2.5vw] font-display font-bold text-secondary">Public View</h2>
          <p className="text-[1.2vw] text-primary">Clients search and filter — no login needed</p>
        </motion.div>
      </div>

      <motion.div 
        className="relative w-[70vw] h-[40vw] rounded-xl overflow-hidden shadow-2xl border border-black/5 mt-[5%]"
        initial={{ scale: 0.8, y: 50, opacity: 0, rotateX: 10 }}
        animate={phase >= 1 ? { scale: 1, y: 0, opacity: 1, rotateX: 0 } : {}}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <img src={screenshot1} alt="Resource Hub UI" className="w-full h-full object-cover" />
        
        {/* Callout: Search Bar */}
        <motion.div 
          className="absolute border-4 border-accent rounded-lg"
          style={{ top: '15%', left: '20%', width: '60%', height: '10%' }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Callout: Filters */}
        <motion.div 
          className="absolute border-4 border-primary rounded-lg"
          style={{ top: '30%', left: '5%', width: '20%', height: '60%' }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Callout: Resource Cards */}
        <motion.div 
          className="absolute border-4 border-secondary rounded-lg bg-secondary/10 mix-blend-multiply"
          style={{ top: '30%', left: '30%', width: '65%', height: '60%' }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </motion.div>
  );
}
