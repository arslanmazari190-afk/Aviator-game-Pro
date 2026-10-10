import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, TrendingUp, DollarSign, Users, ArrowDownLeft, 
  ArrowUpRight, Sliders, AlertOctagon, CheckCircle, XCircle, 
  Search, RefreshCw, Eye, Sparkles, Check, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameSocketContext';
import { apiUrl } from '../api';

const AdminDashboard = ({ onClose }) => {
  const { token, user } = useAuth();
  const { gameState, multiplier } = useGame();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'game' | 'deposits' | 'withdrawals' | 'users'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState({
    rtp: 97.0,
    houseEdge: 3.0,
    minBetPKR: 50,
    maxBetPKR: 100000,
    minBetUSDT: 1.0,
    maxBetUSDT: 1000.0,
    maxProfitPKR: 1000000
  });
  
  const [nextMultiplierInput, setNextMultiplierInput] = useState('5.00');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [balanceAdjustModal, setBalanceAdjustModal] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('10000');
  const [adjustCurrency, setAdjustCurrency] = useState('PKR');
  const [adjustReason, setAdjustReason] = useState('VIP Promotion Credit');
  const [actionMsg, setActionMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [resStats, resUsers, resTxs, resSettings] = await Promise.all([
        fetch(apiUrl('/api/admin/dashboard'), { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(apiUrl('/api/admin/users'), { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(apiUrl('/api/admin/transactions'), { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(apiUrl('/api/admin/settings'), { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resUsers.success) setUsersList(resUsers.users);
      if (resTxs.success) setTransactions(resTxs.transactions);
      if (resSettings.success) setSettings(resSettings.settings);
    } catch (e) {
      console.error('Admin data fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3500);
  };

  // 1. Approve Transaction
  const handleApproveTx = async (txId) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/transactions/${txId}/approve`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ admin_notes: 'Verified and approved by Admin' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchDashboardData();
      }
    } catch (e) {}
  };

  // 2. Reject Transaction
  const handleRejectTx = async (txId) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/transactions/${txId}/reject`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ admin_notes: 'Rejected by Admin' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchDashboardData();
      }
    } catch (e) {}
  };

  // 3. Adjust User Balance
  const handleAdjustBalance = async () => {
    if (!balanceAdjustModal) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${balanceAdjustModal.id}/adjust-balance`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(adjustAmount),
          currency: adjustCurrency,
          reason: adjustReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setBalanceAdjustModal(null);
        fetchDashboardData();
      }
    } catch (e) {}
  };

  // 4. Toggle User Frozen Status
  const handleToggleFreeze = async (userObj) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${userObj.id}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_frozen: !userObj.is_frozen })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchDashboardData();
      }
    } catch (e) {}
  };

  // 5. Emergency Crash Trigger
  const handleEmergencyCrash = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/emergency-crash'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      showNotification(data.message);
    } catch (e) {}
  };

  // 6. Set Next Round Multiplier
  const handleSetNextMultiplier = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/set-next-multiplier'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ multiplier: Number(nextMultiplierInput) })
      });
      const data = await res.json();
      showNotification(data.message);
    } catch (e) {}
  };

  // 7. Save Settings
  const handleSaveSettings = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      showNotification(data.message);
    } catch (e) {}
  };

  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDeposits = transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
  const pendingWithdrawals = transactions.filter(t => t.type === 'WITHDRAW' && t.status === 'PENDING');

  return (
    <div className="w-full bg-[#0c0e14] min-h-screen text-slate-100 p-4 md:p-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262b3a]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-white flex items-center gap-2">
              Aviator Admin Backoffice
              <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                SECURE
              </span>
            </h1>
            <p className="text-xs text-slate-400">Manage finances, game algorithms, payouts, and player accounts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-[#14171f] hover:bg-[#1b1f2b] border border-[#262b3a] text-slate-300 flex items-center gap-2 text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Outfit'] font-bold text-xs transition-colors shadow-lg"
          >
            Back to Game
          </button>
        </div>
      </div>

      {/* Global Toast Notification */}
      {actionMsg && (
        <div className="my-4 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-[#262b3a] no-scrollbar">
        {[
          { id: 'overview', label: 'Financial Overview & KPIs', icon: TrendingUp },
          { id: 'game', label: 'Game Control & RTP', icon: Sliders },
          { id: 'deposits', label: `Pending Deposits (${pendingDeposits.length})`, icon: ArrowDownLeft },
          { id: 'withdrawals', label: `Pending Withdrawals (${pendingWithdrawals.length})`, icon: ArrowUpRight },
          { id: 'users', label: `User Management (${usersList.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-['Outfit'] flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#262b3a]'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. OVERVIEW & FINANCIAL KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 pt-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#14171f] border border-[#262b3a] flex flex-col">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gross Gaming Revenue (GGR)</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-2">
                ₨ {(stats?.ggrPKR || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Total Wagered - Total Payouts</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#14171f] border border-[#262b3a] flex flex-col">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Net Gaming Revenue (NGR)</span>
              <span className="text-2xl font-black text-emerald-300 font-mono mt-2">
                ₨ {(stats?.ngrPKR || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Est. Net Profit Margin (85%)</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#14171f] border border-[#262b3a] flex flex-col">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Player Turnover</span>
              <span className="text-2xl font-black text-white font-mono mt-2">
                ₨ {(stats?.totalWageredPKR || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">From {stats?.completedRounds || 0} completed rounds</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#14171f] border border-[#262b3a] flex flex-col">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Player Accounts</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-2">
                {stats?.totalUsers || 0}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Registered multi-currency wallets</span>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#14171f] border border-[#262b3a]">
              <span className="text-xs text-slate-400">Approved Deposits:</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                ₨ {(stats?.approvedDepositsPKR || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#14171f] border border-[#262b3a]">
              <span className="text-xs text-slate-400">Approved Withdrawals:</span>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                ₨ {(stats?.approvedWithdrawalsPKR || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#14171f] border border-[#262b3a]">
              <span className="text-xs text-slate-400">Pending Deposit Queue:</span>
              <div className="text-lg font-bold font-mono text-blue-400 mt-1">
                {stats?.pendingDepositsCount || 0} Requests
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#14171f] border border-[#262b3a]">
              <span className="text-xs text-slate-400">Pending Withdrawal Queue:</span>
              <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                {stats?.pendingWithdrawalsCount || 0} Requests
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GAME CONTROL & RTP CONFIGURATION */}
      {activeTab === 'game' && (
        <div className="space-y-6 pt-6">
          {/* Live Flight Monitor & Emergency Controls */}
          <div className="p-6 rounded-3xl bg-[#14171f] border border-[#262b3a] grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col justify-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Live Game State</span>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-3 h-3 rounded-full ${gameState === 'FLYING' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span className="font-['Outfit'] font-black text-2xl text-white">{gameState}</span>
              </div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                Live Odds: {multiplier.toFixed(2)}x
              </div>
            </div>

            {/* Emergency Crash Trigger */}
            <div className="flex flex-col justify-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Emergency Manual Crash</span>
              <p className="text-[11px] text-slate-500 mt-1 mb-2">Instantly triggers flight termination</p>
              <button
                onClick={handleEmergencyCrash}
                disabled={gameState !== 'FLYING'}
                className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-['Outfit'] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Trigger Manual Crash</span>
              </button>
            </div>

            {/* Next Round Target Override */}
            <div className="flex flex-col justify-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Next Round Crash Override</span>
              <p className="text-[11px] text-slate-500 mt-1 mb-2">Preset crash multiplier for next game</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="1.00"
                  value={nextMultiplierInput}
                  onChange={(e) => setNextMultiplierInput(e.target.value)}
                  className="w-28 bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
                />
                <button
                  onClick={handleSetNextMultiplier}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Outfit'] font-bold text-xs transition-colors"
                >
                  Set Next (x)
                </button>
              </div>
            </div>
          </div>

          {/* Mathematical House Edge & Limits Configuration */}
          <div className="p-6 rounded-3xl bg-[#14171f] border border-[#262b3a] space-y-4">
            <h3 className="font-['Outfit'] font-black text-lg text-white">
              Platform RTP & House Margin Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Return to Player (RTP %): {settings.rtp}%
                </label>
                <input
                  type="range"
                  min="90"
                  max="99"
                  step="0.5"
                  value={settings.rtp}
                  onChange={(e) => {
                    const rtp = Number(e.target.value);
                    setSettings(prev => ({ ...prev, rtp, houseEdge: Number((100 - rtp).toFixed(1)) }));
                  }}
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-500">House Edge: {settings.houseEdge}%</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Min Bet (PKR ₨)</label>
                <input
                  type="number"
                  value={settings.minBetPKR}
                  onChange={(e) => setSettings(prev => ({ ...prev, minBetPKR: Number(e.target.value) }))}
                  className="w-full bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Max Bet (PKR ₨)</label>
                <input
                  type="number"
                  value={settings.maxBetPKR}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxBetPKR: Number(e.target.value) }))}
                  className="w-full bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-['Outfit'] font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Game Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. PENDING DEPOSITS & BANK SLIP REVIEWS */}
      {activeTab === 'deposits' && (
        <div className="pt-6 space-y-4">
          <h3 className="font-['Outfit'] font-black text-lg text-white">Deposit Requests Queue</h3>
          {pendingDeposits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDeposits.map((tx) => (
                <div key={tx.id} className="p-5 rounded-2xl bg-[#14171f] border border-[#262b3a] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-lg">
                      {tx.gateway}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Deposit Amount</div>
                      <div className="text-xl font-mono font-bold text-emerald-400">
                        {tx.amount} {tx.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Account / TXID</div>
                      <div className="text-xs font-mono font-bold text-white truncate max-w-[140px]">
                        {tx.account_number || tx.tx_hash}
                      </div>
                    </div>
                  </div>

                  {/* Receipt Screenshot Preview button */}
                  {tx.proof_image_url && (
                    <button
                      onClick={() => setSelectedReceipt(tx.proof_image_url)}
                      className="w-full py-2 bg-[#1b1f2b] hover:bg-[#262b3a] border border-[#262b3a] rounded-xl text-xs text-blue-400 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View IBFT Transfer Slip Image</span>
                    </button>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262b3a]">
                    <button
                      onClick={() => handleRejectTx(tx.id)}
                      className="py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleApproveTx(tx.id)}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve & Credit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-[#14171f] rounded-2xl border border-[#262b3a]">
              <CheckCircle className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
              <span>No pending deposit requests in queue!</span>
            </div>
          )}
        </div>
      )}

      {/* 4. PENDING WITHDRAWALS */}
      {activeTab === 'withdrawals' && (
        <div className="pt-6 space-y-4">
          <h3 className="font-['Outfit'] font-black text-lg text-white">Withdrawal Requests Queue</h3>
          {pendingWithdrawals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingWithdrawals.map((tx) => (
                <div key={tx.id} className="p-5 rounded-2xl bg-[#14171f] border border-[#262b3a] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500/20 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-lg">
                      {tx.gateway}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Requested Payout</div>
                      <div className="text-xl font-mono font-bold text-amber-400">
                        {tx.amount} {tx.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Account Title</div>
                      <div className="text-xs font-bold text-white">
                        {tx.account_title || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#090b0e] border border-[#262b3a] text-xs">
                    <span className="text-slate-400">Destination Account / Wallet:</span>
                    <div className="font-mono font-bold text-emerald-400 truncate mt-0.5">
                      {tx.account_number}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262b3a]">
                    <button
                      onClick={() => handleRejectTx(tx.id)}
                      className="py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject & Refund
                    </button>
                    <button
                      onClick={() => handleApproveTx(tx.id)}
                      className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve & Payout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-[#14171f] rounded-2xl border border-[#262b3a]">
              <CheckCircle className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
              <span>No pending withdrawal requests in queue!</span>
            </div>
          )}
        </div>
      )}

      {/* 5. USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-['Outfit'] font-black text-lg text-white">Player Accounts</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username or email..."
                className="w-full bg-[#14171f] border border-[#262b3a] rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-[#14171f] border border-[#262b3a] rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090b0e] border-b border-[#262b3a] text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">PKR Balance</th>
                  <th className="p-3.5">USDT Balance</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262b3a]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1b1f2b]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{u.username}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      ₨ {(u.balance_pkr || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-300">
                      $ {(u.balance_usdt || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_frozen ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {u.is_frozen ? 'FROZEN' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setBalanceAdjustModal(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 font-bold text-[11px] transition-colors"
                      >
                        Adjust Balance
                      </button>
                      <button
                        onClick={() => handleToggleFreeze(u)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] border transition-colors ${u.is_frozen ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-rose-950/30 border-rose-500/30 text-rose-400'}`}
                      >
                        {u.is_frozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIPT IMAGE PREVIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#14171f] border border-[#262b3a] rounded-3xl p-4 max-w-lg w-full flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#262b3a] mb-3">
              <span className="font-bold text-white text-sm">IBFT Transfer Slip Preview</span>
              <button onClick={() => setSelectedReceipt(null)} className="p-1.5 rounded-xl bg-[#1b1f2b] text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={selectedReceipt} alt="Slip Preview" className="max-h-[70vh] rounded-xl object-contain border border-slate-700" />
          </div>
        </div>
      )}

      {/* BALANCE ADJUSTMENT MODAL */}
      {balanceAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#14171f] border border-[#262b3a] rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#262b3a] pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Adjust Player Balance</h4>
                <p className="text-xs text-slate-400">User: {balanceAdjustModal.username}</p>
              </div>
              <button onClick={() => setBalanceAdjustModal(null)} className="p-1.5 rounded-xl bg-[#1b1f2b] text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Adjustment Amount (+ to credit, - to debit)
              </label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Currency
              </label>
              <select
                value={adjustCurrency}
                onChange={(e) => setAdjustCurrency(e.target.value)}
                className="w-full bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white text-xs outline-none"
              >
                <option value="PKR">Pakistani Rupee (PKR ₨)</option>
                <option value="USDT">Tether USD (USDT $)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-[#090b0e] border border-[#262b3a] rounded-xl px-3 py-2 text-white text-xs outline-none"
              />
            </div>

            <button
              onClick={handleAdjustBalance}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-['Outfit'] font-bold text-xs transition-colors shadow-lg"
            >
              Submit Balance Adjustment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
