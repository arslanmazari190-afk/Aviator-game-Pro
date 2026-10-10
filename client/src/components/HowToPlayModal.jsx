import React from 'react';
import { X, Plane, DollarSign, Zap, ShieldCheck } from 'lucide-react';

const HowToPlayModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#14171f] border border-[#262b3a] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#262b3a] flex items-center justify-between bg-[#0c0e14]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-lg text-white">How to Play Aviator</h3>
              <p className="text-xs text-slate-400">Master the crash game mechanics in 3 easy steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1b1f2b] text-slate-400 hover:text-white border border-[#262b3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0c0e14] border border-[#262b3a]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
              1
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Place Your Bet</h4>
              <p className="text-slate-400">
                Select your bet amount before the round starts during the 5-second countdown. You can place two simultaneous bets (Bet 1 & Bet 2) or use <strong>Auto Bet</strong>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0c0e14] border border-[#262b3a]">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
              2
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Watch the Multiplier Rise</h4>
              <p className="text-slate-400">
                As the plane takes off, the crash multiplier starts at <strong>1.00x</strong> and rises higher and higher. Your potential payout increases in real time!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0c0e14] border border-[#262b3a]">
            <div className="w-7 h-7 rounded-xl bg-aviator-red/20 text-aviator-red font-bold flex items-center justify-center shrink-0 border border-aviator-red/30">
              3
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Cash Out Before It Flew Away!</h4>
              <p className="text-slate-400">
                Click <strong>CASH OUT</strong> before the plane crashes or flies away to win your bet multiplied by the current odds. If the plane flies away before you cash out, the bet is lost.
              </p>
            </div>
          </div>

          {/* Auto Cashout Feature */}
          <div className="p-3.5 rounded-2xl bg-[#1b1f2b] border border-emerald-500/20 space-y-1">
            <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Pro Tip: Auto Cashout
            </span>
            <p className="text-[11px] text-slate-300">
              Set an Auto Cashout multiplier (e.g. 2.00x). The system will automatically cash out your winnings the instant the plane hits your target!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
