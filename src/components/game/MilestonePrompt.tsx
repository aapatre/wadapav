import { motion } from 'framer-motion';
import PixelIcon from './PixelIcon';

const MILESTONE_KEY = 'wadapav-50k-milestone-seen';

export function hasSeenMilestone(): boolean {
  return localStorage.getItem(MILESTONE_KEY) === 'true';
}

export function markMilestoneSeen() {
  localStorage.setItem(MILESTONE_KEY, 'true');
}

interface Props {
  onComplete: () => void;
}

export default function MilestonePrompt({ onComplete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/85 backdrop-blur-sm flex items-center justify-center p-6"
      style={{ zIndex: 9998 }}
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-card border-2 border-primary/60 p-5 max-w-xs text-center space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <PixelIcon id="party" size={32} className="mx-auto" />
        <h2 className="font-display text-[9px] text-primary tracking-wider">₹50K TYCOON!</h2>
        <p className="font-body text-[11px] text-foreground/80 leading-relaxed">
          Whoa, you're printing rupees faster than RBI!
        </p>
        <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
          If you're enjoying the game, install it on your home screen for the full experience!
        </p>
        <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
          And if you think this dev is as good at coding as you are at making wada pav...
        </p>

        {/* Hire me — big and obvious */}
        <a
          href="https://antariksh.me"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-primary text-primary-foreground font-display text-[9px] px-4 py-2.5 hover:bg-primary/80 transition-colors tracking-wider animate-pulse flex items-center justify-center gap-1"
        >
          <PixelIcon id="rocket" size={12} /> HIRE ME — I ALSO MAKE REAL APPS <PixelIcon id="rocket" size={12} />
        </a>
        <p className="font-body text-[8px] text-muted-foreground italic">
          (I promise I build more than clicker games... usually)
        </p>

        <button
          onClick={onComplete}
          className="bg-muted text-muted-foreground font-display text-[8px] px-4 py-1.5 hover:bg-muted/80 transition-colors tracking-wider"
        >
          NAH, I'LL KEEP FRYING
        </button>
      </motion.div>
    </motion.div>
  );
}
