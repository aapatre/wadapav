import { Upgrade } from '@/hooks/useGameState';
import { formatCurrency } from '@/hooks/useGameState';
import { motion } from 'framer-motion';

interface Props {
  upgrades: Upgrade[];
  currency: number;
  onBuy: (id: string) => void;
  getCost: (upgrade: Upgrade) => number;
}

export default function UpgradePanel({ upgrades, currency, onBuy, getCost }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="font-display font-bold text-lg text-foreground px-1">🔧 Upgrades</h3>
      {upgrades.map(upgrade => {
        const cost = getCost(upgrade);
        const canAfford = currency >= cost;
        const maxed = upgrade.level >= upgrade.maxLevel;

        return (
          <motion.button
            key={upgrade.id}
            whileTap={canAfford && !maxed ? { scale: 0.97 } : {}}
            onClick={() => !maxed && canAfford && onBuy(upgrade.id)}
            disabled={!canAfford || maxed}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              maxed
                ? 'bg-muted/50 border-border opacity-60'
                : canAfford
                  ? 'bg-card border-primary/30 hover:border-primary/60 cursor-pointer shadow-sm'
                  : 'bg-card border-border opacity-70'
            }`}
          >
            <span className="text-2xl">{upgrade.emoji}</span>
            <div className="flex-1 text-left">
              <div className="font-display font-semibold text-sm text-foreground">{upgrade.name}</div>
              <div className="text-xs font-body text-muted-foreground">{upgrade.description}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-body text-muted-foreground">Lv.{upgrade.level}/{upgrade.maxLevel}</div>
              {!maxed && (
                <div className={`text-sm font-display font-bold ${canAfford ? 'text-chutney' : 'text-muted-foreground'}`}>
                  {formatCurrency(cost)}
                </div>
              )}
              {maxed && <div className="text-xs font-display text-coin font-bold">MAX</div>}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
