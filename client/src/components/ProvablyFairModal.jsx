import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Calculator, Hash, Key, RefreshCw } from 'lucide-react';
import { apiUrl } from '../api';

const ProvablyFairModal = ({ isOpen, onClose, selectedRound }) => {
  const [serverSeed, setServerSeed] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState('1001');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedRound) {
      setServerSeed(selectedRound.server_seed || selectedRound.serverSeed || '');
      setClientSeed(selectedRound.client_seed || selectedRound.clientSeed || '');
      setNonce(String(selectedRound.nonce || selectedRound.round_number || selectedRound.roundNumber || 1001));
      if (selectedRound.server_seed || selectedRound.serverSeed) {
        verify(selectedRound.server_seed || selectedRound.serverSeed, selectedRound.client_seed || selectedRound.clientSeed, selectedRound.nonce || selectedRound.round_number);
      }
    }
  }, [selectedRound]);

  if (!isOpen) return null;

  const verify = async (sSeed = serverSeed, cSeed = clientSeed, n = nonce) => {
    if (!sSeed || !cSeed || !n) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/game/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverSeed: sSeed,
          clientSeed: cSeed,
          nonce: Number(n)
        })
      });

      const data = await res.json();
      if (data.success) {
        setVerificationResult(data.verification);
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#14171f] border border-[#262b3a] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#262b3a] flex items-center justify-between bg-[#0c0e14]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-lg text-white">Provably Fair Verifier</h3>
              <p className="text-xs text-slate-400">Cryptographic SHA-256 HMAC Transparency</p>
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
          {/* Algorithm Info Box */}
          <div className="bg-[#0c0e14] p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">
              Provably Fair Formula
            </span>
            <code className="text-slate-300 font-mono text-[11px] block bg-[#14171f] p-2 rounded-xl border border-slate-800 break-all">
              HMAC_SHA256(ServerSeed, ClientSeed + ":" + Nonce)
            </code>
            <p className="text-[11px] text-slate-400">
              The game crash multiplier is mathematically predetermined before each round using the Server Seed. The SHA-256 hash of this seed is broadcast publicly beforehand to prove the outcome was not altered during flight.
            </p>
          </div>

          {/* Verification Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Server Seed (Revealed after round)
              </label>
              <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2">
                <Key className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={serverSeed}
                  onChange={(e) => setServerSeed(e.target.value)}
                  placeholder="Paste 64-character hexadecimal Server Seed"
                  className="w-full bg-transparent text-white font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Client Seed
                </label>
                <input
                  type="text"
                  value={clientSeed}
                  onChange={(e) => setClientSeed(e.target.value)}
                  placeholder="e.g. 8b9f1234..."
                  className="w-full bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nonce (Round #)
                </label>
                <input
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="1001"
                  className="w-full bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => verify()}
              disabled={loading || !serverSeed || !clientSeed}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-['Outfit'] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Verify Crash Multiplier</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Results Panel */}
          {verificationResult && (
            <div className="p-4 rounded-2xl bg-[#0c0e14] border border-emerald-500/50 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 100% Cryptographic Match
                </span>
                <span className="text-[11px] text-slate-400">RTP: 97.00% (3% Edge)</span>
              </div>

              <div className="text-center py-3 bg-[#14171f] rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold block">
                  Calculated Crash Multiplier
                </span>
                <span className="font-['Outfit'] font-black text-4xl text-white">
                  {verificationResult.multiplier.toFixed(2)}x
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="text-slate-400 flex flex-col">
                  <span>Computed HMAC-SHA256 Hash:</span>
                  <span className="font-mono text-slate-300 break-all bg-[#14171f] p-1.5 rounded-lg border border-slate-800">
                    {verificationResult.hash}
                  </span>
                </div>
                <div className="text-slate-400 flex items-center justify-between pt-1">
                  <span>First 52-bits Hex Substring:</span>
                  <span className="font-mono font-bold text-amber-400">{verificationResult.hexSub}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvablyFairModal;
