import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'wadapav-behind-the-pav';

const SKILLS = [
  {
    emoji: '🧠',
    title: 'User Psychology',
    hook: 'That dopamine hit when numbers go up?',
    detail: 'Variable reward schedules, loss aversion (thieves!), combo momentum, and prestige resets — all deliberate behavioral design patterns that kept you tapping.',
  },
  {
    emoji: '🎨',
    title: 'UX Design',
    hook: 'The UI that just… made sense?',
    detail: 'Progressive disclosure (locked tabs → mystery → reveal), contextual nudges instead of tutorials, affordability dots, and zero-friction onboarding. You never read a manual.',
  },
  {
    emoji: '📊',
    title: 'Product Management',
    hook: 'The balanced progression that kept you playing?',
    detail: 'Location-based cost scaling, worker economics, upgrade curves — all modeled to hit the sweet spot between "too easy" and "feels impossible." Retention by design.',
  },
  {
    emoji: '🎮',
    title: 'Game Design & Dev',
    hook: 'Combos, thieves, prestige loops, offline earnings?',
    detail: 'Built from scratch in React with Web Audio API music, PWA support, procedural pixel art, and a full idle economy engine. No game framework — just product thinking + code.',
  },
  {
    emoji: '🔍',
    title: 'Competitor Research',
    hook: 'Felt familiar yet fresh?',
    detail: 'Studied Cookie Clicker, Adventure Capitalist, Idle Miner Tycoon, and others. Took what works (prestige loops, incremental scaling) and added an Indian street food twist.',
  },
];

export function hasSeenBehindThePav(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markBehindThePavSeen() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

interface Props {
  onClose: () => void;
}

export default function BehindThePav({ onClose }: Props) {
  const [activeIdx, setActiveIdx] = useState(-1); // -1 = intro, 0-4 = skills, 5 = outro
  const totalSteps = SKILLS.length + 2; // intro + skills + outro

  useEffect(() => {
    markBehindThePavSeen();
  }, []);

  const next = () => setActiveIdx(i => Math.min(i + 1, totalSteps - 2));
  const isIntro = activeIdx === -1;
  const isOutro = activeIdx === SKILLS.length;
  const skill = !isIntro && !isOutro ? SKILLS[activeIdx] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/85 backdrop-blur-md flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        key={activeIdx}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-card border-2 border-primary/40 p-5 max-w-sm w-full text-center space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* === INTRO === */}
        {isIntro && (
          <>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              🍔
            </motion.div>
            <h2 className="font-display text-xs text-primary tracking-wider">
              BEHIND THE PAV
            </h2>
            <p className="font-body text-sm text-foreground/80 leading-relaxed">
              Plot twist: <span className="text-primary font-bold">this game was a job application all along</span> 😏
            </p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              You've been playing for a while now. Every mechanic you enjoyed was a deliberate design choice. Here's the thinking behind it…
            </p>
            <button
              onClick={next}
              className="bg-primary text-primary-foreground font-display text-[10px] px-6 py-2 hover:bg-primary/80 transition-colors tracking-wider"
            >
              SHOW ME →
            </button>
          </>
        )}

        {/* === SKILL CARDS === */}
        {skill && (
          <>
            <div className="text-3xl">{skill.emoji}</div>
            <h3 className="font-display text-[11px] text-primary tracking-wider">
              {skill.title.toUpperCase()}
            </h3>
            <p className="font-body text-sm text-foreground font-bold leading-relaxed italic">
              "{skill.hook}"
            </p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              {skill.detail}
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {SKILLS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 transition-colors ${
                    i <= activeIdx ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="bg-primary text-primary-foreground font-display text-[10px] px-6 py-2 hover:bg-primary/80 transition-colors tracking-wider"
            >
              {activeIdx < SKILLS.length - 1 ? 'NEXT →' : 'AND SO… →'}
            </button>
          </>
        )}

        {/* === OUTRO === */}
        {isOutro && (
          <>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              🚀
            </motion.div>
            <h2 className="font-display text-[10px] text-primary tracking-wider">
              SO, ABOUT THAT HIRE…
            </h2>
            <p className="font-body text-[11px] text-foreground/80 leading-relaxed">
              If a simple-looking clicker game kept you engaged this long, imagine what I could build for <span className="text-primary font-bold">your</span> product.
            </p>
            <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
              Cross-domain thinking. User obsession. Shipping things that people actually enjoy using.
            </p>

            <div className="flex gap-2 pt-1">
              <a
                href="https://linkedin.com/in/aapatre"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#0A66C2] text-white font-display text-[8px] px-3 py-2.5 hover:bg-[#004182] transition-colors tracking-wider text-center"
              >
                🔗 LINKEDIN
              </a>
              <a
                href="https://antariksh.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-primary text-primary-foreground font-display text-[8px] px-3 py-2.5 hover:bg-primary/80 transition-colors tracking-wider text-center"
              >
                🚀 PORTFOLIO
              </a>
            </div>

            <button
              onClick={onClose}
              className="text-[8px] font-display text-muted-foreground hover:text-foreground transition-colors tracking-wider pt-1"
            >
              BACK TO MAKING PAV →
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
