import React, { createContext, useContext, useCallback } from 'react';

interface ParticleTrigger {
  spawn: (x: number, y: number) => void;
}

const ParticleContext = createContext<ParticleTrigger | undefined>(undefined);

export const useParticles = () => {
  const context = useContext(ParticleContext);
  if (!context) {
    throw new Error('useParticles must be used within a ParticleProvider');
  }
  return context;
};

export const ParticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const spawn = useCallback((x: number, y: number) => {
    // No-op
  }, []);

  return (
    <ParticleContext.Provider value={{ spawn }}>
      {children}
    </ParticleContext.Provider>
  );
};
