import { Upgrade } from '@/hooks/useGameState';
import { formatCurrency } from '@/hooks/useGameState';
import { motion } from 'framer-motion';
import PixelIcon from './PixelIcon';

interface Props {
  upgrades: Upgrade[];
  currency: number;
  onBuy: (id: string) => void;
  getCost: (upgrade: Upgrade) => number;
}

export default function UpgradePanel({ upgrades, currency, onBuy, getCost }: Props) {
  // Find first non-maxed upgrade index — that's the "next unlockable"
  const nextUnlockedIdx = upgrades.findIndex(u => u.level < u.maxLevel);

  return (
    <div className="space-y-2">
      {upgrades.map((upgrade, i) => {
        const cost = getCost(upgrade);
        const canAfford = currency >= cost;
        const maxed = upgrade.level >= upgrade.maxLevel;
        const isUnlocked = upgrade.level > 0 || i <= nextUnlockedIdx;
        const isNext = i === nextUnlockedIdx;
        const isFuture = i > nextUnlockedIdx && upgrade.level === 0;

        // Already purchased upgrades — show compact
        if (isUnlocked && !isNext) {
          if (maxed) {
            return (
              <motion.div
                key={upgrade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-full flex items-center gap-3 p-2.5 border-2 bg-muted/30 border-border/50 opacity-40"
              >
                <div className="p-1.5 bg-muted/30">
                  <PixelIcon id={upgrade.id} size={28} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-display font-semibold text-[7px] text-foreground truncate">{upgrade.name}</div>
                  <div className="text-xs font-body text-muted-foreground">{upgrade.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-body text-muted-foreground">{upgrade.level}/{upgrade.maxLevel}</div>
                  <div className="text-[7px] font-display text-coin font-bold">MAX</div>
                </div>
              </motion.div>
            );
          }
          // Owned but not maxed and not the current next — still show normally
        }

        // The next unlockable — show fully
        if (isNext || (isUnlocked && !maxed)) {
          return (
            <motion.button
              key={upgrade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={canAfford && !maxed ? { scale: 0.97 } : {}}
              onClick={() => !maxed && canAfford && onBuy(upgrade.id)}
              disabled={!canAfford || maxed}
              className={`w-full flex items-center gap-3 p-2.5 border-2 transition-all ${
                canAfford
                  ? 'bg-card/90 border-primary/50 hover:border-primary hover:bg-card cursor-pointer active:bg-primary/10'
                  : 'bg-card/60 border-border/40 opacity-50'
              }`}
            >
              <div className={`p-1.5 ${canAfford ? 'bg-primary/10' : 'bg-muted/30'}`}>
                <PixelIcon id={upgrade.id} size={28} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-display font-semibold text-[7px] text-foreground truncate">{upgrade.name}</div>
                <div className="text-xs font-body text-muted-foreground">{upgrade.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-body text-muted-foreground">{upgrade.level}/{upgrade.maxLevel}</div>
                <div className={`text-xs font-body font-bold ${canAfford ? 'text-chutney' : 'text-muted-foreground'}`}>
                  {formatCurrency(cost)}
                </div>
              </div>
            </motion.button>
          );
        }

        // Future locked items — mysterious
        if (isFuture) {
          return (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full flex items-center gap-3 p-2.5 border-2 border-border/20 bg-card/20 opacity-40"
            >
              <div className="p-1.5 bg-muted/20">
                <div className="w-7 h-7 flex items-center justify-center text-lg text-muted-foreground/50">?</div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-display font-semibold text-[7px] text-muted-foreground/50">???</div>
                <div className="text-xs font-body text-muted-foreground/30">Unlock previous upgrade first</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-body text-muted-foreground/30">🔒</div>
              </div>
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
}
