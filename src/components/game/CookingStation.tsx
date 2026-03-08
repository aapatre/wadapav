import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import wadapavImg from '@/assets/wadapav.png';
import { formatCurrency } from '@/hooks/useGameState';

interface FloatingText {
  id: number;
  amount: number;
  x: number;
  y: number;
  isCombo: boolean;
}

interface Props {
  tapPower: number;
  tapMultiplier: number;
  prestigeMultiplier: number;
  locationMultiplier: number;
  comboCount: number;
  onTap: () => void;
}

let floatId = 0;

export default function CookingStation({ tapPower, tapMultiplier, prestigeMultiplier, locationMultiplier, comboCount, onTap }: Props) {
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    onTap();
    const isCombo = comboCount >= 2;
    const earned = tapPower * tapMultiplier * prestigeMultiplier * locationMultiplier * (isCombo ? 1.5 : 1);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? rect.left + rect.width / 2;
      clientY = e.touches[0]?.clientY ?? rect.top;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const id = ++floatId;
    setFloats(prev => [...prev.slice(-8), {
      id,
      amount: earned,
      x: clientX - rect.left,
      y: clientY - rect.top,
      isCombo,
    }]);

    setTimeout(() => {
      setFloats(prev => prev.filter(f => f.id !== id));
    }, 800);

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
  }, [onTap, tapPower, tapMultiplier, prestigeMultiplier, locationMultiplier, comboCount]);

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      {/* Steam effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-muted-foreground/30 animate-steam"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {comboCount >= 3 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2 right-4 bg-accent text-accent-foreground font-display font-bold text-[8px] px-2 py-1 z-10 pixel-border-primary animate-blink"
          >
            COMBO x{comboCount}! 🔥
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main tap area */}
      <motion.button
        onMouseDown={handleTap}
        onTouchStart={handleTap}
        whileTap={{ scale: 0.92 }}
        className={`relative cursor-pointer select-none transition-all duration-150 p-2 ${
          isPressed ? 'animate-sizzle' : ''
        }`}
        style={{
          filter: isPressed ? 'brightness(1.3)' : 'brightness(1)',
        }}
      >
        <img
          src={wadapavImg}
          alt="Wada Pav"
          className="w-40 h-40 object-contain drop-shadow-[0_0_15px_hsl(var(--coin-gold)/0.4)] pointer-events-none"
          draggable={false}
        />
        {/* Glow ring */}
        <div className="absolute inset-2 animate-pulse-glow pointer-events-none" />
      </motion.button>

      <p className="text-sm font-body text-muted-foreground mt-2">
        TAP TO COOK! ({formatCurrency(tapPower * tapMultiplier * prestigeMultiplier * locationMultiplier)}/tap)
      </p>

      {/* Floating currency texts */}
      <AnimatePresence>
        {floats.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute pointer-events-none font-display font-bold ${
              f.isCombo ? 'text-accent text-[10px]' : 'text-coin text-xs'
            }`}
            style={{ left: f.x, top: f.y }}
          >
            +{formatCurrency(f.amount)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
