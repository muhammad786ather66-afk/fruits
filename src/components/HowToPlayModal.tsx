/**
 * HowToPlayModal Component
 * Visual interactive tutorial explaining fruit basket sorting rules and special mechanics.
 */

import React from 'react';
import { HelpCircle, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-2xl w-full max-w-md p-5 text-[#4A4941] shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2D9] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E9EDC9] text-[#5F6F52] rounded-xl border border-[#86A789]/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#4A4941] tracking-tight">
                HOW TO PLAY
              </h2>
              <p className="text-xs text-[#9A9B8F]">
                Master the fruit sorting puzzle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FEFAE0] border border-[#E9EDC9] text-[#9A9B8F] hover:text-[#4A4941]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 text-sm">
          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-[#86A789] text-white font-black flex items-center justify-center text-xs shrink-0">
              1
            </div>
            <div>
              <h3 className="font-extrabold text-[#5F6F52]">Tap a Source Basket</h3>
              <p className="text-xs text-[#4A4941] mt-0.5">
                Tap or click any basket to pick up its top fruit.
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-[#86A789] text-white font-black flex items-center justify-center text-xs shrink-0">
              2
            </div>
            <div>
              <h3 className="font-extrabold text-[#5F6F52]">Tap Destination Basket</h3>
              <p className="text-xs text-[#4A4941] mt-0.5">
                Move the top fruit to another basket that is either empty or holds the same matching fruit on top.
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-[#86A789] text-white font-black flex items-center justify-center text-xs shrink-0">
              3
            </div>
            <div>
              <h3 className="font-extrabold text-[#5F6F52]">Respect Capacity Limits</h3>
              <p className="text-xs text-[#4A4941] mt-0.5">
                Baskets hold a maximum capacity (e.g. 4 fruits). You cannot place a fruit in a full basket.
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-[#86A789] text-white font-black flex items-center justify-center text-xs shrink-0">
              4
            </div>
            <div>
              <h3 className="font-extrabold text-[#5F6F52]">Solve the Puzzle</h3>
              <p className="text-xs text-[#4A4941] mt-0.5">
                The level is complete when every active basket contains only ONE type of fruit!
              </p>
            </div>
          </div>

          {/* Useful Tools */}
          <div className="pt-2 border-t border-[#E0E2D9]">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#9A9B8F] mb-2">
              Helpful Tools
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-[#E0E2D9]">
                <span className="font-bold text-[#5F6F52]">↺ UNDO:</span> Revert previous move without penalty.
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-[#E0E2D9]">
                <span className="font-bold text-[#86A789]">💡 HINT:</span> Runs AI solver to show the next best move.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
