import React, { useState } from 'react';
import { 
  Plane, ShieldCheck, HelpCircle, Volume2, VolumeX, 
  Wallet, ArrowUpRight, ArrowDownLeft, ShieldAlert, 
  User, LogOut, ChevronDown, CheckCircle2, Sparkles, Menu, X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formattedBalance = user 
    ? (currency === 'PKR' 
        ? `₨ ${(user.balance_pkr || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$ ${(user.balance_usdt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`)
    : '₨ 0.00';

  return (
    <header className="relative min-h-16 bg-[#14171f]/95 border-b border-[#262b3a] px-2 sm:px-3 md:px-6 flex items-center justify-between gap-2 z-30 sticky top-0 backdrop-blur-md">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 md:gap-6 min-w-0">
        <div 
          onClick={() => setIsAdminView(false)}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-aviator-red to-[#ff4760] flex items-center justify-center shadow-lg shadow-aviator-red/30 group-hover:scale-105 transition-transform duration-200">
            <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white font-['Outfit']">AVIATOR</span>
              <span className="hidden min-[360px]:inline bg-aviator-red/20 text-aviator-red text-[10px] font-bold px-1.5 py-0.5 rounded border border-aviator-red/30 uppercase tracking-wider">PRO</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{connected ? 'Live Multiplier' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="hidden xl:flex items-center gap-2">
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
      <div className="hidden lg:flex items-center gap-2 md:gap-3">
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

      <div className="flex lg:hidden items-center gap-1.5 shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCurrencyOpen(!currencyOpen)}
            aria-label={`${currency} wallet: ${formattedBalance}. Change currency`}
            aria-expanded={currencyOpen}
            className="h-11 max-w-[112px] flex items-center gap-1.5 rounded-xl border border-[#262b3a] bg-[#090b0e] px-2"
          >
            <span className="min-w-0 truncate text-[10px] sm:text-xs font-extrabold text-emerald-400 font-mono">
              {formattedBalance}
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          </button>
          {currencyOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#14171f] border border-[#262b3a] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Currency</div>
              <button
                onClick={() => { setCurrency('PKR'); setCurrencyOpen(false); }}
                className={`w-full min-h-11 text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1b1f2b] transition-colors ${currency === 'PKR' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
              >
                <span>Pakistani Rupee (PKR ₨)</span>
                {currency === 'PKR' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setCurrency('USDT'); setCurrencyOpen(false); }}
                className={`w-full min-h-11 text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1b1f2b] transition-colors ${currency === 'USDT' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
              >
                <span>Tether USD (USDT TRC20)</span>
                {currency === 'USDT' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          className="h-11 w-11 rounded-xl border border-[#262b3a] bg-[#1b1f2b] text-slate-200 flex items-center justify-center"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Main navigation" className="absolute left-2 right-2 top-full mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-[#262b3a] bg-[#14171f] p-3 shadow-2xl lg:hidden">
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenProvablyFair(); }}
            className="min-h-12 flex items-center gap-2 rounded-xl border border-[#262b3a] bg-[#1b1f2b] px-3 text-left text-xs font-semibold text-slate-200"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" /> Provably Fair
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenHowToPlay(); }}
            className="min-h-12 flex items-center gap-2 rounded-xl border border-[#262b3a] bg-[#1b1f2b] px-3 text-left text-xs font-semibold text-slate-200"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" /> How to Play
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenDeposit(); }}
            className="min-h-12 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 text-left text-xs font-semibold text-emerald-300"
          >
            <ArrowDownLeft className="w-4 h-4 shrink-0" /> Deposit
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenWithdraw(); }}
            className="min-h-12 flex items-center gap-2 rounded-xl border border-[#262b3a] bg-[#1b1f2b] px-3 text-left text-xs font-semibold text-slate-200"
          >
            <ArrowUpRight className="w-4 h-4 shrink-0 text-amber-400" /> Withdraw
          </button>
          <button
            onClick={() => { toggleMute(); }}
            className="min-h-12 flex items-center gap-2 rounded-xl border border-[#262b3a] bg-[#1b1f2b] px-3 text-left text-xs font-semibold text-slate-200"
          >
            {isMuted ? <VolumeX className="w-4 h-4 shrink-0 text-rose-400" /> : <Volume2 className="w-4 h-4 shrink-0 text-emerald-400" />}
            {isMuted ? 'Unmute Sound' : 'Mute Sound'}
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); setIsAdminView(!isAdminView); }}
            className="min-h-12 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 text-left text-xs font-semibold text-amber-300"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" /> {isAdminView ? 'Exit Admin' : 'Admin'}
          </button>
          {user ? (
            <button
              onClick={() => { setMobileMenuOpen(false); logout(); }}
              className="col-span-2 min-h-12 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 text-left text-xs font-semibold text-rose-300"
            >
              <LogOut className="w-4 h-4 shrink-0" /> Log out ({user.username})
            </button>
          ) : (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                className="min-h-12 flex items-center gap-2 rounded-xl border border-[#262b3a] bg-[#1b1f2b] px-3 text-left text-xs font-semibold text-slate-200"
              >
                <User className="w-4 h-4 shrink-0 text-blue-400" /> Login / Register
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); demoLogin(); }}
                className="min-h-12 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 text-left text-xs font-semibold text-emerald-300"
              >
                <Sparkles className="w-4 h-4 shrink-0" /> Demo Account
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); adminLogin(); }}
                className="col-span-2 min-h-12 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 text-left text-xs font-semibold text-amber-300"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" /> 1-Click Admin Access
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
