import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import CurrencyDisplay from '@/components/game/CurrencyDisplay';
import CookingStation from '@/components/game/CookingStation';
import UpgradePanel from '@/components/game/UpgradePanel';
import WorkerPanel from '@/components/game/WorkerPanel';
import PrestigePanel from '@/components/game/PrestigePanel';
import PixelIcon from '@/components/game/PixelIcon';

type Tab = 'upgrades' | 'workers' | 'prestige';

const Index = () => {
  const {
    state, tap, buyWorker, buyUpgrade, prestige,
    canPrestige, prestigePointsAvailable,
    getWorkerCost, getUpgradeCost, locations, formatCurrency,
  } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('upgrades');

  const currentLocation = locations[state.currentLocation];

  const tabs: { key: Tab; label: string; iconId: string }[] = [
    { key: 'upgrades', label: 'UPGR', iconId: 'tap3' },
    { key: 'workers', label: 'CREW', iconId: 'masher' },
    { key: 'prestige', label: 'STAR', iconId: 'star' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 0%) 2px, hsl(0 0% 0%) 4px)',
        }}
      />

      {/* Title */}
      <div className="text-center pt-4 pb-1 relative z-10">
        <h1 className="text-xs font-display font-extrabold text-primary tracking-wider">
          {"<< WADA PAV TYCOON >>"}
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

      {/* Tab Bar */}
      <div className="flex border-b-2 border-border bg-card sticky top-0 z-20">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-[8px] font-display transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? 'text-primary border-b-3 border-primary bg-muted'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PixelIcon id={tab.iconId} size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 pb-8">
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
      <div className="bg-card border-t-2 border-border px-4 py-2 flex justify-between text-sm font-body text-muted-foreground">
        <span>{state.totalProduced.toLocaleString()} served</span>
        <span>{formatCurrency(state.totalEarned)} earned</span>
      </div>
    </div>
  );
};

export default Index;
