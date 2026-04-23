import { getItem, saveItem } from './storageService';

export interface SyncAction {
  id: string;
  type: 'CREATE';
  data: any;
  userId: string;
  timestamp: number;
}

const getQueueKey = (userId: string) => `SYNC_QUEUE_${userId}`;

let isSyncing = false;

/**
 * Adds an action to the persistent sync queue.
 */
export async function addToQueue(action: SyncAction): Promise<void> {
  const queue = await getQueue(action.userId);
  queue.push(action);
  await saveItem(getQueueKey(action.userId), queue);
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
    const queue = await getQueue(userId);
    for (const action of queue) {
      try {
        await onProcess(action);
        await removeFromQueue(userId, action.id);
      } catch (error) {
        console.error(`Sync failed for action ${action.id}:`, error);
        // Sequential sync logic from RESEARCH.md: Stop on first failure or mark item?
        // Research says: "Stop sync or mark item as failed to retry later"
        // I'll stop for now to maintain order and avoid out-of-order execution if dependencies exist.
        break;
      }
    }
  } finally {
    isSyncing = false;
  }
}

/**
 * Checks if a sync process is currently running.
 */
export function getIsSyncing(): boolean {
  return isSyncing;
}
