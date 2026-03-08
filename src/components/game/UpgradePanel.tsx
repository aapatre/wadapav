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
      <h3 className="font-display font-bold text-[10px] text-foreground px-1">&gt;&gt; UPGRADES</h3>
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
            className={`w-full flex items-center gap-3 p-3 border-2 transition-all ${
              maxed
                ? 'bg-muted/50 border-border opacity-50 pixel-border'
                : canAfford
                  ? 'bg-card border-primary/40 hover:border-primary cursor-pointer pixel-border-primary'
                  : 'bg-card border-border opacity-60 pixel-border'
            }`}
          >
            <span className="font-display text-[10px] text-primary">{upgrade.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-display font-semibold text-[8px] text-foreground">{upgrade.name}</div>
              <div className="text-sm font-body text-muted-foreground">{upgrade.description}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-body text-muted-foreground">Lv.{upgrade.level}/{upgrade.maxLevel}</div>
              {!maxed && (
                <div className={`text-sm font-body font-bold ${canAfford ? 'text-chutney' : 'text-muted-foreground'}`}>
                  {formatCurrency(cost)}
                </div>
              )}
              {maxed && <div className="text-[8px] font-display text-coin font-bold">MAX</div>}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
