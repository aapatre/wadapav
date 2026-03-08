import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'Welcome, Chef! 🍽️',
    text: 'You\'re now the proud owner of a Wada Pav cart in Mumbai! Your goal: build a street food empire, one pav at a time.',
    emoji: '🎉',
  },
  {
    title: 'Tap to Cook! 👆',
    text: 'Tap the cart to fry wada pavs and earn ₹ rupees. The faster you tap, the more you earn — combo taps give bonus cash!',
    emoji: '🔥',
  },
  {
    title: 'Buy Upgrades 🛒',
    text: 'Spend your earnings on upgrades to boost your tap power and multiply your income.',
    emoji: '⚡',
  },
];

const TUTORIAL_KEY = 'wadapav_tutorial_done';
const CREW_HINT_KEY = 'wadapav_crew_hint_done';

export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === 'true';
  } catch {
    return false;
  }
}

export function hasSeenCrewHint(): boolean {
  try {
    return localStorage.getItem(CREW_HINT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_KEY, 'true');
  } catch {}
}

export function markCrewHintDone() {
  try {
    localStorage.setItem(CREW_HINT_KEY, 'true');
  } catch {}
}

export default function WelcomeTutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      markTutorialDone();
      onComplete();
    }
  };

  const handleSkip = () => {
    markTutorialDone();
    onComplete();
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-card border-2 border-primary/50 p-5 text-center space-y-4"
      >
        <div className="text-4xl">{current.emoji}</div>
        <h2 className="font-display font-extrabold text-sm text-primary tracking-wide">
          {current.title}
        </h2>
        <p className="font-body text-xs text-foreground/80 leading-relaxed">
          {current.text}
        </p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 transition-all ${
                i === step ? 'bg-primary scale-110' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSkip}
            className="flex-1 py-2 text-[10px] font-display text-muted-foreground hover:text-foreground transition-colors"
          >
            SKIP
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2 text-[10px] font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isLast ? 'START COOKING →' : 'NEXT →'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CrewHintPrompt({ onComplete, onSwitchToCrewTab }: { onComplete: () => void; onSwitchToCrewTab: () => void }) {
  const handleHire = () => {
    markCrewHintDone();
    onSwitchToCrewTab();
    onComplete();
  };

  const handleDismiss = () => {
    markCrewHintDone();
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-card border-2 border-primary/50 p-5 text-center space-y-4"
      >
        <div className="text-4xl">🤝</div>
        <h2 className="font-display font-extrabold text-sm text-primary tracking-wide">
          Hire Your Crew 👥
        </h2>
        <p className="font-body text-xs text-foreground/80 leading-relaxed">
          You've earned enough to hire your first worker! Head to the Crew tab to hire a Potato Masher who earns ₹ automatically — even while you're away!
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 text-[10px] font-display text-muted-foreground hover:text-foreground transition-colors"
          >
            LATER
          </button>
          <button
            onClick={handleHire}
            className="flex-1 py-2 text-[10px] font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            HIRE CREW →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
