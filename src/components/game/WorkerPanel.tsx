import { Worker } from '@/hooks/useGameState';
import { formatCurrency } from '@/hooks/useGameState';
import { motion } from 'framer-motion';

interface Props {
  workers: Worker[];
  currency: number;
  onBuy: (id: string) => void;
  getCost: (worker: Worker) => number;
}

export default function WorkerPanel({ workers, currency, onBuy, getCost }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="font-display font-bold text-lg text-foreground px-1">👥 Workers</h3>
      {workers.map(worker => {
        const cost = getCost(worker);
        const canAfford = currency >= cost;

        return (
          <motion.button
            key={worker.id}
            whileTap={canAfford ? { scale: 0.97 } : {}}
            onClick={() => canAfford && onBuy(worker.id)}
            disabled={!canAfford}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              canAfford
                ? 'bg-card border-primary/30 hover:border-primary/60 cursor-pointer shadow-sm'
                : 'bg-card border-border opacity-70'
            }`}
          >
            <span className="text-2xl">{worker.emoji}</span>
            <div className="flex-1 text-left">
              <div className="font-display font-semibold text-sm text-foreground">
                {worker.name}
                {worker.quantity > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    x{worker.quantity}
                  </span>
                )}
              </div>
              <div className="text-xs font-body text-muted-foreground">
                {worker.description} • {formatCurrency(worker.baseProduction)}/sec each
              </div>
            </div>
            <div className={`text-sm font-display font-bold ${canAfford ? 'text-chutney' : 'text-muted-foreground'}`}>
              {formatCurrency(cost)}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
