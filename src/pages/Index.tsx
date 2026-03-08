import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import CurrencyDisplay from '@/components/game/CurrencyDisplay';
import CookingStation from '@/components/game/CookingStation';
import UpgradePanel from '@/components/game/UpgradePanel';
import WorkerPanel from '@/components/game/WorkerPanel';
import PrestigePanel from '@/components/game/PrestigePanel';
import cartImg from '@/assets/cart.png';

type Tab = 'upgrades' | 'workers' | 'prestige';

const Index = () => {
  const {
    state, tap, buyWorker, buyUpgrade, prestige,
    canPrestige, prestigePointsAvailable,
    getWorkerCost, getUpgradeCost, locations, formatCurrency,
  } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('upgrades');

  const currentLocation = locations[state.currentLocation];

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'upgrades', label: 'Upgrades', emoji: '🔧' },
    { key: 'workers', label: 'Workers', emoji: '👥' },
    { key: 'prestige', label: 'Prestige', emoji: '🌟' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Header with cart bg */}
      <div className="relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <img src={cartImg} alt="" className="w-full object-contain" />
        </div>

        {/* Title */}
        <div className="text-center pt-4 pb-1 relative z-10">
          <h1 className="text-2xl font-display font-extrabold text-foreground tracking-tight">
            🌶️ Wada Pav Tycoon
          </h1>
        </div>

        {/* Currency */}
        <CurrencyDisplay
          currency={state.currency}
          perSecond={state.productionPerSecond}
          location={currentLocation}
          prestigePoints={state.prestigePoints}
        />

        {/* Cooking Station */}
        <CookingStation
          tapPower={state.tapPower}
          tapMultiplier={state.tapMultiplier}
          prestigeMultiplier={state.prestigeMultiplier}
          locationMultiplier={currentLocation.multiplier}
          comboCount={state.comboCount}
          onTap={tap}
        />
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border bg-card/50 sticky top-0 z-20">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-display font-semibold transition-all ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary bg-card'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        {activeTab === 'upgrades' && (
          <UpgradePanel
            upgrades={state.upgrades}
            currency={state.currency}
            onBuy={buyUpgrade}
            getCost={getUpgradeCost}
          />
        )}
        {activeTab === 'workers' && (
          <WorkerPanel
            workers={state.workers}
            currency={state.currency}
            onBuy={buyWorker}
            getCost={getWorkerCost}
          />
        )}
        {activeTab === 'prestige' && (
          <PrestigePanel
            canPrestige={canPrestige}
            pointsAvailable={prestigePointsAvailable}
            currentPoints={state.prestigePoints}
            totalEarned={state.totalEarned}
            totalPrestiges={state.totalPrestiges}
            prestigeMultiplier={state.prestigeMultiplier}
            onPrestige={prestige}
            locations={locations}
            currentLocation={state.currentLocation}
          />
        )}
      </div>

      {/* Stats footer */}
      <div className="bg-card/80 border-t border-border px-4 py-2 flex justify-between text-xs font-body text-muted-foreground">
        <span>🍽️ {state.totalProduced.toLocaleString()} served</span>
        <span>💰 {formatCurrency(state.totalEarned)} earned</span>
      </div>
    </div>
  );
};

export default Index;
