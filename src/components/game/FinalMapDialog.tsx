import { motion, AnimatePresence } from 'framer-motion';
import PixelIcon from './PixelIcon';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const FINAL_MAP_KEY = 'wadapav-final-map-seen';
export const hasSeenFinalMap = () => localStorage.getItem(FINAL_MAP_KEY) === '1';
export const markFinalMapSeen = () => localStorage.setItem(FINAL_MAP_KEY, '1');

export default function FinalMapDialog({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-card border-2 border-primary/40 pixel-border-primary p-5 max-w-sm w-full space-y-4"
          >
            <div className="text-center space-y-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="inline-block"
              >
                <PixelIcon id="loc5" size={48} />
              </motion.div>
              <h3 className="font-display font-bold text-base text-foreground">
                🎉 YOU MADE IT!
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Mumbai Airport — the final destination... <span className="text-foreground font-semibold">for now</span>.
              </p>
            </div>

            <div className="bg-muted/50 border border-border p-3 space-y-2">
              <p className="font-body text-sm text-foreground/80 leading-relaxed">
                Who knows what's in store for the future? Maybe there's an update with new locations, maybe there's a totally new game dropping... 👀
              </p>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">
                Stay connected so you don't miss out!
              </p>
            </div>

            <div className="space-y-2">
              <a
                href="https://linkedin.com/in/aapatre"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[hsl(210,80%,45%)] text-[hsl(0,0%,100%)] font-display font-bold text-[9px] pixel-border tracking-wider hover:bg-[hsl(210,80%,40%)] transition-colors"
              >
                💼 CONNECT ON LINKEDIN
              </a>
              <a
                href="https://linktr.ee/aapatre"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-secondary text-secondary-foreground font-display font-bold text-[9px] pixel-border tracking-wider hover:bg-secondary/80 transition-colors"
              >
                🔗 ALL MY SOCIALS
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-2 border-2 border-border text-muted-foreground font-display text-[8px] pixel-border hover:bg-muted/50 transition-colors"
            >
              KEEP GRINDING 💪
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
