import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),   // Title
      setTimeout(() => setPhase(2), 1200),  // Add Org
      setTimeout(() => setPhase(3), 2600),  // Edit Org
      setTimeout(() => setPhase(4), 4000),  // Approve
      setTimeout(() => setPhase(5), 5400),  // Remove/Restore
      setTimeout(() => setPhase(6), 7200),  // Sub-labels fade in
      setTimeout(() => setPhase(7), 10000), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 bg-bg-light flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2
        className="text-[3.2vw] font-display font-bold text-secondary mb-[3vw] text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Staff Area — Four Tools
      </motion.h2>

      {/* 2×2 grid of staff tabs */}
      <div className="grid grid-cols-2 gap-[2vw] w-[64vw]">
        <StaffCard
          active={phase >= 2}
          title="Add Organization"
          subtitle="Create a new listing"
          icon={<PlusIcon />}
          accent={false}
        />
        <StaffCard
          active={phase >= 3}
          title="Edit Organization"
          subtitle="Update existing info"
          icon={<EditIcon />}
          accent={false}
        />
        <StaffCard
          active={phase >= 4}
          title="Approve"
          subtitle="New applications & edit requests"
          icon={<CheckBadgeIcon />}
          accent={true}
        />
        <StaffCard
          active={phase >= 5}
          title="Remove / Restore"
          subtitle="Hide or reinstate listings"
          icon={<RefreshIcon />}
          accent={false}
        />
      </div>

      {/* Approve detail strip */}
      <motion.div
        className="mt-[2.5vw] flex gap-[2vw]"
        initial={{ opacity: 0, y: 16 }}
        animate={phase >= 6 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <DetailPill label="New provider applications" />
        <DetailPill label="Provider edit requests" />
      </motion.div>
    </motion.div>
  );
}

function StaffCard({ active, title, subtitle, icon, accent }: {
  active: boolean; title: string; subtitle: string; icon: React.ReactNode; accent: boolean;
}) {
  return (
    <motion.div
      className={`flex items-center gap-[1.5vw] p-[1.8vw] rounded-2xl border-2 transition-colors duration-500
        ${active
          ? accent
            ? 'bg-accent border-accent shadow-xl'
            : 'bg-primary border-primary shadow-xl'
          : 'bg-white border-primary/15 opacity-35'}`}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={active ? { scale: 1, opacity: 1 } : { scale: 0.92, opacity: 0.35 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`w-[4.5vw] h-[4.5vw] flex-shrink-0 ${active ? 'text-white' : 'text-primary/40'}`}>
        {icon}
      </div>
      <div>
        <h3 className={`text-[1.8vw] font-bold font-display leading-tight ${active ? 'text-white' : 'text-primary/40'}`}>
          {title}
        </h3>
        <p className={`text-[1.2vw] mt-0.5 ${active ? 'text-white/70' : 'text-primary/30'}`}>
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
}

function DetailPill({ label }: { label: string }) {
  return (
    <div className="bg-accent/10 border border-accent/30 rounded-full px-[1.5vw] py-[0.5vw] flex items-center gap-[0.6vw]">
      <div className="w-[0.8vw] h-[0.8vw] rounded-full bg-accent flex-shrink-0" />
      <span className="text-[1.1vw] text-accent font-semibold">{label}</span>
    </div>
  );
}

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CheckBadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><polyline points="3 3 3 8 8 8" />
  </svg>
);
