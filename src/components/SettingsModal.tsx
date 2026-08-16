/**
 * SettingsModal Component
 * Sound, Music, Vibration toggles, Theme Switcher, and JSON Export/Import functionality.
 */

import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  Vibrate,
  Download,
  Upload,
  Palette,
  X,
  Check,
} from 'lucide-react';
import { exportAllSaveData, importAllSaveData } from '../lib/storage';

interface SettingsModalProps {
  soundOn: boolean;
  musicOn: boolean;
  vibrationOn: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleVibration: () => void;
  onOpenThemes: () => void;
  onOpenHowToPlay: () => void;
  onClose: () => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundOn,
  musicOn,
  vibrationOn,
  onToggleSound,
  onToggleMusic,
  onToggleVibration,
  onOpenThemes,
  onOpenHowToPlay,
  onClose,
  onDataReload,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const jsonStr = await exportAllSaveData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fruit_sort_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export save error:', err);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = await importAllSaveData(content);
        if (ok) {
          setImportStatus('Data restored successfully!');
          onDataReload();
        } else {
          setImportStatus('Invalid save file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-2xl w-full max-w-md p-5 text-[#4A4941] shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2D9] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E9EDC9] text-[#5F6F52] rounded-xl border border-[#86A789]/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#4A4941] tracking-tight">
                SETTINGS
              </h2>
              <p className="text-xs text-[#9A9B8F]">Game & Data Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FEFAE0] border border-[#E9EDC9] text-[#9A9B8F] hover:text-[#4A4941]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio / Vibration Toggles */}
        <div className="space-y-2.5 mb-5">
          <div
            onClick={onToggleSound}
            className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[#E0E2D9] cursor-pointer hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-3">
              {soundOn ? (
                <Volume2 className="w-5 h-5 text-[#86A789]" />
              ) : (
                <VolumeX className="w-5 h-5 text-[#9A9B8F]" />
              )}
              <span className="font-extrabold text-sm text-[#4A4941]">
                Sound Effects
              </span>
            </div>
            <div
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                soundOn ? 'bg-[#86A789]' : 'bg-[#E0E2D9]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  soundOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div
            onClick={onToggleMusic}
            className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[#E0E2D9] cursor-pointer hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Music
                className={`w-5 h-5 ${
                  musicOn ? 'text-[#86A789]' : 'text-[#9A9B8F]'
                }`}
              />
              <span className="font-extrabold text-sm text-[#4A4941]">
                Ambient Music
              </span>
            </div>
            <div
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                musicOn ? 'bg-[#86A789]' : 'bg-[#E0E2D9]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  musicOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div
            onClick={onToggleVibration}
            className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[#E0E2D9] cursor-pointer hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Vibrate
                className={`w-5 h-5 ${
                  vibrationOn ? 'text-[#86A789]' : 'text-[#9A9B8F]'
                }`}
              />
              <span className="font-extrabold text-sm text-[#4A4941]">
                Haptic Vibration
              </span>
            </div>
            <div
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                vibrationOn ? 'bg-[#86A789]' : 'bg-[#E0E2D9]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  vibrationOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => {
              onClose();
              onOpenThemes();
            }}
            className="flex items-center justify-center gap-2 p-2.5 bg-[#FEFAE0] hover:bg-[#F2EDD0] border border-[#E9EDC9] rounded-xl text-xs font-bold text-[#4A4941] transition-colors"
          >
            <Palette className="w-4 h-4 text-[#86A789]" />
            <span>Board Themes</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenHowToPlay();
            }}
            className="flex items-center justify-center gap-2 p-2.5 bg-[#FEFAE0] hover:bg-[#F2EDD0] border border-[#E9EDC9] rounded-xl text-xs font-bold text-[#4A4941] transition-colors"
          >
            <span>How To Play</span>
          </button>
        </div>

        {/* Data Backup / Export / Import */}
        <div className="border-t border-[#E0E2D9] pt-4">
          <h3 className="text-xs font-bold uppercase text-[#9A9B8F] mb-2 tracking-wider">
            DATA BACKUP (JSON)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-[#FEFAE0] border border-[#E0E2D9] rounded-xl text-xs font-bold text-[#5F6F52] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT SAVE</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-[#FEFAE0] border border-[#E0E2D9] rounded-xl text-xs font-bold text-[#86A789] transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>IMPORT SAVE</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="mt-2 text-center text-xs font-bold text-[#5F6F52]">
              {importStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
