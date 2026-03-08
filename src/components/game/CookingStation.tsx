import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cartScene from '@/assets/cart-scene.png';
import CustomerCrowd from './CustomerCrowd';
import ThiefCharacter from './ThiefCharacter';
import PixelIcon from './PixelIcon';
import { formatCurrency } from '@/hooks/useGameState';
import { sfxTap, sfxComboStart, sfxComboUp } from '@/hooks/useSfx';

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
  hasCrewMember: boolean;
  currency: number;
  productionPerSecond: number;
  onSteal: (amount: number) => void;
}

let floatId = 0;

export default function CookingStation({ tapPower, tapMultiplier, prestigeMultiplier, locationMultiplier, comboCount, onTap, hasCrewMember, currency, productionPerSecond, onSteal }: Props) {
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const lastComboTierRef = useRef(0);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    onTap();
    sfxTap();

    // Detect combo tier changes for SFX
    const newCombo = comboCount + 1;
    const tier = newCombo >= 100 ? 3 : newCombo >= 50 ? 2 : newCombo >= 20 ? 1 : 0;
    if (tier > 0 && tier !== lastComboTierRef.current) {
      if (tier === 1) sfxComboStart();
      else sfxComboUp();
    }
    lastComboTierRef.current = tier;

    const isCombo = comboCount >= 20;
    const comboMultiplier = comboCount >= 100 ? 2 : comboCount >= 50 ? 1.8 : comboCount >= 20 ? 1.2 : 1;
    const earned = tapPower * tapMultiplier * prestigeMultiplier * locationMultiplier * comboMultiplier;

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
    setTapCount(prev => prev + 1);
    setTimeout(() => setIsPressed(false), 150);
  }, [onTap, tapPower, tapMultiplier, prestigeMultiplier, locationMultiplier, comboCount]);

  return (
    <motion.button
      onMouseDown={handleTap}
      onTouchStart={handleTap}
      className="relative w-full h-full flex flex-col items-center justify-end cursor-pointer select-none"
      whileTap={{ scale: 0.98 }}
      style={{
        filter: isPressed ? 'brightness(1.15)' : 'brightness(1)',
      }}
    >
      {/* Combo indicator */}
      <AnimatePresence>
        {comboCount >= 20 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-display font-bold text-[8px] px-3 py-1 z-20 pixel-border-primary animate-blink flex items-center gap-1"
          >
            <PixelIcon id="fire" size={12} /> COMBO x{comboCount}! {comboCount >= 100 ? '2x' : comboCount >= 50 ? '1.8x' : '1.2x'} <PixelIcon id="fire" size={12} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customers behind cart — only when crew is hired */}
      {hasCrewMember && <CustomerCrowd />}
      <ThiefCharacter currency={currency} productionPerSecond={productionPerSecond} onSteal={onSteal} />

      {/* Tap hint — visible until first tap */}
      <AnimatePresence>
        {tapCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-4xl"
            >
              👆
            </motion.div>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-display text-[9px] text-coin tracking-[0.2em] bg-background/70 px-3 py-1"
            >
              TAP THE CART!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart scene - centered */}
      <div className="relative mb-2 flex justify-center z-10">
        <motion.img
          src={cartScene}
          alt="Wada Pav Cart - Tap to cook!"
          className="w-[270px] h-auto object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{
            imageRendering: 'pixelated',
            filter: isPressed ? 'drop-shadow(0 0 12px hsl(var(--coin-gold)))' : 'none',
          }}
          draggable={false}
          animate={
            tapCount === 0
              ? { scale: [1, 1.03, 1] }
              : isPressed
              ? { rotate: [0, -2, 2, -1, 0] }
              : {}
          }
          transition={tapCount === 0 ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
        {/* Sizzle particles */}
        <AnimatePresence>
          {isPressed && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`sizzle-${tapCount}-${i}`}
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 0,
                    x: (Math.random() - 0.5) * 60,
                    y: -20 - Math.random() * 30,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-coin rounded-none"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Per tap display */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="text-sm font-body text-muted-foreground">
          TAP TO COOK
        </span>
        <span className="text-sm font-body font-bold text-coin">
          {formatCurrency(tapPower * tapMultiplier * prestigeMultiplier * locationMultiplier)}/tap
        </span>
      </div>

      {/* Floating currency texts */}
      <AnimatePresence>
        {floats.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -70, scale: f.isCombo ? 1.3 : 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute pointer-events-none font-display font-bold z-30 ${
              f.isCombo ? 'text-accent text-[11px]' : 'text-coin text-[9px]'
            }`}
            style={{ left: f.x, top: f.y }}
          >
            +{formatCurrency(f.amount)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
