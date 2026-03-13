import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import handPointerIcon from '@/assets/icons/hand-pointer.png';

interface Props {
  lastTapTime: number;
  hasCrewMember: boolean;
  currentLocation: number;
}

const MESSAGES_NO_CREW = [
  "Keep tapping to earn more!",
  "The crowd is hungry!",
  "Your hands are the only ones cooking!",
  "Don't let the tawa cool down!",
];

const MESSAGES_WITH_CREW = [
  "Tap to earn even faster!",
  "Your crew needs the boss!",
  "Tap to boost earnings!",
  "Lend a hand, boss!",
];

export default function IdleTapReminder({ lastTapTime, hasCrewMember, currentLocation }: Props) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentLocation !== 0) { setShow(false); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShow(false);
    if (lastTapTime === 0) return;

    timerRef.current = window.setTimeout(() => {
      const msgs = hasCrewMember ? MESSAGES_WITH_CREW : MESSAGES_NO_CREW;
      setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      setShow(true);
      hideTimerRef.current = window.setTimeout(() => setShow(false), 4000);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [lastTapTime, hasCrewMember, currentLocation]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={handPointerIcon} alt="Tap" className="w-10 h-10 object-contain [image-rendering:pixelated]" draggable={false} />
          </motion.div>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-display text-[9px] text-coin tracking-[0.2em] bg-background/70 px-3 py-1 whitespace-nowrap"
          >
            {message}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
