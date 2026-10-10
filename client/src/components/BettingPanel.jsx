import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameSocketContext';
import { Minus, Plus, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

const SingleBetWidget = ({ betNumber }) => {
  const { user, currency } = useAuth();
  const { gameState, multiplier, myBets, placeBet, cashOut } = useGame();

  const isPKR = currency === 'PKR';
  const defaultAmount = isPKR ? 100 : 5;
  const [amount, setAmount] = useState(defaultAmount);
  const [autoBet, setAutoBet] = useState(false);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState(2.00);

  const activeBet = myBets[betNumber];

  // Auto Bet Trigger during WAITING phase
  useEffect(() => {
    if (gameState === 'WAITING' && autoBet && !activeBet && user) {
      const balance = isPKR ? user.balance_pkr : user.balance_usdt;
      if (balance >= amount) {
        placeBet(betNumber, amount, autoCashout ? autoCashoutMultiplier : null);
      }
    }
  }, [gameState, autoBet]);

  // Adjust amount helpers
  const handleHalf = () => setAmount(prev => Math.max(isPKR ? 50 : 1, Number((prev / 2).toFixed(isPKR ? 0 : 2))));
  const handleDouble = () => setAmount(prev => Number((prev * 2).toFixed(isPKR ? 0 : 2)));
  const handleMinus = () => setAmount(prev => Math.max(isPKR ? 50 : 1, prev - (isPKR ? 50 : 1)));
  const handlePlus = () => setAmount(prev => prev + (isPKR ? 50 : 1));

  const pkrChips = [100, 200, 500, 1000];
  const usdtChips = [5, 10, 25, 50];
  const activeChips = isPKR ? pkrChips : usdtChips;

  // Handle Bet / Cashout click
  const handleMainAction = () => {
    if (!user) return;

    if (gameState === 'WAITING' && !activeBet) {
      placeBet(betNumber, amount, autoCashout ? autoCashoutMultiplier : null);
    } else if (gameState === 'FLYING' && activeBet && activeBet.status === 'ACTIVE') {
      cashOut(activeBet.id);
    }
  };

  const currentLiveWin = activeBet && activeBet.status === 'ACTIVE'
    ? (activeBet.amount * multiplier).toFixed(2)
    : '0.00';

  return (
    <div className="flex-1 bg-[#14171f] border border-[#262b3a] rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-xl">
      {/* Top Header: Bet Number, Auto Bet & Auto Cashout Toggles */}
      <div className="flex items-center justify-between pb-3 border-b border-[#262b3a]/70">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-aviator-red"></span>
          <span className="text-xs md:text-sm font-black text-white font-['Outfit'] tracking-wide">
            BET #{betNumber}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Bet Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={autoBet}
              onChange={(e) => setAutoBet(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#090b0e] border-[#262b3a] text-aviator-red focus:ring-0 cursor-pointer"
            />
            <span>Auto Bet</span>
          </label>

          {/* Auto Cashout Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={autoCashout}
              onChange={(e) => setAutoCashout(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#090b0e] border-[#262b3a] text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span>Auto Cash</span>
          </label>
        </div>
      </div>

      {/* Inputs & Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
        {/* Left Column: Bet Amount & Step Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-xl overflow-hidden p-1">
            <button
              onClick={handleMinus}
              disabled={gameState === 'FLYING' && !!activeBet}
              className="w-8 h-8 rounded-lg bg-[#1b1f2b] hover:bg-[#262b3a] text-slate-200 flex items-center justify-center font-bold text-sm transition-colors disabled:opacity-50"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              disabled={gameState === 'FLYING' && !!activeBet}
              className="flex-1 bg-transparent text-center text-white font-mono font-bold text-sm md:text-base outline-none disabled:opacity-50"
            />

            <button
              onClick={handlePlus}
              disabled={gameState === 'FLYING' && !!activeBet}
              className="w-8 h-8 rounded-lg bg-[#1b1f2b] hover:bg-[#262b3a] text-slate-200 flex items-center justify-center font-bold text-sm transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Preset Chips */}
          <div className="grid grid-cols-4 gap-1.5">
            {activeChips.map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                disabled={gameState === 'FLYING' && !!activeBet}
                className={`py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors ${amount === val ? 'bg-aviator-red/20 text-aviator-red border-aviator-red/40' : 'bg-[#1b1f2b] text-slate-300 border-[#262b3a] hover:bg-[#262b3a]'}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Auto Cashout Multiplier & Math controls */}
        <div className="flex flex-col justify-between gap-2">
          {autoCashout ? (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Auto Cashout Multiplier</span>
              <div className="flex items-center bg-[#090b0e] border border-emerald-500/40 rounded-xl px-2.5 py-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="1.05"
                  value={autoCashoutMultiplier}
                  onChange={(e) => setAutoCashoutMultiplier(Number(e.target.value))}
                  className="flex-1 bg-transparent text-emerald-400 font-mono font-bold text-sm outline-none"
                />
                <span className="text-emerald-400 font-bold text-xs">x</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 h-full">
              <button
                onClick={handleHalf}
                disabled={gameState === 'FLYING' && !!activeBet}
                className="bg-[#1b1f2b] hover:bg-[#262b3a] text-slate-300 border border-[#262b3a] rounded-xl font-mono text-xs font-bold transition-colors"
              >
                /2
              </button>
              <button
                onClick={handleDouble}
                disabled={gameState === 'FLYING' && !!activeBet}
                className="bg-[#1b1f2b] hover:bg-[#262b3a] text-slate-300 border border-[#262b3a] rounded-xl font-mono text-xs font-bold transition-colors"
              >
                2X
              </button>
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
            <span>Currency:</span>
            <span className="font-bold text-white font-mono">{currency}</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC BIG ACTION BUTTON */}
      <div className="mt-1">
        {/* 1. WAITING / BETTING PHASE */}
        {gameState === 'WAITING' && (
          activeBet ? (
            <button
              disabled
              className="w-full h-14 rounded-2xl bg-amber-600/30 border border-amber-500/50 text-amber-300 font-['Outfit'] font-black text-base md:text-lg flex flex-col items-center justify-center cursor-not-allowed shadow-lg"
            >
              <span>BET PLACED</span>
              <span className="text-xs font-mono font-semibold text-amber-200">
                {activeBet.amount} {currency} • Waiting for Takeoff...
              </span>
            </button>
          ) : (
            <button
              onClick={handleMainAction}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-['Outfit'] font-black text-lg md:text-xl flex flex-col items-center justify-center shadow-xl shadow-emerald-950/40 glow-green transition-all transform active:scale-98"
            >
              <span>BET</span>
              <span className="text-xs font-mono font-bold text-emerald-100">
                {amount} {currency}
              </span>
            </button>
          )
        )}

        {/* 2. FLYING PHASE */}
        {gameState === 'FLYING' && (
          activeBet && activeBet.status === 'ACTIVE' ? (
            <button
              onClick={handleMainAction}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-['Outfit'] font-black text-lg md:text-xl flex flex-col items-center justify-center shadow-2xl glow-gold transition-all transform active:scale-95 animate-pulse"
            >
              <span className="tracking-wide">CASH OUT</span>
              <span className="text-xs md:text-sm font-mono font-extrabold text-slate-900">
                {currentLiveWin} {currency} ({multiplier.toFixed(2)}x)
              </span>
            </button>
          ) : activeBet && activeBet.status === 'WON' ? (
            <div className="w-full h-14 rounded-2xl bg-emerald-900/40 border border-emerald-500/60 text-emerald-400 font-['Outfit'] font-black text-base flex flex-col items-center justify-center">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> CASHED OUT {activeBet.cashout_multiplier.toFixed(2)}x
              </span>
              <span className="text-xs font-mono font-bold text-emerald-200">
                Payout: {activeBet.payout} {currency}
              </span>
            </div>
          ) : (
            <button
              disabled
              className="w-full h-14 rounded-2xl bg-[#1b1f2b] border border-[#262b3a] text-slate-500 font-['Outfit'] font-bold text-sm md:text-base flex items-center justify-center cursor-not-allowed"
            >
              <span>IN FLIGHT • WAIT FOR NEXT ROUND</span>
            </button>
          )
        )}

        {/* 3. CRASHED EVENT */}
        {gameState === 'CRASHED' && (
          activeBet && activeBet.status === 'WON' ? (
            <div className="w-full h-14 rounded-2xl bg-emerald-900/40 border border-emerald-500/60 text-emerald-400 font-['Outfit'] font-black text-base flex flex-col items-center justify-center">
              <span>CASHED OUT {activeBet.cashout_multiplier.toFixed(2)}x</span>
              <span className="text-xs font-mono text-emerald-200">+{activeBet.payout} {currency}</span>
            </div>
          ) : activeBet && activeBet.status === 'LOST' ? (
            <div className="w-full h-14 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-400 font-['Outfit'] font-bold text-base flex flex-col items-center justify-center">
              <span>BET LOST</span>
              <span className="text-xs font-mono text-rose-300">Crashed before cashout</span>
            </div>
          ) : (
            <div className="w-full h-14 rounded-2xl bg-[#1b1f2b] border border-[#262b3a] text-slate-400 font-['Outfit'] font-bold text-sm flex items-center justify-center">
              <span>ROUND OVER</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const BettingPanel = () => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
      <SingleBetWidget betNumber={1} />
      <SingleBetWidget betNumber={2} />
    </div>
  );
};

export default BettingPanel;
