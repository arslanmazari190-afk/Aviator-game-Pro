import React, { useState } from 'react';
import Header from './components/Header';
import MultiplierRibbon from './components/MultiplierRibbon';
import GameCanvas from './components/GameCanvas';
import BettingPanel from './components/BettingPanel';
import LiveBetsSidebar from './components/LiveBetsSidebar';
import LiveChat from './components/LiveChat';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import ProvablyFairModal from './components/ProvablyFairModal';
import HowToPlayModal from './components/HowToPlayModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [provablyFairOpen, setProvablyFairOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedAuditRound, setSelectedAuditRound] = useState(null);

  const handleSelectRoundForAudit = (round) => {
    setSelectedAuditRound(round);
    setProvablyFairOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col font-sans">
      {/* Top Main Navigation Header */}
      <Header
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
        onOpenProvablyFair={() => { setSelectedAuditRound(null); setProvablyFairOpen(true); }}
        onOpenHowToPlay={() => setHowToPlayOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
      />

      {/* Main View Router */}
      {isAdminView ? (
        <main className="flex-1">
          <AdminDashboard onClose={() => setIsAdminView(false)} />
        </main>
      ) : (
        <main className="flex-1 flex flex-col max-w-[1600px] w-full mx-auto px-2 md:px-4 py-2 md:py-3 space-y-2.5">
          {/* Multipliers Ribbon */}
          <MultiplierRibbon onSelectRoundForAudit={handleSelectRoundForAudit} />

          {/* Main Layout Arena: Canvas & Bets + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
            {/* Left/Main Column: Flight Canvas & Dual Betting Controls */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <GameCanvas />
              <BettingPanel />
            </div>

            {/* Right Column: Live Multiplayer Bets & Community Chat */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <LiveBetsSidebar />
              <LiveChat />
            </div>
          </div>
        </main>
      )}

      {/* Interactive Modals */}
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
      <ProvablyFairModal 
        isOpen={provablyFairOpen} 
        onClose={() => setProvablyFairOpen(false)} 
        selectedRound={selectedAuditRound} 
      />
      <HowToPlayModal isOpen={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default App;
