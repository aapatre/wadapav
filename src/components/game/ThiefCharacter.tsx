import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/hooks/useGameState';
import { sfxThiefCaught, sfxThiefStole } from '@/hooks/useSfx';

type ThiefSize = 'small' | 'medium' | 'large';

interface Thief {
  id: number;
  size: ThiefSize;
  tapsRequired: number;
  tapsReceived: number;
  stealAmount: number;
  fromLeft: boolean;
  offsetX: number;
  height: number;
  timeToSteal: number; // ms before they steal
}

interface Props {
  currency: number;
  onSteal: (amount: number) => void;
}

const THIEF_TUTORIAL_KEY = 'wadapav-thief-tutorial-seen';
const THIEF_THRESHOLD = 15000;
const MIN_SPAWN_INTERVAL = 15000; // 15s
const MAX_SPAWN_INTERVAL = 45000; // 45s

function getStealAmount(currency: number): number {
  if (currency < 10000) return Math.floor(currency * 0.05);
  if (currency < 100000) return 1000 + Math.floor(Math.random() * 4000); // 1k-5k
  if (currency < 1000000) return 5000 + Math.floor(Math.random() * 20000); // 5k-25k
  return 10000 + Math.floor(Math.random() * 50000); // 10k-60k
}

function getThiefSize(): ThiefSize {
  const r = Math.random();
  if (r < 0.5) return 'small';
  if (r < 0.85) return 'medium';
  return 'large';
}

const SIZE_CONFIG: Record<ThiefSize, { taps: number; height: number; timeToSteal: number }> = {
  small: { taps: 1, height: 60, timeToSteal: 4000 },
  medium: { taps: 2, height: 80, timeToSteal: 5000 },
  large: { taps: 3, height: 100, timeToSteal: 6000 },
};

let thiefIdCounter = 0;

function ThiefSprite({ height, walking, tapsLeft }: { height: number; walking: boolean; tapsLeft: number }) {
  const shade = '#b33';
  const darker = '#922';
  return (
    <div
      className="relative"
      style={{
        width: height * 0.45,
        height,
        filter: 'url(#pixelate)',
      }}
    >
      {/* Head */}
      <div
        className="absolute rounded-full"
        style={{
          width: height * 0.22,
          height: height * 0.22,
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: shade,
        }}
      />
      {/* Mask / bandana */}
      <div
        className="absolute"
        style={{
          width: height * 0.24,
          height: height * 0.06,
          top: height * 0.08,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: darker,
        }}
      />
      {/* Body */}
      <div
        className="absolute"
        style={{
          width: height * 0.28,
          height: height * 0.32,
          top: height * 0.2,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: shade,
          borderRadius: '3px 3px 0 0',
        }}
      />
      {/* Left leg */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.11,
          height: height * 0.3,
          top: height * 0.5,
          left: '25%',
          backgroundColor: darker,
          borderRadius: '0 0 2px 2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [15, -15, 15] } : { rotate: 0 }}
        transition={walking ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      {/* Right leg */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.11,
          height: height * 0.3,
          top: height * 0.5,
          left: '55%',
          backgroundColor: darker,
          borderRadius: '0 0 2px 2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [-15, 15, -15] } : { rotate: 0 }}
        transition={walking ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      {/* Left arm */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.08,
          height: height * 0.25,
          top: height * 0.22,
          left: '8%',
          backgroundColor: darker,
          borderRadius: '2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [-20, 20, -20] } : { rotate: 0 }}
        transition={walking ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      {/* Right arm */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.08,
          height: height * 0.25,
          top: height * 0.22,
          right: '8%',
          backgroundColor: darker,
          borderRadius: '2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [20, -20, 20] } : { rotate: 0 }}
        transition={walking ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      {/* Taps remaining indicator */}
      {tapsLeft > 0 && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-0.5">
          {Array.from({ length: tapsLeft }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-destructive rounded-none border border-background" />
          ))}
        </div>
      )}
    </div>
  );
}

export function hasSeenThiefTutorial(): boolean {
  return localStorage.getItem(THIEF_TUTORIAL_KEY) === 'true';
}

export function ThiefTutorialPrompt({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    localStorage.setItem(THIEF_TUTORIAL_KEY, 'true');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
      style={{ zIndex: 9998 }}
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-card border-2 border-destructive/60 p-5 max-w-xs text-center space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-2xl">🚨</div>
        <h2 className="font-display text-[9px] text-destructive tracking-wider">THIEF ALERT!</h2>
        <p className="font-body text-[11px] text-foreground/80 leading-relaxed">
          Watch out! <span className="text-destructive font-bold">Red thieves</span> will try to steal your money!
        </p>
        <div className="space-y-1 text-[10px] font-body text-muted-foreground">
          <p>🔴 <span className="text-foreground">Small</span> — 1 tap to catch</p>
          <p>🔴🔴 <span className="text-foreground">Medium</span> — 2 taps to catch</p>
          <p>🔴🔴🔴 <span className="text-foreground">Large</span> — 3 taps to catch</p>
        </div>
        <p className="font-body text-[10px] text-coin">
          Tap them before they escape with your ₹!
        </p>
        <button
          onClick={onComplete}
          className="bg-destructive text-destructive-foreground font-display text-[8px] px-4 py-2 hover:bg-destructive/80 transition-colors tracking-wider"
        >
          GOT IT!
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ThiefCharacter({ currency, onSteal }: Props) {
  const [thief, setThief] = useState<Thief | null>(null);
  const [phase, setPhase] = useState<'entering' | 'lurking' | 'stealing' | 'caught' | 'escaped'>('entering');
  const [stolenText, setStolenText] = useState<{ amount: number; caught: boolean } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const tutorialShownRef = useRef(hasSeenThiefTutorial());
  const stealTimerRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const currencyRef = useRef(currency);
  currencyRef.current = currency;

  const clearTimers = useCallback(() => {
    if (stealTimerRef.current) clearTimeout(stealTimerRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
  }, []);

  const scheduleSpawn = useCallback(() => {
    const delay = MIN_SPAWN_INTERVAL + Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);
    spawnTimerRef.current = window.setTimeout(() => {
      if (currencyRef.current >= THIEF_THRESHOLD) {
        // Show tutorial on first appearance
        if (!tutorialShownRef.current) {
          tutorialShownRef.current = true;
          setShowTutorial(true);
          return; // will spawn after tutorial dismissal
        }
        spawnThief();
      } else {
        scheduleSpawn();
      }
    }, delay);
  }, []);

  const spawnThief = useCallback(() => {
    const size = getThiefSize();
    const config = SIZE_CONFIG[size];
    const fromLeft = Math.random() > 0.5;
    const newThief: Thief = {
      id: ++thiefIdCounter,
      size,
      tapsRequired: config.taps,
      tapsReceived: 0,
      stealAmount: getStealAmount(currencyRef.current),
      fromLeft,
      offsetX: (Math.random() - 0.5) * 80,
      height: config.height,
      timeToSteal: config.timeToSteal,
    };
    setThief(newThief);
    setPhase('entering');

    // After entering, start lurking countdown
    setTimeout(() => {
      setPhase('lurking');
      // Steal timer
      stealTimerRef.current = window.setTimeout(() => {
        setPhase('stealing');
        onSteal(newThief.stealAmount);
        setStolenText({ amount: newThief.stealAmount, caught: false });
        setTimeout(() => {
          setPhase('escaped');
          setTimeout(() => {
            setThief(null);
            setStolenText(null);
            scheduleSpawn();
          }, 2000);
        }, 800);
      }, newThief.timeToSteal);
    }, 1500); // enter animation duration
  }, [onSteal, scheduleSpawn]);

  // Start spawn cycle
  useEffect(() => {
    scheduleSpawn();
    return clearTimers;
  }, [scheduleSpawn, clearTimers]);

  // Handle tutorial dismiss → spawn thief
  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    setTimeout(() => spawnThief(), 500);
  }, [spawnThief]);

  const handleTapThief = useCallback(() => {
    if (!thief || phase !== 'lurking') return;

    const newTaps = thief.tapsReceived + 1;
    if (newTaps >= thief.tapsRequired) {
      // Caught!
      if (stealTimerRef.current) clearTimeout(stealTimerRef.current);
      setPhase('caught');
      setStolenText({ amount: 0, caught: true });
      setTimeout(() => {
        setThief(null);
        setStolenText(null);
        scheduleSpawn();
      }, 1500);
    } else {
      setThief({ ...thief, tapsReceived: newTaps });
    }
  }, [thief, phase, scheduleSpawn]);

  return (
    <>
      {/* Tutorial */}
      <AnimatePresence>
        {showTutorial && <ThiefTutorialPrompt onComplete={handleTutorialComplete} />}
      </AnimatePresence>

      {/* Thief */}
      <AnimatePresence>
        {thief && (
          <motion.div
            key={thief.id}
            className="absolute cursor-pointer z-20"
            style={{
              bottom: 44,
              left: '50%',
            }}
            initial={{ x: thief.fromLeft ? -250 : 250, opacity: 0 }}
            animate={
              phase === 'entering' || phase === 'lurking'
                ? { x: thief.offsetX, opacity: 1 }
                : phase === 'caught'
                ? { x: thief.offsetX, opacity: 0, scale: 0.3, y: -30 }
                : { x: thief.fromLeft ? -250 : 250, opacity: 0 }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: phase === 'entering' ? 1.5 : phase === 'caught' ? 0.5 : 2,
              ease: 'easeInOut',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleTapThief();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleTapThief();
            }}
          >
            {/* Pulsing warning ring when lurking */}
            {phase === 'lurking' && (
              <motion.div
                className="absolute inset-0 border-2 border-destructive/50 rounded-full"
                style={{ margin: -6 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            <ThiefSprite
              height={thief.height}
              walking={phase === 'entering' || phase === 'escaped' || phase === 'stealing'}
              tapsLeft={thief.tapsRequired - thief.tapsReceived}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stolen / caught floating text */}
      <AnimatePresence>
        {stolenText && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute z-30 font-display text-[10px] font-bold pointer-events-none ${
              stolenText.caught ? 'text-accent' : 'text-destructive'
            }`}
            style={{ bottom: 120, left: '50%', transform: 'translateX(-50%)' }}
          >
            {stolenText.caught ? '✅ CAUGHT!' : `💸 -${formatCurrency(stolenText.amount)}`}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
