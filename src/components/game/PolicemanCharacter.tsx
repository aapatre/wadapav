import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import policemanIcon from '@/assets/icons/policeman.png';

const LINKEDIN_URL = 'https://linkedin.com/in/aapatre';
const STORAGE_KEY_PREFIX = 'wadapav-policeman-seen-loc-';
const MIN_INTERVAL = 120_000; // 2 min
const MAX_INTERVAL = 300_000; // 5 min
const CURRENCY_THRESHOLD = 30_000; // only appear after ₹30k

const DIALOGUES = [
  { line: "🚨 HALT! This is an unlicensed food cart! ...But I'll let it slide if you hire the developer.", cta: "Hire on LinkedIn" },
  { line: "🧑‍✈️ Sir, your vada pav license expired in 2019. Renew it by connecting on LinkedIn!", cta: "Renew License" },
  { line: "👮 Health inspection! Everything looks... delicious actually. The dev deserves a job though.", cta: "View Profile" },
  { line: "🚔 We got reports of dangerously good vada pav here. The suspect? A talented developer.", cta: "Investigate" },
  { line: "📋 Routine check! Your code is clean, your pav is crispy. Now hire the guy who built this!", cta: "Check LinkedIn" },
  { line: "🕵️ Undercover taste test complete. Verdict: INCREDIBLE. The dev? Also incredible. Hire him.", cta: "Hire Dev" },
  { line: "⚖️ By order of the Mumbai Vada Pav Authority, you must immediately view this LinkedIn profile.", cta: "Comply" },
  { line: "🎖️ Officer Sharma here. I'm not taking bribes today — just LinkedIn connections.", cta: "Connect" },
];

interface Props {
  currency: number;
  currentLocation: number;
}

export default function PolicemanCharacter({ currency, currentLocation }: Props) {
  const [visible, setVisible] = useState(false);
  const [dialogue, setDialogue] = useState(DIALOGUES[0]);
  const timerRef = useRef<number | null>(null);
  const currencyRef = useRef(currency);
  currencyRef.current = currency;

  const scheduleAppearance = useCallback(() => {
    const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    timerRef.current = window.setTimeout(() => {
      if (currencyRef.current >= CURRENCY_THRESHOLD) {
        const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
        setDialogue(DIALOGUES[count % DIALOGUES.length]);
        localStorage.setItem(STORAGE_KEY, String(count + 1));
        setVisible(true);
      } else {
        scheduleAppearance();
      }
    }, delay);
  }, []);

  useEffect(() => {
    scheduleAppearance();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scheduleAppearance]);

  const handleDismiss = () => {
    setVisible(false);
    scheduleAppearance();
  };

  const handleCTA = () => {
    window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer');
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center p-6"
          style={{ zIndex: 9997 }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.7, y: 40, rotate: -5 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.5, y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-card border-2 border-primary/50 p-5 max-w-xs text-center space-y-3"
            onClick={e => e.stopPropagation()}
          >
            {/* Policeman icon */}
            <motion.div
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={policemanIcon} alt="Policeman" className="w-16 h-16 mx-auto object-contain" draggable={false} />
            </motion.div>

            <p className="font-body text-sm text-foreground/90 leading-relaxed">
              {dialogue.line}
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleCTA}
                className="flex-1 bg-[#0A66C2] text-white font-display text-[10px] px-3 py-2 hover:bg-[#004182] transition-colors tracking-wider"
              >
                🔗 {dialogue.cta}
              </button>
              <button
                onClick={handleDismiss}
                className="text-[10px] font-display text-muted-foreground px-2 py-2 hover:text-foreground transition-colors tracking-wider border border-border/50"
              >
                DISMISS
              </button>
            </div>

            <p className="text-[9px] font-body text-muted-foreground/60">
              *No actual laws were broken in the making of this vada pav*
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
