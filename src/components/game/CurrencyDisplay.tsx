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
    <div className="text-center py-2 px-4">
      {/* Location badge */}
      <div className="inline-flex items-center gap-2 mb-2 bg-card/80 backdrop-blur-sm px-3 py-1 pixel-border">
        <span className="text-sm font-body text-foreground">{location.name}</span>
        {location.multiplier > 1 && (
          <span className="text-[8px] font-display bg-primary/20 text-primary px-1.5 py-0.5">
            {location.multiplier}x
          </span>
        )}
      </div>

      {/* Main currency */}
      <motion.div
        key={Math.floor(currency)}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        className="text-3xl font-display font-extrabold text-primary drop-shadow-[0_0_15px_hsl(var(--coin-gold)/0.6)]"
      >
        {formatCurrency(currency)}
      </motion.div>

      {/* Sub stats */}
      <div className="flex items-center justify-center gap-4 mt-1">
        <span className="text-sm font-body text-muted-foreground bg-card/40 backdrop-blur-sm px-2 py-0.5 border border-border/30">
          {formatCurrency(perSecond)}/sec
        </span>
        {prestigePoints > 0 && (
          <span className="text-sm font-body text-coin flex items-center gap-1">
            <PixelIcon id="star" size={14} /> {prestigePoints}
          </span>
        )}
      </div>
    </div>
  );
}
