import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { 
  intro: 8000, 
  publicView: 10000, 
  staffAccess: 8000, 
  manageResources: 12000, 
  outro: 7000 
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-bg-light">
      {/* Persistent warm texture/gradient layer */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[120px] mix-blend-normal opacity-40"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{ 
            x: ['-20%', '30%', '-10%'], 
            y: ['-20%', '-40%', '-10%'],
            scale: [1, 1.2, 0.9]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} 
        />
        <motion.div 
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-normal opacity-30 right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }}
          animate={{ 
            x: ['10%', '-20%', '5%'], 
            y: ['10%', '-30%', '-20%'] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} 
        />
      </div>

      {/* Persistent midground accent line */}
      <motion.div
        className="absolute h-[2px] bg-accent"
        animate={{
          left: ['0%', '10%', '0%', '20%', '40%'][currentScene],
          width: ['100%', '80%', '100%', '60%', '20%'][currentScene],
          top: ['0%', '10%', '0%', '20%', '50%'][currentScene],
          opacity: currentScene === 4 ? 0 : 0.8,
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="public" />}
        {currentScene === 2 && <Scene3 key="staff" />}
        {currentScene === 3 && <Scene4 key="manage" />}
        {currentScene === 4 && <Scene5 key="outro" />}
      </AnimatePresence>
    </div>
  );
}
