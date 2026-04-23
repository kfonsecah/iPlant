import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getQueue, getIsSyncing, subscribeToQueueChanges } from '../services/syncService';
import { useAuth } from './AuthContext';

interface SyncContextData {
  hasPending: boolean;
  isSyncing: boolean;
  queueLength: number;
}

const SyncContext = createContext<SyncContextData>({
  hasPending: false,
  isSyncing: false,
  queueLength: 0,
});

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [queueLength, setQueueLength] = useState(0);
  const [isSyncingState, setIsSyncingState] = useState(false);

  useEffect(() => {
    if (!user) {
      setQueueLength(0);
      setIsSyncingState(false);
      return;
    }

    const updateState = async () => {
      const queue = await getQueue(user.uid);
      setQueueLength(queue.length);
      setIsSyncingState(getIsSyncing());
    };

    updateState();

    // Subscribe to changes in the sync service
    const unsubscribe = subscribeToQueueChanges(updateState);
    return unsubscribe;
  }, [user]);

  return (
    <SyncContext.Provider 
      value={{ 
        hasPending: queueLength > 0, 
        isSyncing: isSyncingState,
        queueLength 
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
