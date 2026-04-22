import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import screenshot2 from "@assets/screenshots/guide-staff-login.jpg";

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 6500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-secondary"
      initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-row items-center justify-center w-full max-w-[85vw] gap-[5vw]">
        
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[4vw] font-display font-bold text-white leading-tight">
            Staff Access
          </h2>
          <motion.p 
            className="text-[1.8vw] text-white/80 mt-4 font-body"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            Staff log in securely to manage the directory
          </motion.p>
        </motion.div>

        <motion.div 
          className="flex-1 relative w-[40vw] h-[45vw] max-h-[70vh] rounded-xl overflow-hidden shadow-2xl border border-white/10"
          initial={{ x: 100, opacity: 0, rotateY: 15 }}
          animate={phase >= 1 ? { x: 0, opacity: 1, rotateY: 0 } : {}}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          style={{ perspective: 1000 }}
        >
          <img src={screenshot2} alt="Staff Login" className="w-full h-full object-cover object-left-top" />
          
          {phase >= 2 && (
            <motion.div
              className="absolute inset-0 border-[6px] border-accent rounded-xl"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
