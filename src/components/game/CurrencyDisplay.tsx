import { formatCurrency } from '@/hooks/useGameState';
import { motion } from 'framer-motion';

interface Props {
  currency: number;
  perSecond: number;
  location: { name: string; emoji: string; multiplier: number };
  prestigePoints: number;
}

export default function CurrencyDisplay({ currency, perSecond, location, prestigePoints }: Props) {
  return (
    <div className="text-center py-3 px-4">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-sm font-body text-muted-foreground">{location.emoji} {location.name}</span>
        {location.multiplier > 1 && (
          <span className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded-full font-body">
            {location.multiplier}x
          </span>
        )}
      </div>
      <motion.div
        key={Math.floor(currency)}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        className="text-4xl font-display font-extrabold text-primary"
      >
        {formatCurrency(currency)}
      </motion.div>
      <div className="flex items-center justify-center gap-4 mt-1 text-sm font-body text-muted-foreground">
        <span>{formatCurrency(perSecond)}/sec</span>
        {prestigePoints > 0 && (
          <span className="text-coin">⭐ {prestigePoints} PP</span>
        )}
      </div>
    </div>
  );
}
