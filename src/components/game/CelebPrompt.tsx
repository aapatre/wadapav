import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/hooks/useGameState';
import starIcon from '@/assets/icons/star.png';

const STORAGE_KEY = 'wadapav-celeb-prompt';
const LINKEDIN_URL = 'https://www.linkedin.com/posts/aapatre_productmanagement-uxdesign-gamedev-activity-7437097451259478018-n64e';
const REWARD = 5000;
const TRIGGER_AMOUNT = 2500;

interface Props {
  currency: number;
  onAccept: (reward: number) => void;
}

export default function CelebPrompt({ currency, onAccept }: Props) {
  const [show, setShow] = useState(false);
  const triggeredRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggeredRef.current) return;
    const alreadyShown = localStorage.getItem(STORAGE_KEY);
    if (alreadyShown) { triggeredRef.current = true; return; }

    if (currency >= TRIGGER_AMOUNT && !timerRef.current) {
      triggeredRef.current = true;
      timerRef.current = window.setTimeout(() => {
        setShow(true);
      }, 2000 + Math.random() * 3000);
    }
  }, [currency]);

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleLike = () => {
    window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer');
    localStorage.setItem(STORAGE_KEY, 'true');
    onAccept(REWARD);
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-card border-2 border-accent p-4 max-w-xs w-full text-center"
          >
            <motion.img
              src={starIcon}
              alt="Celebrity"
              className="w-12 h-12 mx-auto mb-3 [image-rendering:pixelated]"
              draggable={false}
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <h2 className="font-display text-base text-accent mb-2">⭐ CELEBRITY VISIT! ⭐</h2>

            <p className="text-sm text-foreground/80 mb-1">
              <span className="font-bold text-accent">Babulal Chimanwala</span>, a self-proclaimed famous Bollywood celeb, just walked up to your cart!
            </p>
            <p className="text-sm text-foreground/80 mb-3">
              "Waaah kya pav hai! I'll give you{' '}
              <span className="text-coin font-bold">{formatCurrency(REWARD)}</span>{' '}
              — but only if you like my LinkedIn debut post!"
            </p>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDecline}
                className="flex-1 bg-muted/50 border border-border px-3 py-2 text-sm font-display text-foreground/60 hover:bg-muted transition-colors"
              >
                NAH BRO
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className="flex-1 bg-accent text-accent-foreground px-3 py-2 text-sm font-display hover:bg-accent/90 transition-colors"
              >
                👍 LIKE POST
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
