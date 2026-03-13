import { useState, useEffect, useCallback, useRef } from 'react';

export interface Worker {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  baseProduction: number;
  quantity: number;
  description: string;
}

export interface Upgrade {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  level: number;
  maxLevel: number;
  effect: number;
  type: 'tap' | 'multiplier' | 'auto';
  description: string;
}

export interface GameState {
  currency: number;
  totalEarned: number;
  totalProduced: number;
  tapPower: number;
  tapMultiplier: number;
  productionPerSecond: number;
  prestigePoints: number;
  prestigeMultiplier: number;
  totalPrestiges: number;
  currentLocation: number;
  workers: Worker[];
  upgrades: Upgrade[];
  lastSaved: number;
  comboCount: number;
  lastTapTime: number;
}

const LOCATIONS = [
  { name: 'CST Station', multiplier: 1, icon: '[=]', bg: 'cst-station', prestigeCost: 0 },
  { name: 'Gateway of India', multiplier: 1.5, icon: '[^]', bg: 'gateway-of-india', prestigeCost: 1_000_000 },
  { name: 'Juhu Beach', multiplier: 2, icon: '[~]', bg: 'juhu-beach', prestigeCost: 5_000_000 },
  { name: 'BKC Business', multiplier: 3, icon: '[^]', bg: 'bkc-business', prestigeCost: 25_000_000 },
  { name: 'Girgaon', multiplier: 5, icon: '[*]', bg: 'girgaon', prestigeCost: 100_000_000 },
  { name: 'Mumbai Airport', multiplier: 10, icon: '[>]', bg: 'mumbai-airport', prestigeCost: 500_000_000 },
];

const INITIAL_WORKERS: Worker[] = [
  { id: 'masher', name: 'Potato Masher', icon: '<O>', baseCost: 500, baseProduction: 1, quantity: 0, description: 'Prepares ingredients' },
  { id: 'fryer', name: 'Fryer Expert', icon: '{~}', baseCost: 3000, baseProduction: 10, quantity: 0, description: 'Fries vadas' },
  { id: 'slicer', name: 'Pav Slicer', icon: '[/]', baseCost: 15000, baseProduction: 50, quantity: 0, description: 'Assembles pav' },
  { id: 'chutney', name: 'Chutney Master', icon: '{+}', baseCost: 80000, baseProduction: 250, quantity: 0, description: 'Adds toppings' },
  { id: 'delivery', name: 'Delivery Boy', icon: '>>>', baseCost: 500000, baseProduction: 1000, quantity: 0, description: 'Serves faster' },
  { id: 'manager', name: 'Cart Manager', icon: '[!]', baseCost: 3000000, baseProduction: 5000, quantity: 0, description: 'Manages ops' },
];

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 'tap1', name: 'Better Potatoes', icon: '<O>', baseCost: 100, level: 0, maxLevel: 50, effect: 5, type: 'tap', description: '+5/tap' },
  { id: 'tap2', name: 'Sharper Knife', icon: '/!\\', baseCost: 1000, level: 0, maxLevel: 50, effect: 25, type: 'tap', description: '+25/tap' },
  { id: 'tap3', name: 'Golden Tawa', icon: '(*)', baseCost: 10000, level: 0, maxLevel: 50, effect: 100, type: 'tap', description: '+100/tap' },
  { id: 'mult1', name: 'Premium Oil', icon: '{o}', baseCost: 5000, level: 0, maxLevel: 10, effect: 0.25, type: 'multiplier', description: '+25% earn' },
  { id: 'mult2', name: 'Special Spices', icon: '<!>', baseCost: 50000, level: 0, maxLevel: 10, effect: 0.5, type: 'multiplier', description: '+50% earn' },
  { id: 'mult3', name: 'Secret Recipe', icon: '[?]', baseCost: 500000, level: 0, maxLevel: 5, effect: 1.0, type: 'multiplier', description: '+100% earn' },
];

const SAVE_KEY = 'wadapav_tycoon_save';

// Location-based cost scaling: each map makes things progressively more expensive
const LOCATION_COST_SCALE = [1, 2, 4, 8, 16, 32];

function getWorkerCost(worker: Worker, locationIndex: number = 0): number {
  return Math.floor(worker.baseCost * LOCATION_COST_SCALE[locationIndex] * Math.pow(2, worker.quantity));
}

function getUpgradeCost(upgrade: Upgrade, locationIndex: number = 0): number {
  return Math.floor(upgrade.baseCost * LOCATION_COST_SCALE[locationIndex] * Math.pow(1.15, upgrade.level));
}

function calculateProductionPerSecond(workers: Worker[], prestigeMultiplier: number, tapMultiplier: number): number {
  return workers.reduce((sum, w) => sum + w.baseProduction * w.quantity, 0) * prestigeMultiplier * tapMultiplier;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1e12) return `₹${(amount / 1e12).toFixed(2)}T`;
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `₹${(amount / 1e6).toFixed(3)}M`;
  if (amount >= 1e3) return `₹${(amount / 1e3).toFixed(2)}K`;
  return `₹${Math.floor(amount)}`;
}

function loadGame(): GameState | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveGame(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaved: Date.now() }));
  } catch {}
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGame();
    if (saved) {
      // Calculate offline earnings
      const offlineSeconds = Math.min((Date.now() - saved.lastSaved) / 1000, 4 * 3600);
      const offlineEarnings = saved.productionPerSecond * offlineSeconds * 0.5;
      return {
        ...saved,
        currency: saved.currency + offlineEarnings,
        totalEarned: saved.totalEarned + offlineEarnings,
      };
    }
    return {
      currency: 0,
      totalEarned: 0,
      totalProduced: 0,
      tapPower: 10,
      tapMultiplier: 1,
      productionPerSecond: 0,
      prestigePoints: 0,
      prestigeMultiplier: 1,
      totalPrestiges: 0,
      currentLocation: 0,
      workers: INITIAL_WORKERS.map(w => ({ ...w })),
      upgrades: INITIAL_UPGRADES.map(u => ({ ...u })),
      lastSaved: Date.now(),
      comboCount: 0,
      lastTapTime: 0,
    };
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Idle production tick
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.productionPerSecond <= 0) return prev;
        const earned = prev.productionPerSecond * 0.1; // 100ms tick
        return {
          ...prev,
          currency: prev.currency + earned,
          totalEarned: prev.totalEarned + earned,
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => saveGame(stateRef.current), 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset combo after inactivity
  const comboTimeoutRef = useRef<number | null>(null);

  const tap = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      const timeSinceLastTap = now - prev.lastTapTime;
      const isCombo = timeSinceLastTap < 500;
      const newCombo = isCombo ? prev.comboCount + 1 : 1;
      const comboMultiplier = newCombo >= 100 ? 2 : newCombo >= 50 ? 1.8 : newCombo >= 20 ? 1.2 : 1;

      const earned = prev.tapPower * prev.tapMultiplier * prev.prestigeMultiplier * comboMultiplier *
        LOCATIONS[prev.currentLocation].multiplier;

      return {
        ...prev,
        currency: prev.currency + earned,
        totalEarned: prev.totalEarned + earned,
        totalProduced: prev.totalProduced + 1,
        comboCount: newCombo,
        lastTapTime: now,
      };
    });

    // Reset combo after 800ms of no tapping
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = window.setTimeout(() => {
      setState(prev => ({ ...prev, comboCount: 0 }));
    }, 800);
  }, []);

  const buyWorker = useCallback((workerId: string) => {
    setState(prev => {
      const workerIdx = prev.workers.findIndex(w => w.id === workerId);
      if (workerIdx === -1) return prev;
      const worker = prev.workers[workerIdx];
      const cost = getWorkerCost(worker, prev.currentLocation);
      if (prev.currency < cost) return prev;

      const newWorkers = prev.workers.map((w, i) =>
        i === workerIdx ? { ...w, quantity: w.quantity + 1 } : w
      );
      const newPPS = calculateProductionPerSecond(newWorkers, prev.prestigeMultiplier, prev.tapMultiplier) *
        LOCATIONS[prev.currentLocation].multiplier;

      return {
        ...prev,
        currency: prev.currency - cost,
        workers: newWorkers,
        productionPerSecond: newPPS,
      };
    });
  }, []);

  const buyUpgrade = useCallback((upgradeId: string) => {
    setState(prev => {
      const upgradeIdx = prev.upgrades.findIndex(u => u.id === upgradeId);
      if (upgradeIdx === -1) return prev;
      const upgrade = prev.upgrades[upgradeIdx];
      if (upgrade.level >= upgrade.maxLevel) return prev;
      const cost = getUpgradeCost(upgrade, prev.currentLocation);
      if (prev.currency < cost) return prev;

      const newUpgrades = prev.upgrades.map((u, i) =>
        i === upgradeIdx ? { ...u, level: u.level + 1 } : u
      );

      let newTapPower = 10;
      let newTapMultiplier = 1;
      newUpgrades.forEach(u => {
        if (u.type === 'tap') newTapPower += u.effect * u.level;
        if (u.type === 'multiplier') newTapMultiplier += u.effect * u.level;
      });

      const newPPS = calculateProductionPerSecond(prev.workers, prev.prestigeMultiplier, newTapMultiplier) *
        LOCATIONS[prev.currentLocation].multiplier;

      return {
        ...prev,
        currency: prev.currency - cost,
        upgrades: newUpgrades,
        tapPower: newTapPower,
        tapMultiplier: newTapMultiplier,
        productionPerSecond: newPPS,
      };
    });
  }, []);

  const prestige = useCallback(() => {
    setState(prev => {
      const nextLocation = Math.min(LOCATIONS.length - 1, prev.currentLocation + 1);
      const requiredEarnings = LOCATIONS[nextLocation].prestigeCost;
      if (prev.totalEarned < requiredEarnings || requiredEarnings === 0) return prev;

      const pointsEarned = Math.floor(prev.totalEarned / 1_000_000);
      const newPrestigePoints = prev.prestigePoints + pointsEarned;
      const newPrestigeMultiplier = 1 + newPrestigePoints * 0.1;

      return {
        currency: 0,
        totalEarned: 0,
        totalProduced: 0,
        tapPower: 10,
        tapMultiplier: 1,
        productionPerSecond: 0,
        prestigePoints: newPrestigePoints,
        prestigeMultiplier: newPrestigeMultiplier,
        totalPrestiges: prev.totalPrestiges + 1,
        currentLocation: nextLocation,
        workers: INITIAL_WORKERS.map(w => ({ ...w })),
        upgrades: INITIAL_UPGRADES.map(u => ({ ...u })),
        lastSaved: Date.now(),
        comboCount: 0,
        lastTapTime: 0,
      };
    });
  }, []);

  const stealCurrency = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      currency: Math.max(0, prev.currency - amount),
    }));
  }, []);

  const addCurrency = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      currency: prev.currency + amount,
      totalEarned: prev.totalEarned + amount,
    }));
  }, []);

  const resetGame = useCallback(() => {
    // Clear all game-related localStorage keys
    const keysToRemove = [
      SAVE_KEY,
      'wadapav-thief-tutorial-seen',
      'wadapav_crew_hint_done',
      'wadapav_tutorial_done',
      'wadapav-prestige-unlock',
      'wadapav-prestige-nudge',
      'wadapav-milestone',
      'wadapav_upgrade_hint_done',
      'wadapav-music-muted',
      'wadapav-music-volume',
      'wadapav-sfx-muted',
      'wadapav-behind-the-pav',
      'wadapav-celeb-prompt',
      'wadapav-award-prompt',
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));



    // Hard reload for a truly fresh start
    window.location.reload();
  }, []);

  const nextLocation = Math.min(LOCATIONS.length - 1, state.currentLocation + 1);
  const prestigeCostRequired = LOCATIONS[nextLocation].prestigeCost;
  const canPrestige = state.currentLocation < LOCATIONS.length - 1 && state.totalEarned >= prestigeCostRequired;
  const prestigePointsAvailable = Math.floor(state.totalEarned / 1_000_000);

  const getWorkerCostAtLocation = useCallback((worker: Worker) => getWorkerCost(worker, state.currentLocation), [state.currentLocation]);
  const getUpgradeCostAtLocation = useCallback((upgrade: Upgrade) => getUpgradeCost(upgrade, state.currentLocation), [state.currentLocation]);

  return {
    state,
    tap,
    buyWorker,
    buyUpgrade,
    prestige,
    stealCurrency,
    addCurrency,
    resetGame,
    canPrestige,
    prestigePointsAvailable,
    prestigeCostRequired,
    getWorkerCost: getWorkerCostAtLocation,
    getUpgradeCost: getUpgradeCostAtLocation,
    locations: LOCATIONS,
    formatCurrency,
  };
}
