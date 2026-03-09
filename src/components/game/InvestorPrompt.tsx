import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/hooks/useGameState';
import handshakeIcon from '@/assets/icons/handshake.png';

interface Props {
  totalEarned: number;
  totalProduced: number;
  totalPrestiges: number;
  currentLocationName: string;
  currentLocationIndex: number;
  totalLocations: number;
  onAccept: (reward: number) => void;
  onDecline: () => void;
}

// Rewards scale per location
const LOCATION_REWARDS = [50_000, 150_000, 500_000, 1_500_000, 5_000_000, 15_000_000];
const TRIGGER_THRESHOLDS = [105_000, 1_000_000, 5_000_000, 25_000_000, 100_000_000, 500_000_000];

function getStorageKey(locationIndex: number) {
  return `wadapav-investor-${locationIndex}`;
}

function buildShareText({
  totalEarned, totalProduced, totalPrestiges, currentLocationName, currentLocationIndex, totalLocations,
}: Omit<Props, 'onAccept' | 'onDecline'>) {
  const locationProgress = `📍 ${currentLocationName} (${currentLocationIndex + 1}/${totalLocations})`;
  const lines = [
    `🔥 I'm running a wada pav empire in Mumbai!`,
    ``,
    `${locationProgress}`,
    `💰 Total earned: ${formatCurrency(totalEarned)}`,
    `🍽️ ${totalProduced.toLocaleString()} wada pavs served`,
    totalPrestiges > 0 ? `⭐ ${totalPrestiges} prestige${totalPrestiges > 1 ? 's' : ''}` : '',
    ``,
    `An investor just funded my cart! 💼`,
    `Perfect for boring lectures & meetings 😏`,
    `Can you beat my empire? Play free 👇`,
    `https://wadapav.lovable.app`,
  ].filter(Boolean);
  return lines.join('\n');
}

export default function InvestorPrompt(props: Props) {
  const { currentLocationIndex, totalEarned, onAccept, onDecline } = props;
  const [show, setShow] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const reward = LOCATION_REWARDS[currentLocationIndex] || 50_000;
  const threshold = TRIGGER_THRESHOLDS[currentLocationIndex] || 105_000;

  useEffect(() => {
    const storageKey = getStorageKey(currentLocationIndex);
    const alreadyShown = localStorage.getItem(storageKey);
    
    if (alreadyShown || hasTriggered) return;

    if (totalEarned >= threshold) {
      // Random delay between 5-20 seconds after threshold
      const delay = 5000 + Math.random() * 15000;
      const timer = setTimeout(() => {
        setShow(true);
        setHasTriggered(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [totalEarned, threshold, currentLocationIndex, hasTriggered]);

  const handleShare = async () => {
    const text = buildShareText(props);
    const storageKey = getStorageKey(currentLocationIndex);

    let shared = false;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        shared = true;
      } catch {
        // User cancelled
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(text);
        shared = true;
      } catch {
        prompt('Copy this:', text);
        shared = true;
      }
    }

    if (shared) {
      localStorage.setItem(storageKey, 'true');
      onAccept(reward);
      setShow(false);
    }
  };

  const handleDecline = () => {
    const storageKey = getStorageKey(currentLocationIndex);
    localStorage.setItem(storageKey, 'true');
    onDecline();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-card border-2 border-primary p-4 max-w-xs w-full text-center"
          >
            <img
              src={handshakeIcon}
              alt="Investor"
              className="w-12 h-12 mx-auto mb-3 [image-rendering:pixelated]"
              draggable={false}
            />
            
            <h2 className="font-display text-base text-primary mb-2">INVESTOR ALERT!</h2>
            
            <p className="text-sm text-foreground/80 mb-3">
              A business tycoon noticed your thriving wada pav cart! They'll invest{' '}
              <span className="text-primary font-bold">{formatCurrency(reward)}</span>{' '}
              if you spread the word about your empire!
            </p>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDecline}
                className="flex-1 bg-muted/50 border border-border px-3 py-2 text-xs font-display text-foreground/60 hover:bg-muted transition-colors"
              >
                NOT NOW
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex-1 bg-primary text-primary-foreground px-3 py-2 text-xs font-display hover:bg-primary/90 transition-colors"
              >
                SHARE & EARN
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
