import { motion } from 'framer-motion';
import PixelIcon from './PixelIcon';
import { formatCurrency } from '@/hooks/useGameState';

const PRESTIGE_MYSTERY_KEY = 'wadapav-prestige-mystery';
const PRESTIGE_UNLOCK_KEY = 'wadapav-prestige-unlock';
const PRESTIGE_NUDGE_KEY = 'wadapav-prestige-nudge';

export function hasSeenPrestigeUnlock() {
  try { return localStorage.getItem(PRESTIGE_UNLOCK_KEY) === 'true'; } catch { return false; }
}
export function markPrestigeUnlockSeen() {
  try { localStorage.setItem(PRESTIGE_UNLOCK_KEY, 'true'); } catch {}
}
export function hasSeenPrestigeNudge() {
  try { return localStorage.getItem(PRESTIGE_NUDGE_KEY) === 'true'; } catch { return false; }
}
export function markPrestigeNudgeSeen() {
  try { localStorage.setItem(PRESTIGE_NUDGE_KEY, 'true'); } catch {}
}

/** Shown when user taps locked prestige tab (before 100k) */
export function PrestigeMysteryPrompt({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xs bg-card border-2 border-primary/40 p-5 pixel-border space-y-4 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-4xl"
        >🔮</motion.div>
        <h2 className="font-display font-bold text-sm text-primary">MYSTERY LOCKED</h2>
        <p className="text-xs font-body text-muted-foreground leading-relaxed">
          Something powerful awaits here... but you're not ready yet, boss!
        </p>
        <p className="text-xs font-body text-foreground/80">
          Earn <span className="font-bold text-coin">{formatCurrency(100_000)}</span> total to unlock this secret.
        </p>
        <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-primary/50 rounded-full" style={{ width: '0%' }} />
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 bg-primary/20 text-primary font-display text-[9px] pixel-border hover:bg-primary/30 transition-colors"
        >
          BACK TO GRINDING 💪
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Shown when player reaches 100k — explains prestige */
export function PrestigeUnlockPrompt({ onClose, onSwitchTab }: { onClose: () => void; onSwitchTab: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-xs bg-card border-2 border-coin/60 p-5 pixel-border space-y-3 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: 2 }}
          className="text-4xl"
        >⭐</motion.div>
        <h2 className="font-display font-bold text-sm text-coin">PRESTIGE UNLOCKED!</h2>
        <p className="text-xs font-body text-foreground/90 leading-relaxed">
          You've proven yourself at CST Station! A new power is now available.
        </p>
        <div className="bg-muted/30 border border-border/50 p-3 space-y-2 text-left">
          <p className="text-[10px] font-display text-primary">HOW PRESTIGE WORKS:</p>
          <ul className="text-[10px] font-body text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-1.5">
              <span className="text-coin mt-0.5">▸</span>
              <span>Reset your progress to <span className="text-foreground">move to a new location</span></span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-coin mt-0.5">▸</span>
              <span>Earn <span className="text-coin font-bold">Prestige Points</span> based on total earnings</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-coin mt-0.5">▸</span>
              <span>Each point gives a <span className="text-chutney font-bold">permanent 10% bonus</span> to all earnings</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-coin mt-0.5">▸</span>
              <span>New locations have <span className="text-primary font-bold">higher multipliers</span>!</span>
            </li>
          </ul>
        </div>
        <p className="text-[10px] font-body text-muted-foreground">
          Earn <span className="font-bold text-coin">{formatCurrency(1_000_000)}</span> total to prestige for the first time!
        </p>
        <button
          onClick={() => { onSwitchTab(); onClose(); }}
          className="w-full py-2.5 bg-coin text-background font-display font-bold text-[9px] pixel-border hover:brightness-110 transition-all"
        >
          CHECK IT OUT ⭐
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Nudge banner shown when player can prestige */
export function PrestigeNudgeBanner({ onDismiss, onGoToPrestige, totalEarned, prestigeCost }: { onDismiss: () => void; onGoToPrestige: () => void; totalEarned: number; prestigeCost: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative z-10 mx-3 mt-1"
    >
      <div
        className="bg-coin/20 backdrop-blur-sm border border-coin/50 px-3 py-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-coin/30 transition-colors"
        onClick={onGoToPrestige}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">⭐</span>
          <span className="text-[10px] font-body text-foreground/90">
            You've earned <span className="font-bold text-coin">{formatCurrency(totalEarned)}</span>! Ready to <span className="font-bold text-primary">prestige</span>?
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDismiss(); }}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >✕</button>
      </div>
    </motion.div>
  );
}
