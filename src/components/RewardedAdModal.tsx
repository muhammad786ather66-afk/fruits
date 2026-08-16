/**
 * RewardedAdModal Component
 * Full-screen rewarded & interstitial video ad experience for unlocking Hints, Extra Tubes, and Next Level transitions.
 * Ensures strict 10-15 seconds full-screen viewing before granting rewards.
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Trophy,
  ExternalLink,
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  VolumeX,
  X,
  Lightbulb,
  FlaskConical,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { audio } from '../lib/audio';

export type AdRewardType =
  | 'hint'
  | 'bottle'
  | 'next_level'
  | 'two_ads_basket_1'
  | 'two_ads_basket_2';

interface RewardedAdModalProps {
  rewardType: AdRewardType;
  rewardTitle: string;
  rewardDescription: string;
  requiredSeconds?: number; // 10 to 15 seconds
  adUrl?: string;
  onClaimReward: () => void;
  onCancel?: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  rewardType,
  rewardTitle,
  rewardDescription,
  requiredSeconds = 15,
  adUrl = 'https://www.effectivecpmnetwork.com/injygstv?key=58b512b8278fdb4d1fb08d6d0bad6c5e',
  onClaimReward,
  onCancel,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(requiredSeconds);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isAdMuted, setIsAdMuted] = useState<boolean>(false);
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);

  // Play audio cue when ad opens
  useEffect(() => {
    audio.playClick();
    audio.speakVoice(`Sponsored Ad. Watch ${requiredSeconds} seconds to receive ${rewardTitle}`);
  }, [requiredSeconds, rewardTitle]);

  // Timer countdown loop
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isCompleted) {
        setIsCompleted(true);
        audio.playBasketComplete();
        audio.speakVoice('Reward ready to claim!');
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isCompleted]);

  const progressPercent = Math.min(
    100,
    Math.max(0, ((requiredSeconds - timeLeft) / requiredSeconds) * 100)
  );

  const handleClaim = () => {
    if (!isCompleted) {
      setShowExitWarning(true);
      setTimeout(() => setShowExitWarning(false), 2500);
      return;
    }
    audio.playClick();
    onClaimReward();
  };

  const handleVisitSponsor = () => {
    audio.playClick();
    window.open(adUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCloseClick = () => {
    if (!isCompleted) {
      setShowExitWarning(true);
      setTimeout(() => setShowExitWarning(false), 2500);
    } else if (onCancel) {
      onCancel();
    }
  };

  const getRewardIcon = () => {
    switch (rewardType) {
      case 'hint':
        return <Lightbulb className="w-6 h-6 text-amber-300" />;
      case 'bottle':
        return <FlaskConical className="w-6 h-6 text-fuchsia-300" />;
      case 'next_level':
        return <Trophy className="w-6 h-6 text-emerald-300" />;
      default:
        return <Zap className="w-6 h-6 text-amber-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] w-screen h-screen bg-slate-950/98 text-white flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none animate-fadeIn backdrop-blur-xl">
      {/* Background Animated Gradient Glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-purple-900 to-slate-950" />

      {/* Top Header Navigation Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-10 pt-1 pb-2 border-b border-slate-800">
        {/* Sponsor Badge & Reward Indicator */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-2">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">
              SPONSORED REWARD AD
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl">
            {getRewardIcon()}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">REWARD</span>
              <span className="text-xs font-black text-amber-300 leading-tight">{rewardTitle}</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Mute & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdMuted(!isAdMuted)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all cursor-pointer"
            title={isAdMuted ? 'Unmute Ad' : 'Mute Ad'}
          >
            {isAdMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {onCancel && (
            <button
              onClick={handleCloseClick}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Exit Warning Overlay Toast */}
      {showExitWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-rose-600 text-white font-black px-5 py-3 rounded-2xl shadow-2xl border-2 border-rose-300 flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-6 h-6 text-yellow-300" />
          <div className="flex flex-col text-left">
            <span className="text-xs tracking-wider uppercase">WATCH FULL 15-SECOND AD!</span>
            <span className="text-[11px] font-bold text-rose-100">
              Please wait {timeLeft}s to unlock {rewardTitle}.
            </span>
          </div>
        </div>
      )}

      {/* Main Full-Screen Ad Video Area */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center my-3 z-10 relative">
        <div className="w-full h-full max-h-[65vh] bg-slate-900/95 border-2 border-amber-400/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden relative">
          
          {/* Ad Top Information Bar */}
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold text-rose-400 uppercase tracking-widest text-[10px]">LIVE SPONSOR BROADCAST</span>
            </div>
            <div className="font-extrabold text-amber-300">
              {timeLeft > 0 ? (
                <span>WATCH TIME: <strong className="text-white">{timeLeft}s</strong> REMAINING</span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> AD COMPLETED!
                </span>
              )}
            </div>
          </div>

          {/* Ad Frame / Interactive Video Viewport */}
          <div className="flex-1 w-full relative bg-slate-950 flex items-center justify-center overflow-hidden">
            <iframe
              src={adUrl}
              title="Sponsored Video Ad"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />

            {/* Video Watermark & Play Status */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[10px] font-black text-amber-300 flex items-center gap-1.5 pointer-events-none">
              <Play className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
              <span>HD REWARDED AD</span>
            </div>
          </div>

          {/* Ad Bottom Sponsor Call to Action */}
          <div className="bg-slate-950/90 p-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-left">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {getRewardIcon()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase">{rewardTitle}</span>
                <span className="text-[11px] text-slate-400 font-medium">{rewardDescription}</span>
              </div>
            </div>

            <button
              onClick={handleVisitSponsor}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer border border-amber-200 transition-all hover:scale-102"
            >
              <span>OPEN SPONSOR OFFER</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar & Claim Button Controls */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3 z-10 pt-2 pb-1 border-t border-slate-800">
        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Claim Action Button */}
        <div className="w-full flex items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-400">
            {timeLeft > 0 ? (
              <span>Ad progress: <strong className="text-amber-300">{Math.round(progressPercent)}%</strong> ({timeLeft}s left)</span>
            ) : (
              <span className="text-emerald-400 font-extrabold">Ad finished! Ready to claim.</span>
            )}
          </div>

          <button
            onClick={handleClaim}
            disabled={!isCompleted}
            className={`px-6 sm:px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.7)] scale-105 animate-bounce border-2 border-emerald-200'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>CLAIM {rewardTitle.toUpperCase()} NOW</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-500" />
                <span>CLAIM IN {timeLeft}S...</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
