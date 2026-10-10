import React, { useState } from 'react';
import { useGame } from '../context/GameSocketContext';
import { History, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

const MultiplierRibbon = ({ onSelectRoundForAudit }) => {
  const { recentRounds } = useGame();
  const [expanded, setExpanded] = useState(false);

  const getPillStyle = (multiplier) => {
    const val = Number(multiplier);
    if (val >= 10.0) {
      return 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]';
    } else if (val >= 2.0) {
      return 'bg-purple-900/30 text-purple-300 border-purple-600/50';
    } else {
      return 'bg-blue-950/40 text-blue-300 border-blue-700/40';
    }
  };

  return (
    <div className="w-full bg-[#14171f] border-b border-[#262b3a] px-3 py-2 flex flex-col z-20">
      <div className="flex items-center justify-between gap-2">
        {/* Ribbon Header Icon */}
        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold shrink-0">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Rounds:</span>
        </div>

        {/* Scrollable Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 scroll-smooth">
          {recentRounds && recentRounds.length > 0 ? (
            recentRounds.slice(0, 25).map((round) => (
              <button
                key={round.id || round.round_number}
                onClick={() => onSelectRoundForAudit(round)}
                title={`Round #${round.round_number} - Click to verify Provably Fair`}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-transform hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1 ${getPillStyle(round.crash_multiplier)}`}
              >
                <span>{Number(round.crash_multiplier).toFixed(2)}x</span>
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No previous rounds yet</span>
          )}
        </div>

        {/* History Dropdown Toggle Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="bg-[#1b1f2b] hover:bg-[#262b3a] border border-[#262b3a] text-slate-300 p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors shrink-0"
          title="Toggle Full History Drawer"
        >
          <span className="hidden md:inline text-[11px] font-semibold">History</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded History Grid Drawer */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-[#262b3a] max-h-48 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 bg-[#0c0e14] rounded-xl">
          {recentRounds.map((round) => (
            <button
              key={round.id || round.round_number}
              onClick={() => onSelectRoundForAudit(round)}
              className={`p-1.5 rounded-lg border text-center transition-transform hover:scale-105 flex flex-col items-center justify-center ${getPillStyle(round.crash_multiplier)}`}
            >
              <span className="text-[10px] text-slate-400 font-mono">#{round.round_number}</span>
              <span className="text-xs font-bold font-mono">{Number(round.crash_multiplier).toFixed(2)}x</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiplierRibbon;
