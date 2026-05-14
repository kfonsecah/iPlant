import { getItem, saveItem } from './storageService';

export interface SyncAction {
  id: string;
  type: 'CREATE' | 'DELETE' | 'UPDATE';
  data: any;
  userId: string;
  timestamp: number;
}

const getQueueKey = (userId: string) => `SYNC_QUEUE_${userId}`;

let isSyncing = false;
const listeners: (() => void)[] = [];

/**
 * Notifies all listeners that the queue has changed.
 */
function notifyListeners() {
  listeners.forEach((l) => l());
}

/**
 * Subscribes to queue changes.
 */
export function subscribeToQueueChanges(listener: () => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

/**
 * Adds an action to the persistent sync queue.
 */
export async function addToQueue(action: SyncAction): Promise<void> {
  const queue = await getQueue(action.userId);
  queue.push(action);
  await saveItem(getQueueKey(action.userId), queue);
  notifyListeners();
}

/**
 * Retrieves the current sync queue for a user.
 */
export async function getQueue(userId: string): Promise<SyncAction[]> {
  return (await getItem<SyncAction[]>(getQueueKey(userId))) || [];
}

/**
 * Removes an action from the queue by ID.
 */
export async function removeFromQueue(userId: string, actionId: string): Promise<void> {
  const queue = await getQueue(userId);
  const updatedQueue = queue.filter((a) => a.id !== actionId);
  await saveItem(getQueueKey(userId), updatedQueue);
  notifyListeners();
}

/**
 * Processes the sync queue sequentially.
 * @param userId The user ID to sync.
 * @param onProcess Callback to handle the actual API call for each action.
 */
export async function processQueue(
  userId: string,
  onProcess: (action: SyncAction) => Promise<void>
): Promise<void> {
  if (isSyncing) return;
  isSyncing = true;

  try {
    let queue = await getQueue(userId);
    
    // Process actions one by one
    while (queue.length > 0) {
      const action = queue[0];
      try {
        await onProcess(action);
        // Remove from persistent storage after success
        queue.shift();
        await saveItem(getQueueKey(userId), queue);
        notifyListeners();
      } catch (error) {
        console.error(`Sync failed for action ${action.id}:`, error);
        break; // Stop on first failure
      }
    }
  } finally {
    isSyncing = false;
    notifyListeners();
  }
}

/**
 * Checks if a sync process is currently running.
 */
export function getIsSyncing(): boolean {
  return isSyncing;
}
