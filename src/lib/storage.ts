/**
 * IndexedDB & LocalStorage Persistence Manager
 */

import { PlayerProfile } from '../types';

const DB_NAME = 'FruitSortDB';
const DB_VERSION = 1;
const STORE_PROFILES = 'profiles';
const KEY_ACTIVE_PLAYER = 'fruit_sort_active_player';

// Helper for opening IndexedDB safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROFILES)) {
        db.createObjectStore(STORE_PROFILES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback to localStorage if IndexedDB fails
function getLocalProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem('fruit_sort_profiles');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProfiles(profiles: PlayerProfile[]) {
  try {
    localStorage.setItem('fruit_sort_profiles', JSON.stringify(profiles));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

// Public Storage API
export async function getAllProfiles(): Promise<PlayerProfile[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROFILES, 'readonly');
      const store = tx.objectStore(STORE_PROFILES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as PlayerProfile[]);
      req.onerror = () => resolve(getLocalProfiles());
    });
  } catch {
    return getLocalProfiles();
  }
}

export async function getProfile(id: string): Promise<PlayerProfile | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROFILES, 'readonly');
      const store = tx.objectStore(STORE_PROFILES);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as PlayerProfile) || null);
      req.onerror = () => {
        const list = getLocalProfiles();
        resolve(list.find((p) => p.id === id) || null);
      };
    });
  } catch {
    const list = getLocalProfiles();
    return list.find((p) => p.id === id) || null;
  }
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  // Sync to IndexedDB and fallback LocalStorage simultaneously for double safety
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROFILES, 'readwrite');
      const store = tx.objectStore(STORE_PROFILES);
      const req = store.put(profile);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, using fallback:', err);
  }

  const profiles = getLocalProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  saveLocalProfiles(profiles);
}

export async function deleteProfile(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_PROFILES, 'readwrite');
      const store = tx.objectStore(STORE_PROFILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }

  const profiles = getLocalProfiles().filter((p) => p.id !== id);
  saveLocalProfiles(profiles);

  if (getActivePlayerId() === id) {
    setActivePlayerId('');
  }
}

export function getActivePlayerId(): string {
  try {
    return localStorage.getItem(KEY_ACTIVE_PLAYER) || '';
  } catch {
    return '';
  }
}

export function setActivePlayerId(id: string): void {
  try {
    localStorage.setItem(KEY_ACTIVE_PLAYER, id);
  } catch {
    // ignore
  }
}

export function createNewPlayerProfile(name: string): PlayerProfile {
  const colors = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
  ];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  return {
    id: 'player_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    name: name.trim() || 'Player',
    avatarColor,
    createdAt: Date.now(),
    currentLevel: 1,
    highestLevelReached: 1,
    totalScore: 0,
    totalStars: 0,
    totalFruitsSorted: 0,
    totalMovesMade: 0,
    totalLevelsCompleted: 0,
    perfectLevelsCount: 0,
    hintsUsedCount: 0,
    bestStreak: 0,
    currentStreak: 0,
    lastPlayedDate: new Date().toISOString().slice(0, 10),
    levelProgress: {},
    dailyPuzzleHistory: {},
    unlockedThemes: ['classic'],
    currentTheme: 'classic',
    unlockedAchievements: [],
  };
}

export async function exportAllSaveData(): Promise<string> {
  const profiles = await getAllProfiles();
  const activeId = getActivePlayerId();
  const exportObject = {
    version: 1,
    timestamp: Date.now(),
    activePlayerId: activeId,
    profiles,
  };
  return JSON.stringify(exportObject, null, 2);
}

export async function importAllSaveData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.profiles)) {
      return false;
    }
    for (const p of data.profiles) {
      if (p.id && p.name) {
        await saveProfile(p);
      }
    }
    if (data.activePlayerId) {
      setActivePlayerId(data.activePlayerId);
    }
    return true;
  } catch (err) {
    console.error('Import save error:', err);
    return false;
  }
}
