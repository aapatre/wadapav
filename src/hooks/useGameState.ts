import { useState, useEffect, useCallback, useRef } from 'react';

export interface Worker {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  baseProduction: number;
  quantity: number;
  description: string;
}

export interface Upgrade {
  id: string;
  name: string;
  emoji: string;
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
  { name: 'Dadar Station', multiplier: 1, emoji: '🚉' },
  { name: 'CST/VT Station', multiplier: 1.5, emoji: '🏛️' },
  { name: 'Juhu Beach', multiplier: 2, emoji: '🏖️' },
  { name: 'BKC Business District', multiplier: 3, emoji: '🏢' },
  { name: 'Girgaon Chowpatty', multiplier: 5, emoji: '🎪' },
  { name: 'Mumbai Airport', multiplier: 10, emoji: '✈️' },
];

const INITIAL_WORKERS: Worker[] = [
  { id: 'masher', name: 'Potato Masher', emoji: '🥔', baseCost: 500, baseProduction: 1, quantity: 0, description: 'Prepares ingredients' },
  { id: 'fryer', name: 'Fryer Expert', emoji: '🍳', baseCost: 3000, baseProduction: 10, quantity: 0, description: 'Fries vadas automatically' },
  { id: 'slicer', name: 'Pav Slicer', emoji: '🍞', baseCost: 15000, baseProduction: 50, quantity: 0, description: 'Assembles sandwiches' },
  { id: 'chutney', name: 'Chutney Master', emoji: '🌿', baseCost: 80000, baseProduction: 250, quantity: 0, description: 'Adds toppings' },
  { id: 'delivery', name: 'Delivery Boy', emoji: '🛵', baseCost: 500000, baseProduction: 1000, quantity: 0, description: 'Serves customers faster' },
  { id: 'manager', name: 'Cart Manager', emoji: '👨‍💼', baseCost: 3000000, baseProduction: 5000, quantity: 0, description: 'Manages operations' },
];

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 'tap1', name: 'Better Potatoes', emoji: '🥔', baseCost: 100, level: 0, maxLevel: 50, effect: 5, type: 'tap', description: '+₹5 per tap' },
  { id: 'tap2', name: 'Sharper Knife', emoji: '🔪', baseCost: 1000, level: 0, maxLevel: 50, effect: 25, type: 'tap', description: '+₹25 per tap' },
  { id: 'tap3', name: 'Golden Tawa', emoji: '✨', baseCost: 10000, level: 0, maxLevel: 50, effect: 100, type: 'tap', description: '+₹100 per tap' },
  { id: 'mult1', name: 'Premium Oil', emoji: '🫒', baseCost: 5000, level: 0, maxLevel: 10, effect: 0.25, type: 'multiplier', description: '+25% all earnings' },
  { id: 'mult2', name: 'Special Spices', emoji: '🌶️', baseCost: 50000, level: 0, maxLevel: 10, effect: 0.5, type: 'multiplier', description: '+50% all earnings' },
  { id: 'mult3', name: 'Secret Recipe', emoji: '📜', baseCost: 500000, level: 0, maxLevel: 5, effect: 1.0, type: 'multiplier', description: '+100% all earnings' },
];

const SAVE_KEY = 'wadapav_tycoon_save';

function getWorkerCost(worker: Worker): number {
  return Math.floor(worker.baseCost * Math.pow(2, worker.quantity));
}

function getUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level));
}

function calculateProductionPerSecond(workers: Worker[], prestigeMultiplier: number, tapMultiplier: number): number {
  return workers.reduce((sum, w) => sum + w.baseProduction * w.quantity, 0) * prestigeMultiplier * tapMultiplier;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1e12) return `₹${(amount / 1e12).toFixed(1)}T`;
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `₹${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `₹${(amount / 1e3).toFixed(1)}K`;
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

  const tap = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      const timeSinceLastTap = now - prev.lastTapTime;
      const isCombo = timeSinceLastTap < 500;
      const newCombo = isCombo ? prev.comboCount + 1 : 1;
      const comboMultiplier = newCombo >= 3 ? 1.5 : 1;

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
  }, []);

  const buyWorker = useCallback((workerId: string) => {
    setState(prev => {
      const workerIdx = prev.workers.findIndex(w => w.id === workerId);
      if (workerIdx === -1) return prev;
      const worker = prev.workers[workerIdx];
      const cost = getWorkerCost(worker);
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
      const cost = getUpgradeCost(upgrade);
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
      const pointsEarned = Math.floor(prev.totalEarned / 1_000_000);
      if (pointsEarned <= 0) return prev;

      const newPrestigePoints = prev.prestigePoints + pointsEarned;
      const newPrestigeMultiplier = 1 + newPrestigePoints * 0.1;
      const newLocation = Math.min(
        LOCATIONS.length - 1,
        prev.totalPrestiges + 1
      );

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
        currentLocation: newLocation,
        workers: INITIAL_WORKERS.map(w => ({ ...w })),
        upgrades: INITIAL_UPGRADES.map(u => ({ ...u })),
        lastSaved: Date.now(),
        comboCount: 0,
        lastTapTime: 0,
      };
    });
  }, []);

  const canPrestige = state.totalEarned >= 1_000_000;
  const prestigePointsAvailable = Math.floor(state.totalEarned / 1_000_000);

  return {
    state,
    tap,
    buyWorker,
    buyUpgrade,
    prestige,
    canPrestige,
    prestigePointsAvailable,
    getWorkerCost,
    getUpgradeCost,
    locations: LOCATIONS,
    formatCurrency,
  };
}
