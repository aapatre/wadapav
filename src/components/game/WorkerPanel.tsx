import { Worker } from '@/hooks/useGameState';
import { formatCurrency } from '@/hooks/useGameState';
import { motion } from 'framer-motion';
import PixelIcon from './PixelIcon';

interface Props {
  workers: Worker[];
  currency: number;
  onBuy: (id: string) => void;
  getCost: (worker: Worker) => number;
}

export default function WorkerPanel({ workers, currency, onBuy, getCost }: Props) {
  return (
    <div className="space-y-2">
      {workers.map((worker, i) => {
        const cost = getCost(worker);
        const canAfford = currency >= cost;

        return (
          <motion.button
            key={worker.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={canAfford ? { scale: 0.97 } : {}}
            onClick={() => canAfford && onBuy(worker.id)}
            disabled={!canAfford}
            className={`w-full flex items-center gap-3 p-2.5 border-2 transition-all ${
              canAfford
                ? 'bg-card/90 border-primary/50 hover:border-primary hover:bg-card cursor-pointer active:bg-primary/10'
                : 'bg-card/60 border-border/40 opacity-50'
            }`}
          >
            <div className={`p-1.5 relative ${canAfford ? 'bg-primary/10' : 'bg-muted/30'}`}>
              <PixelIcon id={worker.id} size={28} />
              {worker.quantity > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[7px] font-display bg-primary text-primary-foreground px-0.5">
                  {worker.quantity}
                </span>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-display font-semibold text-[7px] text-foreground truncate">{worker.name}</div>
              <div className="text-xs font-body text-muted-foreground">
                {formatCurrency(worker.baseProduction)}/s each
              </div>
            </div>
            <div className={`text-xs font-body font-bold shrink-0 ${canAfford ? 'text-chutney' : 'text-muted-foreground'}`}>
              {formatCurrency(cost)}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
