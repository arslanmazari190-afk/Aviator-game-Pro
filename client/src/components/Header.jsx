import React, { useState } from 'react';
import { 
  Plane, ShieldCheck, HelpCircle, Volume2, VolumeX, 
  Wallet, ArrowUpRight, ArrowDownLeft, ShieldAlert, 
  User, LogOut, ChevronDown, CheckCircle2, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useGame } from '../context/GameSocketContext';

const Header = ({ 
  onOpenDeposit, 
  onOpenWithdraw, 
  onOpenProvablyFair, 
  onOpenHowToPlay, 
  onOpenAuth,
  onOpenAdmin,
  isAdminView,
  setIsAdminView
}) => {
  const { user, currency, setCurrency, logout, demoLogin, adminLogin } = useAuth();
  const { isMuted, toggleMute } = useSound();
  const { connected } = useGame();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const formattedBalance = user 
    ? (currency === 'PKR' 
        ? `₨ ${(user.balance_pkr || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$ ${(user.balance_usdt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`)
    : '₨ 0.00';

  return (
    <header className="h-16 bg-[#14171f]/95 border-b border-[#262b3a] px-3 md:px-6 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 md:gap-6">
        <div 
          onClick={() => setIsAdminView(false)}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-aviator-red to-[#ff4760] flex items-center justify-center shadow-lg shadow-aviator-red/30 group-hover:scale-105 transition-transform duration-200">
            <Plane className="w-6 h-6 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-wider text-white font-['Outfit']">AVIATOR</span>
              <span className="bg-aviator-red/20 text-aviator-red text-[10px] font-bold px-1.5 py-0.5 rounded border border-aviator-red/30 uppercase tracking-wider">PRO</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{connected ? 'Live Multiplier' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onOpenProvablyFair}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#1b1f2b] hover:bg-[#262b3a] px-3 py-1.5 rounded-lg border border-slate-700/50 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Provably Fair</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#1b1f2b] hover:bg-[#262b3a] px-3 py-1.5 rounded-lg border border-slate-700/50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>How to Play</span>
          </button>
        </div>
      </div>

      {/* Center / Right Section: Balance, Deposit, Tools & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Currency Switcher & Balance Box */}
        <div className="relative">
          <div 
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-xl px-2.5 md:px-3 py-1.5 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div className="flex flex-col text-right mr-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-end gap-1">
                {currency} Wallet <ChevronDown className="w-3 h-3" />
              </span>
              <span className="text-xs md:text-sm font-extrabold text-emerald-400 font-mono tracking-tight">
                {formattedBalance}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Currency Dropdown */}
          {currencyOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#14171f] border border-[#262b3a] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Currency</div>
              <button
                onClick={() => { setCurrency('PKR'); setCurrencyOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1b1f2b] transition-colors ${currency === 'PKR' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
              >
                <span>Pakistani Rupee (PKR ₨)</span>
                {currency === 'PKR' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setCurrency('USDT'); setCurrencyOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1b1f2b] transition-colors ${currency === 'USDT' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
              >
                <span>Tether USD (USDT TRC20)</span>
                {currency === 'USDT' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Deposit Button */}
        <button
          onClick={onOpenDeposit}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all transform active:scale-95"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Deposit</span>
        </button>

        {/* Withdraw Button */}
        <button
          onClick={onOpenWithdraw}
          className="bg-[#1b1f2b] hover:bg-[#262b3a] text-slate-200 text-xs md:text-sm font-bold px-3 py-2 rounded-xl border border-slate-700/60 flex items-center gap-1.5 transition-colors active:scale-95"
        >
          <ArrowUpRight className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Withdraw</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className={`p-2 rounded-xl border transition-colors ${isMuted ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-[#1b1f2b] border-slate-700/60 text-slate-300 hover:text-white'}`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Admin Dashboard Switcher Button */}
        <button
          onClick={() => setIsAdminView(!isAdminView)}
          title="Toggle Admin Backoffice"
          className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${isAdminView ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30' : 'bg-[#1b1f2b] border-amber-500/40 text-amber-400 hover:bg-amber-500/10'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden md:inline">{isAdminView ? 'Exit Admin' : 'Admin'}</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-[#1b1f2b] hover:bg-[#262b3a] border border-[#262b3a] px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              {user ? user.username.substring(0, 2).toUpperCase() : 'G'}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-slate-200">
              {user ? user.username : 'Guest'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#14171f] border border-[#262b3a] rounded-xl shadow-2xl py-2 z-50">
              {user ? (
                <>
                  <div className="px-3 py-2 border-b border-[#262b3a]">
                    <div className="text-xs font-bold text-white">{user.username}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <Sparkles className="w-3 h-3" /> Role: {user.role.toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); onOpenDeposit(); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1b1f2b] flex items-center gap-2"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Quick Deposit (EasyPaisa/JazzCash)
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); onOpenWithdraw(); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1b1f2b] flex items-center gap-2"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" /> Request Withdrawal
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-[#1b1f2b] flex items-center gap-2 border-t border-[#262b3a] mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setDropdownOpen(false); onOpenAuth(); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1b1f2b] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-blue-400" /> Login / Register
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); demoLogin(); }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-[#1b1f2b] flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Account (PKR 50k)
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); adminLogin(); }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-[#1b1f2b] flex items-center gap-2 border-t border-[#262b3a] mt-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> 1-Click Admin Access
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
