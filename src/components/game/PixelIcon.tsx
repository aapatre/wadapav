// Pixel art icon imports
import potato from '@/assets/icons/potato.png';
import frypan from '@/assets/icons/frypan.png';
import bread from '@/assets/icons/bread.png';
import chutney from '@/assets/icons/chutney.png';
import scooter from '@/assets/icons/scooter.png';
import manager from '@/assets/icons/manager.png';
import knife from '@/assets/icons/knife.png';
import tawa from '@/assets/icons/tawa.png';
import oil from '@/assets/icons/oil.png';
import spices from '@/assets/icons/spices.png';
import scroll from '@/assets/icons/scroll.png';
import station from '@/assets/icons/station.png';
import heritage from '@/assets/icons/heritage.png';
import beach from '@/assets/icons/beach.png';
import office from '@/assets/icons/office.png';
import carnival from '@/assets/icons/carnival.png';
import airport from '@/assets/icons/airport.png';
import star from '@/assets/icons/star.png';
import gear from '@/assets/icons/gear.png';
import tapFinger from '@/assets/icons/tap-finger.png';
import fire from '@/assets/icons/fire.png';
import crew from '@/assets/icons/crew.png';
import crystalBall from '@/assets/icons/crystal-ball.png';
import party from '@/assets/icons/party.png';
import rocket from '@/assets/icons/rocket.png';
import lightning from '@/assets/icons/lightning.png';
import chartUp from '@/assets/icons/chart-up.png';
import heart from '@/assets/icons/heart.png';
import city from '@/assets/icons/city.png';
import burger from '@/assets/icons/burger.png';
import gift from '@/assets/icons/gift.png';
import coolFace from '@/assets/icons/cool-face.png';
import moneyBag from '@/assets/icons/money-bag.png';
import muscle from '@/assets/icons/muscle.png';
import handshake from '@/assets/icons/handshake.png';

export const ICON_MAP: Record<string, string> = {
  // Workers
  masher: potato,
  fryer: frypan,
  slicer: bread,
  chutney: chutney,
  delivery: scooter,
  manager: manager,
  // Upgrades
  tap1: potato,
  tap2: knife,
  tap3: tawa,
  mult1: oil,
  mult2: spices,
  mult3: scroll,
  // Locations
  loc0: station,
  loc1: heritage,
  loc2: beach,
  loc3: office,
  loc4: carnival,
  loc5: airport,
  // UI
  star: star,
  gear: gear,
  // Emoji replacements
  'tap-finger': tapFinger,
  fire: fire,
  crew: crew,
  'crystal-ball': crystalBall,
  party: party,
  rocket: rocket,
  lightning: lightning,
  'chart-up': chartUp,
  heart: heart,
  city: city,
  burger: burger,
  gift: gift,
  'cool-face': coolFace,
  'money-bag': moneyBag,
  muscle: muscle,
  handshake: handshake,
};

interface PixelIconProps {
  id: string;
  size?: number;
  className?: string;
}

export default function PixelIcon({ id, size = 28, className = '' }: PixelIconProps) {
  const src = ICON_MAP[id];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={id}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
