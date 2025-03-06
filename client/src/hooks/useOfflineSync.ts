import { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let syncInterval: NodeJS.Timeout;

    if (isOnline) {
      // Sync every 5 minutes when online
      syncInterval = setInterval(async () => {
        if (!isSyncing) {
          setIsSyncing(true);
          try {
            await dbService.syncWithServer();
          } catch (error) {
            console.error('Sync failed:', error);
          } finally {
            setIsSyncing(false);
          }
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [isOnline, isSyncing]);

  const syncNow = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await dbService.syncWithServer();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    syncNow,
  };
}; 