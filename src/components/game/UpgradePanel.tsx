import { Upgrade } from '@/hooks/useGameState';
import { formatCurrency } from '@/hooks/useGameState';
import { motion } from 'framer-motion';
import PixelIcon from './PixelIcon';
import { sfxBuy } from '@/hooks/useSfx';

interface Props {
  upgrades: Upgrade[];
  currency: number;
  onBuy: (id: string) => void;
  getCost: (upgrade: Upgrade) => number;
}

export default function UpgradePanel({ upgrades, currency, onBuy, getCost }: Props) {
  return (
    <div className="space-y-2">
      {upgrades.map((upgrade, i) => {
        const cost = getCost(upgrade);
        const canAfford = currency >= cost;
        const maxed = upgrade.level >= upgrade.maxLevel;

        return (
          <motion.button
            key={upgrade.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={canAfford && !maxed ? { scale: 0.97 } : {}}
            onClick={() => { if (!maxed && canAfford) { sfxBuy(); onBuy(upgrade.id); } }}
            disabled={!canAfford || maxed}
            className={`w-full flex items-center gap-3 p-2.5 border-2 transition-all ${
              maxed
                ? 'bg-muted/30 border-border/50 opacity-40'
                : canAfford
                  ? 'bg-card/90 border-primary/50 hover:border-primary hover:bg-card cursor-pointer active:bg-primary/10'
                  : 'bg-card/60 border-border/40 opacity-50'
            }`}
          >
            <div className={`p-1.5 ${canAfford && !maxed ? 'bg-primary/10' : 'bg-muted/30'}`}>
              <PixelIcon id={upgrade.id} size={28} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-display font-semibold text-[7px] text-foreground truncate">{upgrade.name}</div>
              <div className="text-xs font-body text-muted-foreground">{upgrade.description}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] font-body text-muted-foreground">
                {upgrade.level}/{upgrade.maxLevel}
              </div>
              {!maxed ? (
                <div className={`text-xs font-body font-bold ${canAfford ? 'text-chutney' : 'text-muted-foreground'}`}>
                  {formatCurrency(cost)}
                </div>
              ) : (
                <div className="text-[7px] font-display text-coin font-bold">MAX</div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
