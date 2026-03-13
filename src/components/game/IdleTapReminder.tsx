import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  lastTapTime: number;
  hasCrewMember: boolean;
  currentLocation: number;
}

const MESSAGES_NO_CREW = [
  "Your tawa is getting cold! 🔥 Tap to cook more wada pavs!",
  "Mumbai won't wait! Keep tapping to earn more ₹₹₹!",
  "The crowd is hungry boss! Tap tap tap! 🍽️",
  "No crew yet? Your hands are the only ones cooking! Keep going! 💪",
];

const MESSAGES_WITH_CREW = [
  "Your crew is cooking, but YOU make it faster! Tap! 🔥",
  "Boss, lend a hand — tap to earn even faster! 💰",
  "Your crew can't do it alone! Tap to boost earnings! 🚀",
  "The more you tap, the richer you get! Don't stop! 🤑",
];

export default function IdleTapReminder({ lastTapTime, hasCrewMember, currentLocation }: Props) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Only on CST Station (location 0)
    if (currentLocation !== 0) {
      setShow(false);
      return;
    }

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Hide current reminder on tap
    setShow(false);

    // Don't show if never tapped
    if (lastTapTime === 0) return;

    // Show after 5 seconds of inactivity
    timerRef.current = window.setTimeout(() => {
      const messages = hasCrewMember ? MESSAGES_WITH_CREW : MESSAGES_NO_CREW;
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setShow(true);

      // Auto-hide after 4 seconds
      setTimeout(() => setShow(false), 4000);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastTapTime, hasCrewMember, currentLocation]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          className="relative z-10 mx-3 mt-1"
        >
          <div className="bg-card/80 backdrop-blur-sm border border-accent/50 px-3 py-1.5 flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
              className="text-[12px]"
            >👋</motion.span>
            <span className="text-[10px] font-body text-foreground/80">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
