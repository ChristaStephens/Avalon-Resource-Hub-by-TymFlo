import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // Line appears
      setTimeout(() => setPhase(2), 1000), // "Avalon Resource Hub"
      setTimeout(() => setPhase(3), 2500), // Tagline
      setTimeout(() => setPhase(4), 6000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-bg-light"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center px-12 relative z-10 w-full max-w-5xl">
        <motion.div
          className="mx-auto w-1 h-16 bg-accent mb-8"
          initial={{ scaleY: 0, originY: 1 }}
          animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        <h1 className="text-[6vw] font-bold text-secondary leading-tight font-display tracking-tight">
          {'Avalon Resource Hub'.split(' ').map((word, i) => (
            <span key={i} className="inline-block overflow-hidden mr-[2vw]">
              <motion.span
                className="inline-block"
                initial={{ y: '100%', rotateX: -45, opacity: 0 }}
                animate={phase >= 2 ? { y: '0%', rotateX: 0, opacity: 1 } : { y: '100%', rotateX: -45, opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p 
          className="text-[2.2vw] text-primary mt-8 font-body font-light"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={phase >= 3 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Supporting survivors with trusted local resources
        </motion.p>
      </div>
    </motion.div>
  );
}
