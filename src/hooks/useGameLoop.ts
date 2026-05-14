import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGameStore } from '../store/useGameStore';

export const useGameLoop = () => {
  const updateGameLoop = useGameStore((state) => state.updateGameLoop);
  const processOfflineTime = useGameStore((state) => state.processOfflineTime);
  const processWeather = useGameStore((state) => state.processWeather);
  const tryInfectPests = useGameStore((state) => state.tryInfectPests);
  const updateMissionProgress = useGameStore((state) => state.updateMissionProgress);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        processOfflineTime();
        processWeather();
        updateMissionProgress();
      }
      appState.current = nextAppState;
    });

    const TICK_RATE_MS = 1000;
    let lastTick = Date.now();
    let tickCounter = 0;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTick;
      
      if (deltaMs > 0 && deltaMs < 5000) {
        updateGameLoop(deltaMs);
      }

      // Pest infection check every 10 seconds
      tickCounter++;
      if (tickCounter % 10 === 0) {
        tryInfectPests();
      }

      // Weather check every 30 seconds
      if (tickCounter % 30 === 0) {
        processWeather();
      }

      // Update mission progress every 5 seconds
      if (tickCounter % 5 === 0) {
        updateMissionProgress();
      }
      
      lastTick = now;
    }, TICK_RATE_MS);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [updateGameLoop, processOfflineTime, processWeather, tryInfectPests, updateMissionProgress]);
};
