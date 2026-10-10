import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '../utils/sound';

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('aviator_sound_muted') === 'true';
  });

  useEffect(() => {
    sound.setMuted(isMuted);
    localStorage.setItem('aviator_sound_muted', isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <SoundContext.Provider value={{
      sound,
      isMuted,
      toggleMute
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
