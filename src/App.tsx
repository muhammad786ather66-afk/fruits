/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveScreen, LevelConfig, PlayerProfile } from './types';
import {
  createNewPlayerProfile,
  deleteProfile,
  getActivePlayerId,
  getAllProfiles,
  saveProfile,
  setActivePlayerId,
} from './lib/storage';
import { generateDailyPuzzleConfig, generateLevelConfig } from './lib/generator';
import { audio } from './lib/audio';

import { Header } from './components/Header';
import { GameView } from './components/GameView';
import { ProfileSelectorModal } from './components/ProfileSelectorModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { DailyPuzzleModal } from './components/DailyPuzzleModal';
import { ScoreboardModal } from './components/ScoreboardModal';
import { StatsModal } from './components/StatsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ThemesModal } from './components/ThemesModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(null);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('game');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Settings State
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [vibrationOn, setVibrationOn] = useState(true);

  // Current Active Level Config
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [isDailyActive, setIsDailyActive] = useState(false);

  // Load All Profiles on Initial Startup
  const loadProfiles = useCallback(async () => {
    const list = await getAllProfiles();
    setProfiles(list);

    const activeId = getActivePlayerId();
    let current = list.find((p) => p.id === activeId) || null;

    // If no profiles exist at all, create a default "Player 1" profile automatically
    if (!current && list.length === 0) {
      const defaultProfile = createNewPlayerProfile('Player 1');
      await saveProfile(defaultProfile);
      setActivePlayerId(defaultProfile.id);
      current = defaultProfile;
      setProfiles([defaultProfile]);
    } else if (!current && list.length > 0) {
      current = list[0];
      setActivePlayerId(current.id);
    }

    setActiveProfile(current);
    if (current) {
      setCurrentLevelNumber(current.currentLevel);
    } else {
      setIsProfileModalOpen(true);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Generate / Load Level Config whenever activeProfile ID or currentLevelNumber changes
  const activeProfileId = activeProfile?.id;
  useEffect(() => {
    if (!activeProfileId) return;

    if (isDailyActive) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const dailyConf = generateDailyPuzzleConfig(todayStr);
      setLevelConfig(dailyConf);
    } else {
      const levelConf = generateLevelConfig(currentLevelNumber);
      setLevelConfig(levelConf);
    }
  }, [activeProfileId, currentLevelNumber, isDailyActive]);

  // Update Audio Engine Settings
  useEffect(() => {
    audio.setSettings(soundOn, musicOn, vibrationOn);
  }, [soundOn, musicOn, vibrationOn]);

  // Profile Management Handlers
  const handleSelectProfile = (profile: PlayerProfile) => {
    setActiveProfile(profile);
    setActivePlayerId(profile.id);
    setCurrentLevelNumber(profile.currentLevel);
    setIsDailyActive(false);
    setIsProfileModalOpen(false);
  };

  const handleCreateProfile = async (name: string) => {
    const newP = createNewPlayerProfile(name);
    await saveProfile(newP);
    setActivePlayerId(newP.id);

    const updatedList = await getAllProfiles();
    setProfiles(updatedList);
    setActiveProfile(newP);
    setCurrentLevelNumber(newP.currentLevel);
    setIsDailyActive(false);
    setIsProfileModalOpen(false);
  };

  const handleDeleteProfile = async (id: string) => {
    await deleteProfile(id);
    await loadProfiles();
  };

  const handleSaveProgress = async (updatedP: PlayerProfile) => {
    setActiveProfile(updatedP);
    await saveProfile(updatedP);
    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedP.id ? updatedP : p))
    );
  };

  // Level Navigation
  const handleNextLevel = () => {
    if (isDailyActive) {
      setIsDailyActive(false);
      if (activeProfile) {
        setCurrentLevelNumber(activeProfile.currentLevel);
      }
    } else {
      const nextLvl = currentLevelNumber + 1;
      setCurrentLevelNumber(nextLvl);
    }
  };

  const handleReplayLevel = () => {
    if (levelConfig) {
      // Force refresh current level config
      if (isDailyActive) {
        const todayStr = new Date().toISOString().slice(0, 10);
        setLevelConfig(generateDailyPuzzleConfig(todayStr));
      } else {
        setLevelConfig(generateLevelConfig(currentLevelNumber));
      }
    }
  };

  const handleSelectLevelNum = (lvlNum: number) => {
    setIsDailyActive(false);
    setCurrentLevelNumber(lvlNum);
    setActiveScreen('game');
  };

  const handleStartDailyPuzzle = () => {
    setIsDailyActive(true);
    setActiveScreen('game');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F2] text-[#4A4941] flex flex-col font-sans select-none antialiased">
      {/* Top Header Navigation */}
      <Header
        player={activeProfile}
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
        onOpenProfiles={() => setIsProfileModalOpen(true)}
      />

      {/* Main Game Screen */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full">
        {levelConfig && activeProfile ? (
          <GameView
            levelConfig={levelConfig}
            player={activeProfile}
            onSaveProgress={handleSaveProgress}
            onNextLevel={handleNextLevel}
            onReplayLevel={handleReplayLevel}
            onOpenLevelSelect={() => setActiveScreen('level_select')}
            onOpenProfiles={() => setIsProfileModalOpen(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4" />
            <p className="text-sm font-semibold">Generating Fruit Puzzle...</p>
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      {isProfileModalOpen && (
        <ProfileSelectorModal
          profiles={profiles}
          activeProfileId={activeProfile?.id || ''}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {activeScreen === 'level_select' && activeProfile && (
        <LevelSelectModal
          currentLevel={currentLevelNumber}
          highestLevelReached={activeProfile.highestLevelReached}
          levelProgress={activeProfile.levelProgress || {}}
          onSelectLevel={handleSelectLevelNum}
          onClose={() => setActiveScreen('game')}
        />
      )}

      {activeScreen === 'daily_puzzle' && activeProfile && (
        <DailyPuzzleModal
          player={activeProfile}
          onStartDaily={handleStartDailyPuzzle}
          onClose={() => setActiveScreen('game')}
        />
      )}

      {activeScreen === 'scoreboard' && (
        <ScoreboardModal
          profiles={profiles}
          activeProfileId={activeProfile?.id || ''}
          onClose={() => setActiveScreen('game')}
        />
      )}

      {activeScreen === 'stats' && activeProfile && (
        <StatsModal
          player={activeProfile}
          onClose={() => setActiveScreen('game')}
        />
      )}

      {activeScreen === 'achievements' && activeProfile && (
        <AchievementsModal
          player={activeProfile}
          onClose={() => setActiveScreen('game')}
        />
      )}

      {activeScreen === 'themes' && activeProfile && (
        <ThemesModal
          player={activeProfile}
          onSelectTheme={(themeId) => {
            if (activeProfile) {
              const updatedP = { ...activeProfile, currentTheme: themeId };
              handleSaveProgress(updatedP);
            }
          }}
          onClose={() => setActiveScreen('game')}
        />
      )}

      {activeScreen === 'how_to_play' && (
        <HowToPlayModal onClose={() => setActiveScreen('game')} />
      )}

      {activeScreen === 'settings' && (
        <SettingsModal
          soundOn={soundOn}
          musicOn={musicOn}
          vibrationOn={vibrationOn}
          onToggleSound={() => setSoundOn(!soundOn)}
          onToggleMusic={() => setMusicOn(!musicOn)}
          onToggleVibration={() => setVibrationOn(!vibrationOn)}
          onOpenThemes={() => setActiveScreen('themes')}
          onOpenHowToPlay={() => setActiveScreen('how_to_play')}
          onClose={() => setActiveScreen('game')}
          onDataReload={loadProfiles}
        />
      )}
    </div>
  );
}
