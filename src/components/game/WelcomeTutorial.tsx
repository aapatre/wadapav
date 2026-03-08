import { useState } from 'react';
import { motion } from 'framer-motion';
import cartScene from '@/assets/cart-scene.png';
import PixelIcon from './PixelIcon';

interface Props {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'WADA PAV TYCOON',
    text: '',
    iconId: '',
    type: 'splash' as const,
  },
  {
    title: 'The Wada Pav',
    titleIcon: 'burger',
    text: 'A crispy fried potato dumpling, stuffed inside a soft pav bun, slathered with spicy chutneys and a fried green chilli on the side. Simple. Deadly. Addictive.',
    iconId: 'masher',
    type: 'story' as const,
  },
  {
    title: 'Mumbai\'s Soul Food',
    titleIcon: 'city',
    text: 'From CST station to Juhu beach, wada pav is Mumbai\'s great equaliser — ₹15 feeds a billionaire and a taxi driver the same joy. It\'s not just food, it\'s the heartbeat of the city.',
    iconId: 'heart',
    type: 'story' as const,
  },
  {
    title: 'Your Empire Begins',
    titleIcon: 'fire',
    text: 'You just bought a small cart near CST station. One tawa, one dream. Can you build Mumbai\'s greatest wada pav empire? Let\'s find out, boss!',
    iconId: 'loc0',
    type: 'story' as const,
  },
  {
    title: 'Tap to Cook!',
    titleIcon: 'tap-finger',
    text: 'Tap the cart to fry wada pavs and earn ₹ rupees. The faster you tap, the bigger your combo multiplier!',
    iconId: 'lightning',
    type: 'tutorial' as const,
  },
  {
    title: 'Grow Your Business',
    titleIcon: 'chart-up',
    text: 'Buy upgrades to boost earnings, hire crew to automate production, and prestige to unlock new Mumbai locations with bigger multipliers!',
    iconId: 'rocket',
    type: 'tutorial' as const,
  },
];

const TUTORIAL_KEY = 'wadapav_tutorial_done';
const CREW_HINT_KEY = 'wadapav_crew_hint_done';
const UPGRADE_HINT_KEY = 'wadapav_upgrade_hint_done';

export function hasSeenTutorial(): boolean {
  try { return localStorage.getItem(TUTORIAL_KEY) === 'true'; } catch { return false; }
}

export function hasSeenCrewHint(): boolean {
  try { return localStorage.getItem(CREW_HINT_KEY) === 'true'; } catch { return false; }
}

export function hasSeenUpgradeHint(): boolean {
  try { return localStorage.getItem(UPGRADE_HINT_KEY) === 'true'; } catch { return false; }
}

export function markTutorialDone() {
  try { localStorage.setItem(TUTORIAL_KEY, 'true'); } catch {}
}

export function markCrewHintDone() {
  try { localStorage.setItem(CREW_HINT_KEY, 'true'); } catch {}
}

export function markUpgradeHintDone() {
  try { localStorage.setItem(UPGRADE_HINT_KEY, 'true'); } catch {}
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
          className="w-full max-w-sm text-center space-y-8"
        >
          {/* Big pixel title */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={cartScene} alt="Wada Pav Cart" className="w-40 h-40 mx-auto object-contain pointer-events-none" draggable={false} />
            <h1 className="font-display font-extrabold text-2xl text-primary tracking-[0.3em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              WADA PAV
            </h1>
            <h1 className="font-display font-extrabold text-2xl text-coin tracking-[0.3em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              TYCOON
            </h1>
          </motion.div>

          <p className="font-body text-sm text-muted-foreground italic tracking-wide">
            Mumbai's street food empire awaits
          </p>

          <motion.button
            onClick={handleNext}
            className="px-10 py-3.5 font-display font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors tracking-[0.2em] animate-pulse"
            whileTap={{ scale: 0.95 }}
          >
            TAP TO START
          </motion.button>

          <button
            onClick={handleSkip}
            className="block mx-auto text-[10px] font-body text-muted-foreground/50 hover:text-muted-foreground transition-colors tracking-wide"
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
          className="w-full max-w-sm bg-card border-2 border-primary/50 p-6 text-center space-y-5"
        >
          <PixelIcon id={current.iconId} size={48} />
          <h2 className="font-display font-extrabold text-base text-primary tracking-[0.15em] flex items-center justify-center gap-2">
            {current.title}
            {'titleIcon' in current && current.titleIcon && <PixelIcon id={current.titleIcon as string} size={20} />}
          </h2>
          <p className="font-body text-sm text-foreground/80 leading-relaxed tracking-wide">
            {current.text}
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 transition-all ${
                  i === step ? 'bg-primary scale-110' : i < step ? 'bg-primary/40' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSkip}
              className="flex-1 py-2.5 text-xs font-display text-muted-foreground hover:text-foreground transition-colors tracking-wider"
            >
              SKIP
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 text-xs font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors tracking-wider"
            >
              {isLast ? <span className="flex items-center gap-1">LET'S COOK! <PixelIcon id="fire" size={12} /></span> : 'NEXT →'}
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
          Time to Hire! 👥
        </h2>
        <p className="font-body text-xs text-foreground/80 leading-relaxed">
          You need a <span className="font-bold text-coin">Potato Masher</span> to keep up with demand! Head to the Crew tab and hire one to continue your wada pav empire.
        </p>

        <button
          onClick={handleHire}
          className="w-full py-2.5 text-[10px] font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors animate-pulse"
        >
          GO TO CREW TAB →
        </button>
      </motion.div>
    </motion.div>
  );
}

export function UpgradeHintPrompt({ onComplete, onSwitchToUpgradeTab }: { onComplete: () => void; onSwitchToUpgradeTab: () => void }) {
  const handleGo = () => {
    markUpgradeHintDone();
    onSwitchToUpgradeTab();
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
        <div className="text-4xl">🥔</div>
        <h2 className="font-display font-extrabold text-sm text-primary tracking-wide">
          Upgrade Time! ⬆️
        </h2>
        <p className="font-body text-xs text-foreground/80 leading-relaxed">
          Your potatoes need an upgrade! Buy <span className="font-bold text-coin">Better Potatoes</span> to earn more per tap and grow faster.
        </p>

        <button
          onClick={handleGo}
          className="w-full py-2.5 text-[10px] font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors animate-pulse"
        >
          GO TO UPGRADES →
        </button>
      </motion.div>
    </motion.div>
  );
}
