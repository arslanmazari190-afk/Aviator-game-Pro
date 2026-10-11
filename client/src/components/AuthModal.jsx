import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, demoLogin, adminLogin } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(identifier, password);
        if (res.success) {
          setSuccessMsg('Logged in successfully!');
          setTimeout(() => onClose(), 800);
        } else {
          setErrorMsg(res.message || 'Login failed.');
        }
      } else {
        const res = await register(username, email, password);
        if (res.success) {
          setSuccessMsg('Account created! Welcome bonus credited.');
          setTimeout(() => onClose(), 800);
        } else {
          setErrorMsg(res.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    await demoLogin();
    onClose();
  };

  const handleAdmin = async () => {
    await adminLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#14171f] border border-[#262b3a] rounded-3xl w-full max-w-md max-h-[90vh] max-h-[90dvh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#262b3a] flex items-center justify-between bg-[#0c0e14]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aviator-red to-[#ff4760] flex items-center justify-center text-white shadow-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-lg text-white">
                {tab === 'login' ? 'Player Login' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-400">Join the real-time crash arena</p>
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
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto">
          {/* Quick 1-Click Access Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemo}
              className="p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>1-Click Demo</span>
            </button>

            <button
              type="button"
              onClick={handleAdmin}
              className="p-2.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-300 hover:bg-amber-900/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Admin</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#090b0e] rounded-2xl border border-[#262b3a]">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${tab === 'login' ? 'bg-[#1b1f2b] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${tab === 'register' ? 'bg-[#1b1f2b] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          {/* Feedback Messages */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'login' ? (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Username or Email
                </label>
                <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2">
                  <User className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter username or email"
                    required
                    className="w-full bg-transparent text-white text-xs outline-none"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Choose Username
                  </label>
                  <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2">
                    <User className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. AviatorPro"
                      required
                      className="w-full bg-transparent text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2">
                    <Mail className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="player@example.com"
                      required
                      className="w-full bg-transparent text-white text-xs outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="flex items-center bg-[#090b0e] border border-[#262b3a] rounded-2xl px-3 py-2">
                <Lock className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent text-white text-xs outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-aviator-red to-[#ff3b56] hover:from-[#c9142c] hover:to-aviator-red text-white font-['Outfit'] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-950/40 transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>{tab === 'login' ? 'Log In to Play' : 'Register & Claim Bonus'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
