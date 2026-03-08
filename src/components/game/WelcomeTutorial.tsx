import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'WADA PAV TYCOON',
    text: '',
    emoji: '🟠',
    type: 'splash' as const,
  },
  {
    title: 'The Wada Pav 🍔',
    text: 'A crispy fried potato dumpling, stuffed inside a soft pav bun, slathered with spicy chutneys and a fried green chilli on the side. Simple. Deadly. Addictive.',
    emoji: '🥔',
    type: 'story' as const,
  },
  {
    title: 'Mumbai\'s Soul Food 🏙️',
    text: 'From CST station to Juhu beach, wada pav is Mumbai\'s great equaliser — ₹15 feeds a billionaire and a taxi driver the same joy. It\'s not just food, it\'s the heartbeat of the city.',
    emoji: '❤️',
    type: 'story' as const,
  },
  {
    title: 'Your Empire Begins 🔥',
    text: 'You just bought a small cart near CST station. One tawa, one dream. Can you build Mumbai\'s greatest wada pav empire? Let\'s find out, boss!',
    emoji: '🛒',
    type: 'story' as const,
  },
  {
    title: 'Tap to Cook! 👆',
    text: 'Tap the cart to fry wada pavs and earn ₹ rupees. The faster you tap, the bigger your combo multiplier!',
    emoji: '⚡',
    type: 'tutorial' as const,
  },
  {
    title: 'Grow Your Business 📈',
    text: 'Buy upgrades to boost earnings, hire crew to automate production, and prestige to unlock new Mumbai locations with bigger multipliers!',
    emoji: '🚀',
    type: 'tutorial' as const,
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
  const isSplash = current.type === 'splash';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm px-6"
    >
      {isSplash ? (
        /* ===== Splash / Title Screen ===== */
        <motion.div
          key="splash"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm text-center space-y-6"
        >
          {/* Big pixel title */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="text-5xl mb-3">🟠</div>
            <h1 className="font-display font-extrabold text-lg text-primary tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              WADA PAV
            </h1>
            <h1 className="font-display font-extrabold text-lg text-coin tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              TYCOON
            </h1>
          </motion.div>

          <p className="font-body text-xs text-muted-foreground italic">
            Mumbai's street food empire awaits
          </p>

          <motion.button
            onClick={handleNext}
            className="px-8 py-3 font-display font-bold text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors tracking-widest animate-pulse"
            whileTap={{ scale: 0.95 }}
          >
            TAP TO START
          </motion.button>

          <button
            onClick={handleSkip}
            className="block mx-auto text-[9px] font-body text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            skip intro
          </button>
        </motion.div>
      ) : (
        /* ===== Story / Tutorial Cards ===== */
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
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
                  i === step ? 'bg-primary scale-110' : i < step ? 'bg-primary/40' : 'bg-muted-foreground/30'
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
              {isLast ? 'LET\'S COOK! 🔥' : 'NEXT →'}
            </button>
          </div>
        </motion.div>
      )}
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
