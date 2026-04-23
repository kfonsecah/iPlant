import React, { createContext, useContext, ReactNode } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

interface ConnectivityContextData {
  isConnected: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextData>({ isConnected: true });

export const ConnectivityProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useNetInfo();
  
  // Handle initial null state from NetInfo by defaulting to true
  // (assume connected until proven otherwise)
  const connectionStatus = isConnected ?? true;

  return (
    <ConnectivityContext.Provider value={{ isConnected: connectionStatus }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
