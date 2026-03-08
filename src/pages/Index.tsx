import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import CurrencyDisplay from '@/components/game/CurrencyDisplay';
import CookingStation from '@/components/game/CookingStation';
import UpgradePanel from '@/components/game/UpgradePanel';
import WorkerPanel from '@/components/game/WorkerPanel';
import PrestigePanel from '@/components/game/PrestigePanel';
import PixelIcon from '@/components/game/PixelIcon';
import WelcomeTutorial, { hasSeenTutorial, hasSeenCrewHint } from '@/components/game/WelcomeTutorial';
import { CrewHintPrompt } from '@/components/game/WelcomeTutorial';
import MusicPlayer from '@/components/game/MusicPlayer';

import bgCST from '@/assets/backgrounds/cst-station.png';
import bgGateway from '@/assets/backgrounds/gateway-of-india.png';
import bgJuhu from '@/assets/backgrounds/juhu-beach.png';
import bgBKC from '@/assets/backgrounds/bkc-business.png';
import bgGirgaon from '@/assets/backgrounds/girgaon.png';
import bgAirport from '@/assets/backgrounds/mumbai-airport.png';

const LOCATION_BACKGROUNDS: Record<string, string> = {
  'cst-station': bgCST,
  'gateway-of-india': bgGateway,
  'juhu-beach': bgJuhu,
  'bkc-business': bgBKC,
  'girgaon': bgGirgaon,
  'mumbai-airport': bgAirport,
};

type Tab = 'upgrades' | 'workers' | 'prestige';

const Index = () => {
  const {
    state, tap, buyWorker, buyUpgrade, prestige, stealCurrency,
    canPrestige, prestigePointsAvailable, prestigeCostRequired,
    getWorkerCost, getUpgradeCost, locations, formatCurrency,
  } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('upgrades');
  const [showTutorial, setShowTutorial] = useState(() => !hasSeenTutorial());
  const [showCrewHint, setShowCrewHint] = useState(false);
  const crewHintShownRef = useRef(hasSeenCrewHint());

  // Show crew hint when player can afford first worker (₹500)
  const firstWorkerCost = getWorkerCost(state.workers[0]);
  const hasAnyWorker = state.workers.some(w => w.quantity > 0);
  useEffect(() => {
    if (!crewHintShownRef.current && !showTutorial && !hasAnyWorker && state.currency >= firstWorkerCost) {
      crewHintShownRef.current = true;
      setShowCrewHint(true);
    }
  }, [state.currency, firstWorkerCost, showTutorial, hasAnyWorker]);

  const currentLocation = locations[state.currentLocation];

  const tabs: { key: Tab; label: string; iconId: string }[] = [
    { key: 'upgrades', label: 'UPGRADES', iconId: 'tap3' },
    { key: 'workers', label: 'CREW', iconId: 'masher' },
    { key: 'prestige', label: 'PRESTIGE', iconId: 'star' },
  ];

  return (
    <div className="h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Welcome tutorial for first-time players */}
      <AnimatePresence>
        {showTutorial && (
          <WelcomeTutorial
            onComplete={() => setShowTutorial(false)}
          />
        )}
      </AnimatePresence>

      {/* Crew hire hint — shown when player can afford first worker */}
      <AnimatePresence>
        {showCrewHint && (
          <CrewHintPrompt
            onComplete={() => setShowCrewHint(false)}
            onSwitchToCrewTab={() => setActiveTab('workers')}
          />
        )}
      </AnimatePresence>

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0%) 2px, hsl(0 0% 0%) 4px)',
        }}
      />

      {/* ===== TOP HALF: Game Scene ===== */}
      <div className="relative flex-shrink-0" style={{ minHeight: '46vh' }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${LOCATION_BACKGROUNDS[currentLocation.bg]})`,
          }}
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* HUD - Title bar */}
        <div className="relative z-[60] flex items-center justify-between px-3 pt-3 pb-1">
          <h1 className="text-[7px] font-display font-extrabold text-primary tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            WADA PAV TYCOON
          </h1>
          <div className="flex items-center gap-1">
            <MusicPlayer />
            <div className="bg-card/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-body text-muted-foreground">
              {state.totalProduced.toLocaleString()} served
            </div>
          </div>
        </div>

        {/* Nudge: earn ₹500 for a surprise */}
        <AnimatePresence>
          {!showTutorial && !hasAnyWorker && !showCrewHint && state.currency < firstWorkerCost && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 mx-3 mt-1"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-accent/50 px-3 py-1.5 flex items-center justify-center gap-2 animate-pulse">
                <span className="text-[10px] font-display text-accent">🎁</span>
                <span className="text-[10px] font-body text-foreground/80">
                  Earn <span className="font-bold text-coin">₹500</span> to unlock a surprise!
                </span>
                <span className="text-[10px] font-display text-accent">🎁</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Currency HUD */}
        <div className="relative z-10">
          <CurrencyDisplay
            currency={state.currency}
            perSecond={state.productionPerSecond}
            location={currentLocation}
            prestigePoints={state.prestigePoints}
          />
        </div>

        {/* Cart + Cooking area - fills remaining top space */}
        <div className="relative z-10 flex-1">
          <CookingStation
            tapPower={state.tapPower}
            tapMultiplier={state.tapMultiplier}
            prestigeMultiplier={state.prestigeMultiplier}
            locationMultiplier={currentLocation.multiplier}
            comboCount={state.comboCount}
            onTap={tap}
            hasCrewMember={state.workers.some(w => w.quantity > 0)}
          />
        </div>
      </div>

      {/* ===== BOTTOM HALF: Shop Panel ===== */}
      <div className="flex-1 flex flex-col min-h-0 bg-card/95 backdrop-blur-sm border-t-2 border-primary/30">
        {/* Tab Bar */}
        <div className="flex shrink-0 border-b border-border/50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-[7px] font-display transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === tab.key
                  ? 'text-primary bg-background/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <PixelIcon id={tab.iconId} size={16} />
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-2.5 pb-4">
          <AnimatePresence mode="wait">
            {activeTab === 'upgrades' && (
              <motion.div key="upgrades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <UpgradePanel
                  upgrades={state.upgrades}
                  currency={state.currency}
                  onBuy={buyUpgrade}
                  getCost={getUpgradeCost}
                />
              </motion.div>
            )}
            {activeTab === 'workers' && (
              <motion.div key="workers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <WorkerPanel
                  workers={state.workers}
                  currency={state.currency}
                  onBuy={buyWorker}
                  getCost={getWorkerCost}
                />
              </motion.div>
            )}
            {activeTab === 'prestige' && (
              <motion.div key="prestige" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <PrestigePanel
                  canPrestige={canPrestige}
                  pointsAvailable={prestigePointsAvailable}
                  prestigeCostRequired={prestigeCostRequired}
                  currentPoints={state.prestigePoints}
                  totalEarned={state.totalEarned}
                  totalPrestiges={state.totalPrestiges}
                  prestigeMultiplier={state.prestigeMultiplier}
                  onPrestige={prestige}
                  locations={locations}
                  currentLocation={state.currentLocation}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;
