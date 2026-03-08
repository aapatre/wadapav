import { motion } from 'framer-motion';
import { formatCurrency } from '@/hooks/useGameState';
import PixelIcon from './PixelIcon';

interface Props {
  canPrestige: boolean;
  pointsAvailable: number;
  prestigeCostRequired: number;
  currentPoints: number;
  totalEarned: number;
  totalPrestiges: number;
  prestigeMultiplier: number;
  onPrestige: () => void;
  locations: { name: string; icon: string; multiplier: number; prestigeCost: number }[];
  currentLocation: number;
}

export default function PrestigePanel({
  canPrestige, pointsAvailable, currentPoints, totalEarned,
  totalPrestiges, prestigeMultiplier, onPrestige, locations, currentLocation
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-display font-bold text-[10px] text-foreground px-1">&gt;&gt; MUMBAI MAP</h3>

      <div className="bg-card border-2 border-border p-4 space-y-3 pixel-border">
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Total Earned</span>
          <span className="font-bold text-foreground">{formatCurrency(totalEarned)}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-body">
          <span className="text-muted-foreground">Prestige Pts</span>
          <span className="font-bold text-coin flex items-center gap-1">
            <PixelIcon id="star" size={16} /> {currentPoints}
          </span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Bonus</span>
          <span className="font-bold text-chutney">{((prestigeMultiplier - 1) * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Prestiges</span>
          <span className="font-bold text-foreground">{totalPrestiges}</span>
        </div>

        {canPrestige && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPrestige}
            className="w-full py-3 bg-primary text-primary-foreground font-display font-bold text-[9px] pixel-border-primary flex items-center justify-center gap-2"
          >
            <PixelIcon id="star" size={16} /> PRESTIGE +{pointsAvailable} PP
          </motion.button>
        )}

        {!canPrestige && (
          <div className="text-center text-sm font-body text-muted-foreground py-2">
            Earn 1M to unlock prestige...
          </div>
        )}
      </div>

      <h4 className="font-display font-semibold text-[8px] text-foreground px-1 pt-2">&gt; LOCATIONS</h4>
      <div className="space-y-1.5">
        {locations.map((loc, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 p-2 border-2 text-sm font-body ${
              i === currentLocation
                ? 'bg-primary/10 border-primary/40 text-foreground pixel-border-primary'
                : i <= totalPrestiges
                  ? 'border-border text-muted-foreground pixel-border'
                  : 'border-border/30 text-muted-foreground/30 pixel-border'
            }`}
          >
            <PixelIcon id={`loc${i}`} size={24} />
            <span className="flex-1">{loc.name}</span>
            <span className="font-display text-[8px]">{loc.multiplier}x</span>
            {i === currentLocation && <span className="text-primary font-display text-[8px] animate-blink">&lt;</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
