import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/hooks/useGameState';

interface Props {
  canPrestige: boolean;
  pointsAvailable: number;
  currentPoints: number;
  totalEarned: number;
  totalPrestiges: number;
  prestigeMultiplier: number;
  onPrestige: () => void;
  locations: { name: string; emoji: string; multiplier: number }[];
  currentLocation: number;
}

export default function PrestigePanel({
  canPrestige, pointsAvailable, currentPoints, totalEarned,
  totalPrestiges, prestigeMultiplier, onPrestige, locations, currentLocation
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-display font-bold text-lg text-foreground px-1">🌟 Mumbai Expansion</h3>

      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Total Earned</span>
          <span className="font-semibold text-foreground">{formatCurrency(totalEarned)}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Prestige Points</span>
          <span className="font-semibold text-coin">⭐ {currentPoints}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Earnings Bonus</span>
          <span className="font-semibold text-chutney">{((prestigeMultiplier - 1) * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Total Prestiges</span>
          <span className="font-semibold text-foreground">{totalPrestiges}</span>
        </div>

        {canPrestige && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPrestige}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-coin to-secondary font-display font-bold text-secondary-foreground shadow-lg"
          >
            ⭐ Prestige for {pointsAvailable} PP
          </motion.button>
        )}

        {!canPrestige && (
          <div className="text-center text-xs font-body text-muted-foreground py-2">
            Earn ₹1M total to unlock prestige
          </div>
        )}
      </div>

      <h4 className="font-display font-semibold text-sm text-foreground px-1 pt-2">📍 Locations</h4>
      <div className="space-y-1.5">
        {locations.map((loc, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm font-body ${
              i === currentLocation
                ? 'bg-primary/10 border border-primary/30 text-foreground'
                : i <= totalPrestiges
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/40'
            }`}
          >
            <span>{loc.emoji}</span>
            <span className="flex-1">{loc.name}</span>
            <span className="text-xs">{loc.multiplier}x</span>
            {i === currentLocation && <span className="text-xs text-primary font-semibold">📍</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
