import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aviator_token') || null);
  const [currency, setCurrency] = useState(localStorage.getItem('aviator_currency') || 'PKR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      // Auto login as demo user for instant interactive play
      demoLogin();
    }
  }, [token]);

  const saveAuth = (token, user) => {
    localStorage.setItem('aviator_token', token);
    setToken(token);
    setUser(user);
  };

  const login = async (identifier, password) => {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (data.success) {
      saveAuth(data.token, data.user);
    }
    return data;
  };

  const register = async (username, email, password) => {
    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (data.success) {
      saveAuth(data.token, data.user);
    }
    return data;
  };

  const demoLogin = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/demo-login'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        saveAuth(data.token, data.user);
      }
    } catch (e) {
      console.error('Demo login failed', e);
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async () => {
    const res = await fetch(apiUrl('/api/auth/admin-login'), { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      saveAuth(data.token, data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('aviator_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const updateBalanceLocally = (newBalance, curr) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      if (curr === 'PKR') {
        return { ...prev, balance_pkr: Number(Number(newBalance).toFixed(2)) };
      } else {
        return { ...prev, balance_usdt: Number(Number(newBalance).toFixed(4)) };
      }
    });
  };

  const switchCurrency = (newCurr) => {
    setCurrency(newCurr);
    localStorage.setItem('aviator_currency', newCurr);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      currency,
      loading,
      login,
      register,
      demoLogin,
      adminLogin,
      logout,
      updateBalanceLocally,
      setCurrency: switchCurrency
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
