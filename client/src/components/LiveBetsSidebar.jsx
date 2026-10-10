import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameSocketContext';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../api';
import { Users, UserCheck, Trophy, ArrowUpRight, Flame } from 'lucide-react';

const LiveBetsSidebar = () => {
  const { activeBets, topWins, multiplier, gameState } = useGame();
  const { user, token, currency } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MY' | 'TOP'
  const [myHistory, setMyHistory] = useState([]);

  // Fetch user personal bets history
  useEffect(() => {
    if (activeTab === 'MY' && token) {
      fetch(apiUrl('/api/game/my-bets'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMyHistory(data.bets);
          }
        })
        .catch(() => {});
    }
  }, [activeTab, token, gameState]);

  const totalPoolPKR = activeBets.reduce((acc, b) => acc + (b.currency === 'PKR' ? b.amount : b.amount * 278), 0);

  return (
    <div className="w-full lg:w-80 bg-[#14171f] border border-[#262b3a] rounded-2xl flex flex-col h-[520px] lg:h-full overflow-hidden shadow-2xl">
      {/* Sidebar Tab Header */}
      <div className="p-2 border-b border-[#262b3a] grid grid-cols-3 gap-1 bg-[#0c0e14]">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'ALL' ? 'bg-[#1b1f2b] text-white border border-slate-700 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>All Bets</span>
          <span className="bg-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono text-slate-300">
            {activeBets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MY')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'MY' ? 'bg-[#1b1f2b] text-white border border-slate-700 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>My Bets</span>
        </button>

        <button
          onClick={() => setActiveTab('TOP')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'TOP' ? 'bg-[#1b1f2b] text-white border border-slate-700 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Top Wins</span>
        </button>
      </div>

      {/* Summary Info Bar for Active Bets */}
      {activeTab === 'ALL' && (
        <div className="px-4 py-2 bg-[#090b0e]/60 border-b border-[#262b3a] flex items-center justify-between text-[11px] text-slate-400 font-semibold">
          <span>Active Players: <strong className="text-white">{activeBets.length}</strong></span>
          <span>Round Pool: <strong className="text-emerald-400 font-mono">₨ {Math.round(totalPoolPKR).toLocaleString()}</strong></span>
        </div>
      )}

      {/* Bets Table List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {/* TAB 1: ALL BETS (LIVE MULTIPLAYER & BOTS) */}
        {activeTab === 'ALL' && (
          activeBets.length > 0 ? (
            activeBets.map((bet) => {
              const isWon = bet.status === 'WON';
              return (
                <div
                  key={bet.id}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs border transition-colors ${isWon ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-[#1b1f2b]/70 border-slate-800 text-slate-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {bet.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold truncate max-w-[90px]">{bet.username}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-300">
                      {bet.amount} {bet.currency}
                    </span>

                    {isWon ? (
                      <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg">
                          {Number(bet.cashout_multiplier).toFixed(2)}x
                        </span>
                        <span className="font-mono font-bold text-emerald-400 min-w-[65px] text-right">
                          +{bet.payout}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono italic">
                        {gameState === 'FLYING' ? 'In Flight...' : 'Active'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
              <Users className="w-8 h-8 text-slate-600 mb-2" />
              <span>Waiting for bets to be placed...</span>
            </div>
          )
        )}

        {/* TAB 2: MY BETS HISTORY */}
        {activeTab === 'MY' && (
          myHistory.length > 0 ? (
            myHistory.map((bet) => {
              const isWon = bet.status === 'WON';
              return (
                <div
                  key={bet.id}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs border ${isWon ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-white">{bet.amount} {bet.currency}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(bet.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isWon ? (
                      <>
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded-lg">
                          {Number(bet.cashout_multiplier).toFixed(2)}x
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{bet.payout} {bet.currency}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-lg">
                        LOST
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
              <UserCheck className="w-8 h-8 text-slate-600 mb-2" />
              <span>No personal bets recorded yet.<br/>Place a bet to see history!</span>
            </div>
          )
        )}

        {/* TAB 3: TOP WINS LEADERBOARD */}
        {activeTab === 'TOP' && (
          topWins.length > 0 ? (
            topWins.map((win, idx) => (
              <div
                key={win.id || idx}
                className="px-3 py-2 rounded-xl bg-[#1b1f2b]/80 border border-amber-500/20 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-200 truncate max-w-[85px]">{win.username}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded text-[11px]">
                    {Number(win.cashout_multiplier).toFixed(2)}x
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₨ {Number(win.payout).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
              <Trophy className="w-8 h-8 text-amber-500/40 mb-2" />
              <span>Big wins will appear here!</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LiveBetsSidebar;
