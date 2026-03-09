import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import CurrencyDisplay from '@/components/game/CurrencyDisplay';
import CookingStation from '@/components/game/CookingStation';
import UpgradePanel from '@/components/game/UpgradePanel';
import WorkerPanel from '@/components/game/WorkerPanel';
import PrestigePanel from '@/components/game/PrestigePanel';
import PixelIcon from '@/components/game/PixelIcon';
import WelcomeTutorial, { hasSeenTutorial, hasSeenCrewHint, hasSeenUpgradeHint } from '@/components/game/WelcomeTutorial';
import { CrewHintPrompt, UpgradeHintPrompt } from '@/components/game/WelcomeTutorial';
import MusicPlayer from '@/components/game/MusicPlayer';
import MilestonePrompt, { hasSeenMilestone, markMilestoneSeen } from '@/components/game/MilestonePrompt';
import {
  PrestigeMysteryPrompt, PrestigeUnlockPrompt, PrestigeNudgeBanner,
  hasSeenPrestigeUnlock, markPrestigeUnlockSeen,
} from '@/components/game/PrestigeUnlockPrompts';
import PolicemanCharacter from '@/components/game/PolicemanCharacter';
import BehindThePav, { hasSeenBehindThePav } from '@/components/game/BehindThePav';
import ReminderNotification from '@/components/game/ReminderNotification';
import FinalMapDialog, { hasSeenFinalMap, markFinalMapSeen } from '@/components/game/FinalMapDialog';
import ShareButton from '@/components/game/ShareButton';
import InvestorPrompt from '@/components/game/InvestorPrompt';
import ThiefCharacter from '@/components/game/ThiefCharacter';

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
    state, tap, buyWorker, buyUpgrade, prestige, stealCurrency, addCurrency, resetGame,
    canPrestige, prestigePointsAvailable, prestigeCostRequired,
    getWorkerCost, getUpgradeCost, locations, formatCurrency,
  } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('upgrades');
  const [showTutorial, setShowTutorial] = useState(() => !hasSeenTutorial());
  const [showCrewHint, setShowCrewHint] = useState(false);
  const [showUpgradeHint, setShowUpgradeHint] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [forceCrewTab, setForceCrewTab] = useState(false);
  const [forceUpgradeTab, setForceUpgradeTab] = useState(false);
  const [postUpgradeToast, setPostUpgradeToast] = useState(false);
  const [postCrewToast, setPostCrewToast] = useState(false);
  const crewHintShownRef = useRef(hasSeenCrewHint());
  const upgradeHintShownRef = useRef(hasSeenUpgradeHint());
  const postUpgradeToastRef = useRef(false);
  const postCrewToastRef = useRef(false);
  const [showPrestigeMystery, setShowPrestigeMystery] = useState(false);
  const [showPrestigeUnlock, setShowPrestigeUnlock] = useState(false);
  const [showPrestigeNudge, setShowPrestigeNudge] = useState(false);
  const prestigeUnlockShownRef = useRef(hasSeenPrestigeUnlock());
  const prestigeNudgeShownRef = useRef(false);
  const [showBehindThePav, setShowBehindThePav] = useState(false);
  const behindThePavShownRef = useRef(hasSeenBehindThePav());
  const [showFinalMap, setShowFinalMap] = useState(false);
  const finalMapShownRef = useRef(hasSeenFinalMap());
  // 10-minute timer for Behind the Pav
  useEffect(() => {
    if (behindThePavShownRef.current) return;
    const timer = window.setTimeout(() => {
      if (!behindThePavShownRef.current) {
        behindThePavShownRef.current = true;
        setShowBehindThePav(true);
      }
    }, 10 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);
  const prestigeTabUnlocked = state.currentLocation > 0 || state.totalEarned >= 100_000;

  // Show upgrade hint when player can afford first upgrade (₹100)
  const firstUpgrade = state.upgrades[0];
  const hasFirstUpgrade = firstUpgrade.level > 0;
  const firstUpgradeCost = getUpgradeCost(firstUpgrade);

  // Show crew hint when player can afford first worker (₹500)
  const firstWorkerCost = getWorkerCost(state.workers[0]);
  const hasAnyWorker = state.workers.some(w => w.quantity > 0);
  const milestoneShownRef = useRef(hasSeenMilestone());

  // Release upgrade tab lock + show post-upgrade toast
  useEffect(() => {
    if (forceUpgradeTab && hasFirstUpgrade) {
      setForceUpgradeTab(false);
      if (!postUpgradeToastRef.current) {
        postUpgradeToastRef.current = true;
        setTimeout(() => setPostUpgradeToast(true), 600);
        setTimeout(() => setPostUpgradeToast(false), 6000);
      }
    }
  }, [hasFirstUpgrade, forceUpgradeTab]);

  // Release crew tab lock + show post-crew toast
  useEffect(() => {
    if (forceCrewTab && hasAnyWorker) {
      setForceCrewTab(false);
      if (!postCrewToastRef.current) {
        postCrewToastRef.current = true;
        setTimeout(() => setPostCrewToast(true), 600);
        setTimeout(() => setPostCrewToast(false), 7000);
      }
    }
  }, [hasAnyWorker, forceCrewTab]);

  useEffect(() => {
    // ₹100 upgrade hint
    if (!upgradeHintShownRef.current && !showTutorial && !hasFirstUpgrade && state.currency >= firstUpgradeCost) {
      upgradeHintShownRef.current = true;
      setShowUpgradeHint(true);
    }
    // ₹500 crew hint
    if (!crewHintShownRef.current && !showTutorial && !hasAnyWorker && state.currency >= firstWorkerCost) {
      crewHintShownRef.current = true;
      setShowCrewHint(true);
    }
    // 50k milestone
    if (!milestoneShownRef.current && !showTutorial && state.currency >= 50000) {
      milestoneShownRef.current = true;
      markMilestoneSeen();
      setShowMilestone(true);
    }
    // 100k prestige unlock
    if (!prestigeUnlockShownRef.current && !showTutorial && state.totalEarned >= 100_000) {
      prestigeUnlockShownRef.current = true;
      markPrestigeUnlockSeen();
      setShowPrestigeUnlock(true);
    }
    // Prestige nudge — when player can prestige at current location
    if (!prestigeNudgeShownRef.current && !showTutorial && canPrestige) {
      prestigeNudgeShownRef.current = true;
      setShowPrestigeNudge(true);
    }
    // Behind the Pav — after first prestige
    if (!behindThePavShownRef.current && state.totalPrestiges >= 1) {
      behindThePavShownRef.current = true;
      setTimeout(() => setShowBehindThePav(true), 1500); // slight delay after prestige animation
    }
    // Final map dialog — when reaching the last location (Mumbai Airport)
    if (!finalMapShownRef.current && state.currentLocation === locations.length - 1) {
      finalMapShownRef.current = true;
      markFinalMapSeen();
      setTimeout(() => setShowFinalMap(true), 1000);
    }
  }, [state.currency, state.totalEarned, state.totalPrestiges, state.currentLocation, firstUpgradeCost, firstWorkerCost, showTutorial, hasFirstUpgrade, hasAnyWorker, canPrestige, locations.length]);

  const currentLocation = locations[state.currentLocation];

  // Check if player can afford something in each tab (for notification dots)
  const canAffordUpgrade = state.upgrades.some(u => u.level < u.maxLevel && state.currency >= getUpgradeCost(u));
  const nextWorkerIdx = state.workers.findIndex(w => w.quantity === 0);
  const canAffordWorker = state.workers.some((w, i) => {
    if (w.quantity > 0) return state.currency >= getWorkerCost(w); // can buy more
    if (i === nextWorkerIdx) return state.currency >= getWorkerCost(w); // next unlock
    return false;
  });
  const tabHasAffordable: Record<Tab, boolean> = {
    upgrades: canAffordUpgrade,
    workers: canAffordWorker,
    prestige: prestigeTabUnlocked && canPrestige,
  };

  const tabs: { key: Tab; label: string; iconId: string }[] = [
    { key: 'upgrades', label: 'UPGRADES', iconId: 'tap3' },
    { key: 'workers', label: 'CREW', iconId: 'masher' },
    { key: 'prestige', label: prestigeTabUnlocked ? 'PRESTIGE' : '????', iconId: 'star' },
  ];

  return (
    <div className="h-[100dvh] bg-background flex flex-col md:flex-row max-w-md md:max-w-none mx-auto relative overflow-y-auto md:overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Welcome tutorial for first-time players */}
      <AnimatePresence>
        {showTutorial && (
          <WelcomeTutorial
            onComplete={() => setShowTutorial(false)}
          />
        )}
      </AnimatePresence>

      {/* Upgrade hint — forces player to upgrades tab */}
      <AnimatePresence>
        {showUpgradeHint && (
          <UpgradeHintPrompt
            onComplete={() => setShowUpgradeHint(false)}
            onSwitchToUpgradeTab={() => {
              setActiveTab('upgrades');
              setForceUpgradeTab(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Crew hire hint — forces player to crew tab */}
      <AnimatePresence>
        {showCrewHint && (
          <CrewHintPrompt
            onComplete={() => setShowCrewHint(false)}
            onSwitchToCrewTab={() => {
              setActiveTab('workers');
              setForceCrewTab(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* 50K milestone — install + hire me */}
      <AnimatePresence>
        {showMilestone && (
          <MilestonePrompt onComplete={() => setShowMilestone(false)} />
        )}
      </AnimatePresence>

      {/* Prestige mystery prompt (tapped locked tab) */}
      <AnimatePresence>
        {showPrestigeMystery && (
          <PrestigeMysteryPrompt onClose={() => setShowPrestigeMystery(false)} />
        )}
      </AnimatePresence>

      {/* Prestige unlock explanation at 100k */}
      <AnimatePresence>
        {showPrestigeUnlock && (
          <PrestigeUnlockPrompt
            onClose={() => setShowPrestigeUnlock(false)}
            onSwitchTab={() => setActiveTab('prestige')}
          />
        )}
      </AnimatePresence>

      {/* Behind the Pav — skills reveal */}
      <AnimatePresence>
        {showBehindThePav && (
          <BehindThePav onClose={() => setShowBehindThePav(false)} />
        )}
      </AnimatePresence>
      {/* Thief tutorial / stolen text still render here via fixed positioning */}

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0%) 2px, hsl(0 0% 0%) 4px)',
        }}
      />

      {/* ===== TOP HALF: Game Scene ===== */}
      <div className="relative flex-shrink-0 sticky top-0 z-20 md:static md:flex-1 md:order-2 md:h-[100dvh] md:overflow-hidden flex flex-col" style={{ minHeight: '46vh' }}>
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
            <ShareButton
              currency={state.currency}
              totalEarned={state.totalEarned}
              totalProduced={state.totalProduced}
              totalPrestiges={state.totalPrestiges}
              currentLocationName={currentLocation.name}
              currentLocationIndex={state.currentLocation}
              totalLocations={locations.length}
            />
            <MusicPlayer onReset={resetGame} onShowAbout={() => setShowBehindThePav(true)} />
            <div className="bg-card/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-body text-muted-foreground">
              {state.totalProduced.toLocaleString()} served
            </div>
          </div>
        </div>

          {/* Prestige nudge at 1M */}
        <AnimatePresence>
          {showPrestigeNudge && (
            <PrestigeNudgeBanner
              onDismiss={() => setShowPrestigeNudge(false)}
              onGoToPrestige={() => { setActiveTab('prestige'); setShowPrestigeNudge(false); }}
              totalEarned={state.totalEarned}
              prestigeCost={prestigeCostRequired}
            />
          )}
        </AnimatePresence>

        {/* Post-upgrade toast */}
        <AnimatePresence>
          {postUpgradeToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 mx-3 mt-1"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-primary/40 px-3 py-2 flex items-center justify-center gap-2">
                <span className="text-[10px]">😎</span>
                <span className="text-[10px] font-body text-foreground/80">
                  Nice one boss! Keep checking <span className="font-bold text-primary">Upgrades</span> — more goodies drop as you earn more ₹₹₹
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post-crew toast */}
        <AnimatePresence>
          {postCrewToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 mx-3 mt-1"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-secondary/40 px-3 py-2 flex items-center justify-center gap-2">
                <span className="text-[10px]">🤙</span>
                <span className="text-[10px] font-body text-foreground/80">
                  Your crew is cooking now! Peep the <span className="font-bold text-primary">Upgrades</span> & <span className="font-bold text-secondary">Crew</span> tabs often — new unlocks = big money moves 💰
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Periodic reminder notifications */}
        {!showTutorial && !forceUpgradeTab && !forceCrewTab && !postUpgradeToast && !postCrewToast && (
          <ReminderNotification
            canAffordUpgrade={canAffordUpgrade}
            canAffordWorker={canAffordWorker}
            canPrestige={canPrestige}
            prestigeTabUnlocked={prestigeTabUnlocked}
            activeTab={activeTab}
            onSwitchTab={setActiveTab}
          />
        )}


        <AnimatePresence>
          {!showTutorial && hasFirstUpgrade && !hasAnyWorker && !showCrewHint && state.currency < firstWorkerCost && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 mx-3 mt-1"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-secondary/50 px-3 py-1.5 flex items-center justify-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[10px] font-display text-secondary"
                >🎁</motion.span>
                <span className="text-[10px] font-body text-foreground/80">
                  Keep tapping! <span className="font-bold text-coin">{formatCurrency(firstWorkerCost)}</span> unlocks your first crew member!
                </span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="text-[10px] font-display text-secondary"
                >👥</motion.span>
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
        <div className="relative z-10 flex-1 md:flex-none md:mt-auto md:mb-8 md:scale-[1.3] md:origin-bottom md:w-full">
          <CookingStation
            tapPower={state.tapPower}
            tapMultiplier={state.tapMultiplier}
            prestigeMultiplier={state.prestigeMultiplier}
            locationMultiplier={currentLocation.multiplier}
            comboCount={state.comboCount}
            onTap={tap}
            hasCrewMember={state.workers.some(w => w.quantity > 0)}
            blocked={forceCrewTab || forceUpgradeTab}
            blockedMessage={forceUpgradeTab ? {
              title: 'UPGRADE YOUR POTATOES! 🥔',
              body: 'Oh come on, your customers deserve better potatoes! Head to the <span class="font-bold" style="color:hsl(var(--primary))">Upgrades tab</span> and grab <span class="font-bold" style="color:hsl(var(--coin-gold))">Better Potatoes</span> — they\'ll make you more money too!'
            } : undefined}
          />
          {/* Thief character — same container as cart/customers for matching position */}
          <ThiefCharacter
            currency={state.currency}
            productionPerSecond={state.productionPerSecond}
            onSteal={stealCurrency}
          />
        </div>
      </div>

      {/* ===== BOTTOM HALF: Shop Panel ===== */}
      <div className="relative z-30 flex flex-col min-h-[100dvh] md:min-h-0 md:w-[380px] md:flex-none md:order-1 md:h-[100dvh] bg-card/95 backdrop-blur-sm border-t-2 md:border-t-0 md:border-r-2 border-primary/30">
        {/* Tab Bar */}
        <div className="flex shrink-0 border-b border-border/50">
          {tabs.map(tab => {
            const isLocked = (forceCrewTab && tab.key !== 'workers') || (forceUpgradeTab && tab.key !== 'upgrades');
            const isPrestigeLocked = tab.key === 'prestige' && !prestigeTabUnlocked;
            return (
            <button
              key={tab.key}
              onClick={() => {
                if (isPrestigeLocked) { setShowPrestigeMystery(true); return; }
                if (!isLocked) setActiveTab(tab.key);
              }}
              className={`flex-1 py-2 text-[7px] font-display transition-all flex items-center justify-center gap-1.5 relative ${
                isLocked || isPrestigeLocked
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : activeTab === tab.key
                    ? 'text-primary bg-background/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {isPrestigeLocked ? <span className="text-[10px]">🔮</span> : <PixelIcon id={tab.iconId} size={16} />}
              {tab.label}
              {/* Affordability notification dot — pixel art style */}
              {!isLocked && activeTab !== tab.key && tabHasAffordable[tab.key] && (
                <span className={`absolute top-1 right-2 w-2 h-2 animate-pulse ${
                  tab.key === 'prestige' ? 'bg-primary shadow-[0_0_4px_hsl(var(--primary))]' : 'bg-chutney shadow-[0_0_4px_hsl(var(--chutney))]'
                }`} />
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                />
              )}
            </button>
            );
          })}
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
                  highlightFirst={forceCrewTab}
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

        {/* Footer credit */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0px 0px hsl(var(--primary) / 0)',
              '0 0 12px 2px hsl(var(--primary) / 0.4)',
              '0 0 0px 0px hsl(var(--primary) / 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 12 }}
          className="shrink-0 border-t border-border/30 px-3 py-1.5 flex items-center justify-center gap-2"
        >
          <span className="text-[7px] font-display text-muted-foreground/70 tracking-wider">Built by</span>
          <a href="https://antariksh.me" target="_blank" rel="noopener noreferrer" className="text-[7px] font-display text-primary hover:text-primary/80 transition-colors tracking-wider">antariksh.me</a>
          <span className="text-[7px] text-muted-foreground/40">•</span>
          <a href="https://linkedin.com/in/aapatre" target="_blank" rel="noopener noreferrer" className="text-[7px] font-display tracking-wider hover:text-[#0A66C2] transition-colors">
            <span className="text-muted-foreground/70">HIRE ME: </span><span className="text-[#0A66C2]">LinkedIn</span>
          </a>
        </motion.div>
      </div>

      {/* Policeman random appearance */}
      <PolicemanCharacter currency={state.currency} />

      {/* Investor prompt */}
      <InvestorPrompt
        totalEarned={state.totalEarned}
        totalProduced={state.totalProduced}
        totalPrestiges={state.totalPrestiges}
        currentLocationName={currentLocation.name}
        currentLocationIndex={state.currentLocation}
        totalLocations={locations.length}
        onAccept={addCurrency}
        onDecline={() => {}}
      />

      {/* Final map congratulations dialog */}
      <FinalMapDialog open={showFinalMap} onClose={() => setShowFinalMap(false)} />
    </div>
  );
};

export default Index;
