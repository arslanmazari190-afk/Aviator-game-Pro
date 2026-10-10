import React, { useState } from 'react';
import { 
  X, CheckCircle2, ArrowUpRight, Smartphone, 
  Building2, Coins, AlertCircle, Wallet 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WithdrawModal = ({ isOpen, onClose }) => {
  const { user, token, currency, updateBalanceLocally } = useAuth();
  const [gateway, setGateway] = useState('EASYPAISA');
  const [amount, setAmount] = useState('1000');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const currentBalance = user ? (gateway === 'CRYPTO_USDT' ? user.balance_usdt : user.balance_pkr) : 0;
  const isPKR = gateway !== 'CRYPTO_USDT';

  const handlePercentage = (percent) => {
    const calculated = (currentBalance * percent).toFixed(isPKR ? 0 : 2);
    setAmount(String(calculated));
  };

  const handleSubmitWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        throw new Error('Please enter a valid amount.');
      }
      if (numAmount > currentBalance) {
        throw new Error('Withdrawal amount exceeds your available balance.');
      }
      if (!accountNumber) {
        throw new Error('Please provide your receiving account number / address.');
      }

      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gateway,
          amount: numAmount,
          currency: isPKR ? 'PKR' : 'USDT',
          accountNumber,
          accountTitle: accountTitle || user?.username
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        if (data.newBalance !== undefined) {
          updateBalanceLocally(data.newBalance, isPKR ? 'PKR' : 'USDT');
        }
      } else {
        setErrorMsg(data.message || 'Withdrawal request failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#14171f] border border-[#262b3a] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-[#262b3a] flex items-center justify-between bg-[#0c0e14]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-lg text-white">Withdraw Funds</h3>
              <p className="text-xs text-slate-400">Fast local payouts to Pakistani accounts & Crypto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1b1f2b] text-slate-400 hover:text-white border border-[#262b3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          {/* Success / Error Banners */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Available Balance Bar */}
          <div className="bg-[#0c0e14] p-3.5 rounded-2xl border border-[#262b3a] flex items-center justify-between">
            <span className="text-xs text-slate-400">Available Balance:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {isPKR ? `₨ ${currentBalance.toLocaleString()}` : `$ ${currentBalance.toLocaleString()} USDT`}
            </span>
          </div>

          {/* Gateway Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setGateway('EASYPAISA'); setAmount('1000'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'EASYPAISA' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold font-['Outfit']">EasyPaisa</span>
              </button>

              <button
                type="button"
                onClick={() => { setGateway('JAZZCASH'); setAmount('1000'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'JAZZCASH' ? 'bg-orange-950/30 border-orange-500 text-orange-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Smartphone className="w-5 h-5 text-orange-400" />
                <span className="text-xs font-bold font-['Outfit']">JazzCash</span>
              </button>

              <button
                type="button"
                onClick={() => { setGateway('BANK_TRANSFER'); setAmount('2000'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'BANK_TRANSFER' ? 'bg-blue-950/30 border-blue-500 text-blue-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold font-['Outfit']">Bank IBFT</span>
              </button>

              <button
                type="button"
                onClick={() => { setGateway('CRYPTO_USDT'); setAmount('50'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'CRYPTO_USDT' ? 'bg-emerald-950/30 border-emerald-400 text-emerald-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Coins className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold font-['Outfit']">USDT TRC20</span>
              </button>
            </div>
          </div>

          {/* Amount Input & Percentage buttons */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Withdrawal Amount ({isPKR ? 'PKR' : 'USDT'})
            </label>
            <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2">
              <span className="text-slate-400 font-bold font-mono text-sm mr-2">{isPKR ? '₨' : '$'}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 bg-transparent text-white font-mono font-bold text-base outline-none"
              />
            </div>

            {/* Percentage Chips */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handlePercentage(0.25)}
                className="py-1.5 rounded-xl bg-[#1b1f2b] border border-[#262b3a] text-slate-300 text-xs font-mono font-bold hover:bg-[#262b3a]"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handlePercentage(0.50)}
                className="py-1.5 rounded-xl bg-[#1b1f2b] border border-[#262b3a] text-slate-300 text-xs font-mono font-bold hover:bg-[#262b3a]"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handlePercentage(0.75)}
                className="py-1.5 rounded-xl bg-[#1b1f2b] border border-[#262b3a] text-slate-300 text-xs font-mono font-bold hover:bg-[#262b3a]"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handlePercentage(1.0)}
                className="py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30"
              >
                100% MAX
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              {gateway === 'CRYPTO_USDT' ? 'Receiving TRC20 Wallet Address' : 'Receiving Mobile / IBAN Account Number'}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={gateway === 'CRYPTO_USDT' ? 'e.g. TX...' : 'e.g. 03001234567 or PK36MEZN...'}
              className="w-full bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Account Title / Full Name
            </label>
            <input
              type="text"
              value={accountTitle}
              onChange={(e) => setAccountTitle(e.target.value)}
              placeholder="e.g. Muhammad Ali"
              className="w-full bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2 text-white text-xs outline-none focus:border-amber-500"
            />
          </div>

          {/* Fee & Arrival Notice */}
          <div className="text-[11px] text-slate-400 bg-[#0c0e14] p-3 rounded-2xl border border-[#262b3a] flex items-center justify-between">
            <span>Processing Fee: <strong className="text-emerald-400">0% FREE</strong></span>
            <span>Est. Arrival: <strong className="text-white">5 - 15 Minutes</strong></span>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmitWithdraw}
            disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > currentBalance}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-['Outfit'] font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5" />
                <span>Withdraw {amount} {isPKR ? 'PKR' : 'USDT'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
