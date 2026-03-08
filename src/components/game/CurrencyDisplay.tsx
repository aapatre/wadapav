import { formatCurrency } from '@/hooks/useGameState';
import { motion } from 'framer-motion';
import PixelIcon from './PixelIcon';

interface Props {
  currency: number;
  perSecond: number;
  location: { name: string; icon: string; multiplier: number };
  prestigePoints: number;
}

export default function CurrencyDisplay({ currency, perSecond, location, prestigePoints }: Props) {
  return (
    <div className="text-center py-3 px-4">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-sm font-body text-muted-foreground">{location.name}</span>
        {location.multiplier > 1 && (
          <span className="text-sm bg-secondary/30 text-secondary px-2 py-0.5 font-body">
            {location.multiplier}x
          </span>
        )}
      </div>
      <motion.div
        key={Math.floor(currency)}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        className="text-2xl font-display font-extrabold text-primary drop-shadow-[0_0_10px_hsl(var(--coin-gold)/0.5)]"
      >
        {formatCurrency(currency)}
      </motion.div>
      <div className="flex items-center justify-center gap-4 mt-1 text-sm font-body text-muted-foreground">
        <span>{formatCurrency(perSecond)}/sec</span>
        {prestigePoints > 0 && (
          <span className="text-coin flex items-center gap-1">
            <PixelIcon id="star" size={14} /> {prestigePoints} PP
          </span>
        )}
      </div>
    </div>
  );
}
