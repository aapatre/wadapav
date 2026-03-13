import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/hooks/useGameState';
import crownIcon from '@/assets/icons/crown.png';

interface Props {
  currency: number;
  currentLocation: number;
  totalEarned: number;
  totalProduced: number;
  totalPrestiges: number;
  currentLocationName: string;
  currentLocationIndex: number;
  totalLocations: number;
  onAccept: (reward: number) => void;
}

const STORAGE_KEY = 'wadapav-award-prompt';
const THRESHOLD = 5_000;
const REWARD = 300_000;

function buildShareText({
  totalEarned, totalProduced, totalPrestiges, currentLocationName, currentLocationIndex, totalLocations,
}: Pick<Props, 'totalEarned' | 'totalProduced' | 'totalPrestiges' | 'currentLocationName' | 'currentLocationIndex' | 'totalLocations'>) {
  const locationProgress = `📍 ${currentLocationName} (${currentLocationIndex + 1}/${totalLocations})`;
  const lines = [
    `🔥 I'm running a wada pav empire in Mumbai!`,
    ``,
    `${locationProgress}`,
    `💰 Total earned: ${formatCurrency(totalEarned)}`,
    `🍽️ ${totalProduced.toLocaleString()} wada pavs served`,
    totalPrestiges > 0 ? `⭐ ${totalPrestiges} prestige${totalPrestiges > 1 ? 's' : ''}` : '',
    ``,
    `🏆 Just won "Best Wada Pav in Mumbai"!`,
    `Perfect for boring lectures & meetings 😏`,
    `Can you beat my empire? Play free 👇`,
    `https://wadapav.lovable.app`,
  ].filter(Boolean);
  return lines.join('\n');
}

export default function AwardPrompt(props: Props) {
  const { currency, currentLocation, onAccept } = props;
  const [show, setShow] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (triggeredRef.current) return;
    if (currentLocation !== 1) return; // Gateway of India only
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (currency < THRESHOLD) return;

    triggeredRef.current = true;
    const delay = 2000 + Math.random() * 3000;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [currency, currentLocation]);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleShare = async () => {
    const text = buildShareText(props);
    let shared = false;

    if (isMobile && navigator.share) {
      try {
        await navigator.share({ text });
        shared = true;
      } catch { /* cancelled */ }
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
      localStorage.setItem(STORAGE_KEY, 'true');
      onAccept(REWARD);
      setShow(false);
    }
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
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
              src={crownIcon}
              alt="Award"
              className="w-12 h-12 mx-auto mb-3 [image-rendering:pixelated]"
              draggable={false}
            />

            <h2 className="font-display text-base text-primary mb-2">🏆 BEST WADA PAV!</h2>

            <p className="text-sm text-foreground/80 mb-3">
              Congratulations! Your wada pav has won the award for{' '}
              <span className="text-primary font-bold">"Best Wada Pav in Mumbai"</span>!
              You'll receive a cash prize of{' '}
              <span className="text-primary font-bold">{formatCurrency(REWARD)}</span>,
              but first you have to share the news with your friends!
            </p>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDecline}
                className="flex-1 bg-muted/50 border border-border px-3 py-2 text-sm font-display text-foreground/60 hover:bg-muted transition-colors"
              >
                NOT NOW
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex-1 bg-primary text-primary-foreground px-3 py-2 text-sm font-display hover:bg-primary/90 transition-colors"
              >
                SHARE & CLAIM
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
