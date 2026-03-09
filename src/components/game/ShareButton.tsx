import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/hooks/useGameState';
import shareIcon from '@/assets/icons/share.png';

interface Props {
  currency: number;
  totalEarned: number;
  totalProduced: number;
  totalPrestiges: number;
  currentLocationName: string;
  currentLocationIndex: number;
  totalLocations: number;
}

function buildShareText({
  totalEarned, totalProduced, totalPrestiges, currentLocationName, currentLocationIndex, totalLocations,
}: Omit<Props, 'currency'>) {
  const locationProgress = `📍 ${currentLocationName} (${currentLocationIndex + 1}/${totalLocations})`;
  const lines = [
    `🔥 I'm running a wada pav empire in Mumbai!`,
    ``,
    `${locationProgress}`,
    `💰 Total earned: ${formatCurrency(totalEarned)}`,
    `🍽️ ${totalProduced.toLocaleString()} wada pavs served`,
    totalPrestiges > 0 ? `⭐ ${totalPrestiges} prestige${totalPrestiges > 1 ? 's' : ''}` : '',
    ``,
    `Perfect for boring lectures & meetings 😏`,
    `Can you beat my empire? Play free 👇`,
    `https://wadapav.lovable.app`,
  ].filter(Boolean);
  return lines.join('\n');
}

export default function ShareButton(props: Props) {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    const text = buildShareText(props);

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // Last resort
      prompt('Copy this:', text);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleShare}
        className="bg-card/70 backdrop-blur-sm p-1 hover:bg-card/90 transition-colors"
        title="Share your stats"
      >
        <img
          src={shareIcon}
          alt="Share"
          className="w-5 h-5 object-contain [image-rendering:pixelated]"
          draggable={false}
        />
      </motion.button>

      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full right-0 mt-1 bg-card border border-primary/40 px-2 py-1 whitespace-nowrap z-50"
          >
            <span className="text-[8px] font-display text-primary">COPIED!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
