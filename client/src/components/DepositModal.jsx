import React, { useState } from 'react';
import { 
  X, CheckCircle2, ArrowDownLeft, Copy, Upload, 
  Smartphone, Building2, Coins, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../api';

const DepositModal = ({ isOpen, onClose }) => {
  const { user, token, currency, updateBalanceLocally } = useAuth();
  const [gateway, setGateway] = useState('EASYPAISA'); // 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER' | 'CRYPTO_USDT'
  const [amount, setAmount] = useState('1000');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [txHash, setTxHash] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const presetsPKR = [500, 1000, 2500, 5000, 10000, 25000];
  const presetsUSDT = [10, 25, 50, 100, 250, 500];
  const activePresets = gateway === 'CRYPTO_USDT' ? presetsUSDT : presetsPKR;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('gateway', gateway);
      formData.append('amount', amount);
      formData.append('currency', gateway === 'CRYPTO_USDT' ? 'USDT' : 'PKR');
      formData.append('accountNumber', accountNumber);
      formData.append('accountTitle', accountTitle || (user ? user.username : ''));
      formData.append('txHash', txHash);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const res = await fetch(apiUrl('/api/wallet/deposit'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        if (data.autoApproved && data.newBalance !== undefined) {
          updateBalanceLocally(data.newBalance, gateway === 'CRYPTO_USDT' ? 'USDT' : 'PKR');
        }
      } else {
        setErrorMsg(data.message || 'Deposit submission failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to server.');
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-lg text-white">Deposit Funds</h3>
              <p className="text-xs text-slate-400">Instant Pakistani Gateways & Crypto</p>
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

          {/* Gateway Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setGateway('EASYPAISA'); setAmount('1000'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'EASYPAISA' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold font-['Outfit']">EasyPaisa</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Instant</span>
              </button>

              <button
                type="button"
                onClick={() => { setGateway('JAZZCASH'); setAmount('1000'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'JAZZCASH' ? 'bg-orange-950/30 border-orange-500 text-orange-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Smartphone className="w-5 h-5 text-orange-400" />
                <span className="text-xs font-bold font-['Outfit']">JazzCash</span>
                <span className="text-[10px] text-orange-400 font-semibold">Instant</span>
              </button>

              <button
                type="button"
                onClick={() => { setGateway('BANK_TRANSFER'); setAmount('5000'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'BANK_TRANSFER' ? 'bg-blue-950/30 border-blue-500 text-blue-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold font-['Outfit']">IBFT Bank</span>
                <span className="text-[10px] text-blue-400 font-semibold">Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => { setGateway('CRYPTO_USDT'); setAmount('50'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${gateway === 'CRYPTO_USDT' ? 'bg-emerald-950/30 border-emerald-400 text-emerald-400 shadow-lg' : 'bg-[#1b1f2b] border-[#262b3a] text-slate-300 hover:bg-[#262b3a]'}`}
              >
                <Coins className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold font-['Outfit']">USDT TRC20</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Crypto</span>
              </button>
            </div>
          </div>

          {/* Gateway Instructions & Details */}
          {gateway === 'EASYPAISA' && (
            <div className="bg-[#0c0e14] p-3.5 rounded-2xl border border-[#262b3a] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Merchant EasyPaisa Account:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                  <span>0300-8889977</span>
                  <button onClick={() => handleCopy('03008889977')} className="text-slate-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Title:</span>
                <span className="font-bold text-emerald-400">AVIATOR GLOBAL ENTERPRISES</span>
              </div>
            </div>
          )}

          {gateway === 'JAZZCASH' && (
            <div className="bg-[#0c0e14] p-3.5 rounded-2xl border border-[#262b3a] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Merchant JazzCash Account:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                  <span>0300-1122334</span>
                  <button onClick={() => handleCopy('03001122334')} className="text-slate-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Title:</span>
                <span className="font-bold text-orange-400">AVIATOR JC PAY</span>
              </div>
            </div>
          )}

          {gateway === 'BANK_TRANSFER' && (
            <div className="bg-[#0c0e14] p-3.5 rounded-2xl border border-[#262b3a] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bank Name:</span>
                <span className="font-bold text-white">Meezan Bank Ltd (Islamic Banking)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">IBAN:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                  <span>PK36MEZN00998877665544</span>
                  <button onClick={() => handleCopy('PK36MEZN00998877665544')} className="text-slate-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Title:</span>
                <span className="font-bold text-blue-400">AVIATOR ONLINE (PVT) LTD</span>
              </div>
            </div>
          )}

          {gateway === 'CRYPTO_USDT' && (
            <div className="bg-[#0c0e14] p-3.5 rounded-2xl border border-[#262b3a] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="font-bold text-emerald-400">Tron (TRC-20)</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400">Deposit Address:</span>
                <div className="flex items-center justify-between bg-[#14171f] p-2 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200">
                  <span className="truncate">TX9r8w98asdf8723klnasdf098TRONUSDT</span>
                  <button onClick={() => handleCopy('TX9r8w98asdf8723klnasdf098TRONUSDT')} className="text-emerald-400 ml-2">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input & Preset Chips */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Deposit Amount ({gateway === 'CRYPTO_USDT' ? 'USDT' : 'PKR'})
            </label>
            <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2">
              <span className="text-slate-400 font-bold font-mono text-sm mr-2">
                {gateway === 'CRYPTO_USDT' ? '$' : '₨'}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 bg-transparent text-white font-mono font-bold text-base outline-none"
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
              {activePresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${amount === String(val) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-[#1b1f2b] text-slate-300 border-[#262b3a] hover:bg-[#262b3a]'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Account Number / Phone / Sender Info */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              {gateway === 'CRYPTO_USDT' ? 'Your Sending Wallet / TXID' : 'Your Sender Mobile / Account #'}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={gateway === 'CRYPTO_USDT' ? 'Enter TX Hash' : 'e.g. 03001234567'}
              className="w-full bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
            />
          </div>

          {/* Bank Receipt Upload (For IBFT) */}
          {gateway === 'BANK_TRANSFER' && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Upload IBFT Transfer Receipt (Screenshot)
              </label>
              <div className="border-2 border-dashed border-[#262b3a] hover:border-blue-500/50 rounded-2xl p-4 text-center cursor-pointer relative bg-[#090b0e]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {receiptPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={receiptPreview} alt="Receipt preview" className="max-h-28 rounded-xl border border-slate-700" />
                    <span className="text-[11px] text-emerald-400 font-semibold mt-1">Receipt selected. Click to replace</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                    <Upload className="w-6 h-6 text-blue-400 mb-1" />
                    <span className="font-semibold text-slate-300">Click or drag screenshot here</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmitDeposit}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-['Outfit'] font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <ArrowDownLeft className="w-5 h-5" />
                <span>Deposit {amount} {gateway === 'CRYPTO_USDT' ? 'USDT' : 'PKR'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
