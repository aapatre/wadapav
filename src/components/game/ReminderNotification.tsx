import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  canAffordUpgrade: boolean;
  canAffordWorker: boolean;
  canPrestige: boolean;
  prestigeTabUnlocked: boolean;
  activeTab: string;
  onSwitchTab: (tab: 'upgrades' | 'workers' | 'prestige') => void;
}

const UPGRADE_MESSAGES = [
  { emoji: '🥔', text: 'Your potatoes could be better! Upgrades are waiting.' },
  { emoji: '🔧', text: 'Got cash lying around? Spend it on upgrades!' },
  { emoji: '📈', text: 'Pro tip: upgrades = more ₹₹₹ per tap!' },
  { emoji: '⬆️', text: 'Don\'t sleep on upgrades — your taps can hit harder!' },
];

const WORKER_MESSAGES = [
  { emoji: '👥', text: 'Your crew could use reinforcements! Hire more help.' },
  { emoji: '🤝', text: 'More crew = passive income. Don\'t do it all alone!' },
  { emoji: '💪', text: 'Your crew tab is calling — new hires available!' },
  { emoji: '🏃', text: 'Why tap when your crew can earn while you chill?' },
];

const PRESTIGE_MESSAGES = [
  { emoji: '🌟', text: 'You can expand to a new location! Time to prestige!' },
  { emoji: '🗺️', text: 'New map unlocked! Prestige for bigger multipliers!' },
  { emoji: '🚀', text: 'Ready to level up? A new location awaits!' },
  { emoji: '🏆', text: 'You\'ve outgrown this spot — prestige and grow!' },
];

const REMINDER_INTERVAL = 30_000; // 30 seconds
const DISPLAY_DURATION = 6_000; // 6 seconds

export default function ReminderNotification({
  canAffordUpgrade,
  canAffordWorker,
  canPrestige,
  prestigeTabUnlocked,
  activeTab,
  onSwitchTab,
}: Props) {
  const [notification, setNotification] = useState<{
    emoji: string;
    text: string;
    tab: 'upgrades' | 'workers' | 'prestige';
    label: string;
  } | null>(null);
  const lastShownRef = useRef(Date.now());
  const indexRef = useRef({ upgrades: 0, workers: 0, prestige: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastShownRef.current < REMINDER_INTERVAL) return;

      // Collect what's available (prioritize prestige > workers > upgrades)
      const options: { messages: typeof UPGRADE_MESSAGES; tab: 'upgrades' | 'workers' | 'prestige'; label: string }[] = [];

      if (canPrestige && prestigeTabUnlocked && activeTab !== 'prestige') {
        options.push({ messages: PRESTIGE_MESSAGES, tab: 'prestige', label: 'PRESTIGE' });
      }
      if (canAffordWorker && activeTab !== 'workers') {
        options.push({ messages: WORKER_MESSAGES, tab: 'workers', label: 'CREW' });
      }
      if (canAffordUpgrade && activeTab !== 'upgrades') {
        options.push({ messages: UPGRADE_MESSAGES, tab: 'upgrades', label: 'UPGRADES' });
      }

      if (options.length === 0) return;

      // Pick one randomly
      const pick = options[Math.floor(Math.random() * options.length)];
      const idx = indexRef.current[pick.tab] % pick.messages.length;
      indexRef.current[pick.tab] = idx + 1;
      const msg = pick.messages[idx];

      lastShownRef.current = Date.now();
      setNotification({ emoji: msg.emoji, text: msg.text, tab: pick.tab, label: pick.label });

      setTimeout(() => setNotification(null), DISPLAY_DURATION);
    }, 5_000); // check every 5s

    return () => clearInterval(interval);
  }, [canAffordUpgrade, canAffordWorker, canPrestige, prestigeTabUnlocked, activeTab]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.button
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-30 mx-3 mt-1 w-[calc(100%-1.5rem)] cursor-pointer"
          onClick={() => {
            onSwitchTab(notification.tab);
            setNotification(null);
          }}
        >
          <div className="bg-card/85 backdrop-blur-sm border border-coin/40 px-3 py-2 flex items-center gap-2 shadow-[0_2px_12px_hsl(var(--coin-gold)/0.15)]">
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm shrink-0"
            >
              {notification.emoji}
            </motion.span>
            <span className="text-[10px] font-body text-foreground/80 flex-1 text-left">
              {notification.text}
            </span>
            <span className="text-[8px] font-display text-coin tracking-wider shrink-0 bg-coin/10 px-2 py-1">
              {notification.label} →
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
