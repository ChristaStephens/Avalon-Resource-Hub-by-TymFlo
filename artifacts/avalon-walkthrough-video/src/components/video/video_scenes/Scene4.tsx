import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // Title
      setTimeout(() => setPhase(2), 1500), // Add step
      setTimeout(() => setPhase(3), 3500), // Fill form
      setTimeout(() => setPhase(4), 5500), // Submit
      setTimeout(() => setPhase(5), 8000), // Remove/Restore
      setTimeout(() => setPhase(6), 10500), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-bg-light flex flex-col items-center justify-center pt-10"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="text-[3.5vw] font-display font-bold text-secondary mb-16 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
      >
        Manage Resources
      </motion.h2>

      <div className="flex flex-row items-center justify-center gap-[4vw] w-full max-w-[80vw]">
        {/* Flow Item 1: Add */}
        <FlowStep 
          active={phase >= 2} 
          title="Add" 
          icon={<PlusIcon />} 
          delay={0}
        />
        
        <Arrow active={phase >= 3} />

        {/* Flow Item 2: Fill Form */}
        <FlowStep 
          active={phase >= 3} 
          title="Fill Form" 
          icon={<FormIcon />} 
          delay={0}
        />

        <Arrow active={phase >= 4} />

        {/* Flow Item 3: Submit */}
        <FlowStep 
          active={phase >= 4} 
          title="Submit" 
          icon={<CheckIcon />} 
          delay={0}
        />
      </div>

      <motion.div 
        className="mt-20 px-[4vw] py-[2vw] bg-white rounded-2xl shadow-lg border border-primary/10 flex items-center gap-[2vw]"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 5 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <div className="w-[4vw] h-[4vw] rounded-full bg-accent/20 flex items-center justify-center text-accent">
          <RefreshIcon />
        </div>
        <div>
          <h3 className="text-[2vw] font-bold text-primary font-display">Remove & Restore</h3>
          <p className="text-[1.5vw] text-text-muted">One click management</p>
        </div>
      </motion.div>

    </motion.div>
  );
}

function FlowStep({ active, title, icon, delay }: { active: boolean, title: string, icon: any, delay: number }) {
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center p-[2vw] rounded-2xl border-2 transition-colors duration-500 w-[18vw] h-[18vw] ${active ? 'bg-primary border-primary shadow-xl' : 'bg-white border-primary/20 opacity-40'}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={active ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0.4 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className={`w-[6vw] h-[6vw] mb-4 ${active ? 'text-white' : 'text-primary/50'}`}>
        {icon}
      </div>
      <h3 className={`text-[2vw] font-bold ${active ? 'text-white' : 'text-primary/50'}`}>
        {title}
      </h3>
    </motion.div>
  );
}

function Arrow({ active }: { active: boolean }) {
  return (
    <motion.div 
      className={`h-[4px] w-[6vw] rounded-full relative overflow-hidden bg-primary/10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="absolute top-0 left-0 bottom-0 bg-accent"
        initial={{ width: '0%' }}
        animate={active ? { width: '100%' } : { width: '0%' }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const FormIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const RefreshIcon = () => <svg className="w-full h-full p-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>;
