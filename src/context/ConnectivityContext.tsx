import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface ConnectivityContextData {
  isConnected: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextData>({ isConnected: true });

export const ConnectivityProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Escuchar cambios de forma activa
    const unsubscribe = NetInfo.addEventListener(state => {
      // Solo actualizamos si el estado es definitivamente falso o verdadero
      if (state.isConnected !== null) {
        setIsConnected(state.isConnected);
      }
    });

    // Carga inicial
    NetInfo.fetch().then(state => {
      if (state.isConnected !== null) {
        setIsConnected(state.isConnected);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isConnected }}>
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
