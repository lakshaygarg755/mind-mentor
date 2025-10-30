import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  timeLeft: number;
  isActive: boolean;
  mode: 'focus' | 'break';
  focusTime: number;
  breakTime: number;
  progress: number;
  lastTick: number;
}

interface TimerStore extends TimerState {
  setTimeLeft: (time: number) => void;
  setMode: (mode: 'focus' | 'break') => void;
  setIsActive: (active: boolean) => void;
  setProgress: (progress: number) => void;
  setFocusTime: (time: number) => void;
  setBreakTime: (time: number) => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      timeLeft: 25 * 60,
      isActive: false,
      mode: 'focus',
      focusTime: 25,
      breakTime: 5,
      progress: 0,
      lastTick: Date.now(),

      setTimeLeft: (time) => set({ timeLeft: time }),
      setMode: (mode) => set({ mode }),
      setIsActive: (isActive) => set({ isActive, lastTick: Date.now() }),
      setProgress: (progress) => set({ progress }),
      setFocusTime: (time) => set({ focusTime: time }),
      setBreakTime: (time) => set({ breakTime: time }),

      reset: () => {
        const { mode, focusTime, breakTime } = get();
        const currentTime = mode === 'focus' ? focusTime : breakTime;
        set({
          timeLeft: currentTime * 60,
          isActive: false,
          progress: 0,
          lastTick: Date.now()
        });
      },

      tick: () => {
        const state = get();
        const now = Date.now();
        const delta = (now - state.lastTick) / 1000;

        if (state.isActive && delta >= 0.1) {
          const newTimeLeft = Math.max(0, state.timeLeft - delta);
          const totalTime = state.mode === 'focus' ? state.focusTime * 60 : state.breakTime * 60;
          const newProgress = ((totalTime - newTimeLeft) / totalTime) * 100;

          set({
            timeLeft: newTimeLeft,
            progress: newProgress,
            lastTick: now
          });
        }
      }
    }),
    {
      name: 'timer-storage',
      // Persist all state except lastTick
      partialize: (state) => ({
        timeLeft: state.timeLeft,
        isActive: state.isActive,
        mode: state.mode,
        focusTime: state.focusTime,
        breakTime: state.breakTime,
        progress: state.progress
      })
    }
  )
); 