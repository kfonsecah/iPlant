import { addToQueue, getQueue, removeFromQueue, processQueue } from '../syncService';
import { getItem, saveItem } from '../storageService';

jest.mock('../storageService', () => ({
  getItem: jest.fn(),
  saveItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('syncService', () => {
  const userId = 'user-123';
  const queueKey = `SYNC_QUEUE_${userId}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToQueue', () => {
    it('should add an action to the queue', async () => {
      (getItem as jest.Mock).mockResolvedValueOnce([]);
      
      const action: any = { id: '1', type: 'CREATE', data: { name: 'Plant' }, userId, timestamp: Date.now() };
      await addToQueue(action);

      expect(getItem).toHaveBeenCalledWith(queueKey);
      expect(saveItem).toHaveBeenCalledWith(queueKey, [action]);
    });

    it('should append an action to an existing queue', async () => {
      const existingAction: any = { id: '0', type: 'CREATE', data: {}, userId, timestamp: 0 };
      (getItem as jest.Mock).mockResolvedValueOnce([existingAction]);
      
      const newAction: any = { id: '1', type: 'CREATE', data: {}, userId, timestamp: 1 };
      await addToQueue(newAction);

      expect(saveItem).toHaveBeenCalledWith(queueKey, [existingAction, newAction]);
    });
  });

  describe('getQueue', () => {
    it('should return the current queue', async () => {
      const mockQueue = [{ id: '1' }];
      (getItem as jest.Mock).mockResolvedValueOnce(mockQueue);
      
      const queue = await getQueue(userId);
      expect(queue).toEqual(mockQueue);
    });

    it('should return an empty array if no queue exists', async () => {
      (getItem as jest.Mock).mockResolvedValueOnce(null);
      
      const queue = await getQueue(userId);
      expect(queue).toEqual([]);
    });
  });

  describe('removeFromQueue', () => {
    it('should remove an action from the queue', async () => {
      const action1 = { id: '1' };
      const action2 = { id: '2' };
      (getItem as jest.Mock).mockResolvedValueOnce([action1, action2]);
      
      await removeFromQueue(userId, '1');

      expect(saveItem).toHaveBeenCalledWith(queueKey, [action2]);
    });
  });

  describe('processQueue', () => {
    it('should process all items in the queue sequentially', async () => {
      const action1 = { id: '1', userId };
      const action2 = { id: '2', userId };
      (getItem as jest.Mock).mockResolvedValueOnce([action1, action2]);
      
      const processor = jest.fn().mockResolvedValue(undefined);
      
      await processQueue(userId, processor);

      expect(processor).toHaveBeenCalledTimes(2);
      expect(processor).toHaveBeenNthCalledWith(1, action1);
      expect(processor).toHaveBeenNthCalledWith(2, action2);
      
      // Verify removeFromQueue was called (via saveItem)
      expect(saveItem).toHaveBeenCalledTimes(2);
    });

    it('should stop processing if an item fails', async () => {
      const action1 = { id: '1', userId };
      const action2 = { id: '2', userId };
      (getItem as jest.Mock).mockResolvedValueOnce([action1, action2]);
      
      const processor = jest.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined);
      
      await processQueue(userId, processor);

      expect(processor).toHaveBeenCalledTimes(1);
      expect(processor).toHaveBeenCalledWith(action1);
      
      // Should NOT have removed action1 since it failed
      expect(saveItem).not.toHaveBeenCalled();
    });

    it('should prevent concurrent sync processes', async () => {
      const action1 = { id: '1', userId };
      (getItem as jest.Mock).mockResolvedValueOnce([action1]);
      
      let resolveFirst: (value: unknown) => void = () => {};
      const firstProcessor = jest.fn().mockImplementation(() => new Promise((resolve) => {
        resolveFirst = resolve;
      }));
      
      const secondProcessor = jest.fn();

      const firstProcess = processQueue(userId, firstProcessor);
      
      // Wait a bit to ensure firstProcess has started and set isSyncing to true
      await new Promise(r => setTimeout(r, 10));

      const secondProcess = processQueue(userId, secondProcessor);

      await secondProcess; // Should return immediately because first is still running
      expect(secondProcessor).not.toHaveBeenCalled();

      resolveFirst(undefined);
      await firstProcess;
      expect(firstProcessor).toHaveBeenCalled();
    });
  });
});
