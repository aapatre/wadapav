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
      <h3 className="font-display font-bold text-[10px] text-foreground px-1">&gt;&gt; CREW</h3>
      {workers.map(worker => {
        const cost = getCost(worker);
        const canAfford = currency >= cost;

        return (
          <motion.button
            key={worker.id}
            whileTap={canAfford ? { scale: 0.97 } : {}}
            onClick={() => canAfford && onBuy(worker.id)}
            disabled={!canAfford}
            className={`w-full flex items-center gap-3 p-3 border-2 transition-all ${
              canAfford
                ? 'bg-card border-primary/40 hover:border-primary cursor-pointer pixel-border-primary'
                : 'bg-card border-border opacity-60 pixel-border'
            }`}
          >
            <span className="font-display text-[10px] text-primary">{worker.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-display font-semibold text-[8px] text-foreground">
                {worker.name}
                {worker.quantity > 0 && (
                  <span className="ml-2 text-[8px] bg-primary/20 text-primary px-1.5 py-0.5">
                    x{worker.quantity}
                  </span>
                )}
              </div>
              <div className="text-sm font-body text-muted-foreground">
                {worker.description} | {formatCurrency(worker.baseProduction)}/s
              </div>
            </div>
            <div className={`text-sm font-body font-bold ${canAfford ? 'text-chutney' : 'text-muted-foreground'}`}>
              {formatCurrency(cost)}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
