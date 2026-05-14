import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGameStore } from '../store/useGameStore';

export const useGameLoop = () => {
  const updateGameLoop = useGameStore((state) => state.updateGameLoop);
  const processOfflineTime = useGameStore((state) => state.processOfflineTime);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Handle App State changes (Background <-> Foreground)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, process offline time immediately
        processOfflineTime();
      }
      appState.current = nextAppState;
    });

    // Real-time game loop (ticks every 1 second)
    const TICK_RATE_MS = 1000;
    let lastTick = Date.now();

    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTick;
      
      // Only update if delta is reasonable (prevents huge jumps if interval throttles)
      if (deltaMs > 0 && deltaMs < 5000) {
        updateGameLoop(deltaMs);
      }
      
      lastTick = now;
    }, TICK_RATE_MS);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [updateGameLoop, processOfflineTime]);
};
