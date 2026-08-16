/**
 * ProfileSelectorModal Component
 * Handles selecting existing player profiles or adding a new player profile instantly.
 */

import React, { useState } from 'react';
import { UserPlus, UserCheck, Trash2, Shield, Check, X } from 'lucide-react';
import { PlayerProfile } from '../types';

interface ProfileSelectorModalProps {
  profiles: PlayerProfile[];
  activeProfileId: string;
  onSelectProfile: (profile: PlayerProfile) => void;
  onCreateProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
  onClose: () => void;
}

export const ProfileSelectorModal: React.FC<ProfileSelectorModalProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProfile(newName.trim());
    setNewName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl relative">
        {/* Close Button */}
        {activeProfileId && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            CHOOSE PLAYER
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Local profiles on this device. Separate scores and progress.
          </p>
        </div>

        {/* Profiles List */}
        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 mb-5">
          {profiles.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm italic">
              No local profiles yet. Add one below to start playing!
            </div>
          ) : (
            profiles.map((p) => {
              const isActive = p.id === activeProfileId;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/50'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div
                    onClick={() => onSelectProfile(p)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md relative"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                      {isActive && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 border border-slate-900">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {p.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Level {p.currentLevel} • ★ {p.totalStars} • Score{' '}
                        {p.totalScore.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => onSelectProfile(p)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                      >
                        Select
                      </button>
                    )}

                    {deletingId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteProfile(p.id);
                            setDeletingId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-1 bg-slate-700 text-slate-300 text-[10px] rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Player Section */}
        {isAdding ? (
          <form
            onSubmit={handleCreate}
            className="bg-slate-800/90 border border-amber-500/40 rounded-xl p-3.5 space-y-3"
          >
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Enter Your Name:
            </label>
            <input
              type="text"
              autoFocus
              maxLength={20}
              placeholder="Player Name (e.g., Ali)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <UserCheck className="w-4 h-4" />
                <span>ADD PLAYER</span>
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 tracking-wide uppercase"
          >
            <UserPlus className="w-5 h-5" />
            <span>+ ADD PLAYER</span>
          </button>
        )}
      </div>
    </div>
  );
};
