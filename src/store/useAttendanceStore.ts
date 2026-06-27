import { create } from 'zustand';

interface AttendanceState {
  hasPunchedIn: boolean;
  hasPunchedOut: boolean;
  punchInTime: string | null;
  punchOutTime: string | null;
  setPunchIn: (time: string) => void;
  setPunchOut: (time: string) => void;
  resetDaily: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  hasPunchedIn: false,
  hasPunchedOut: false,
  punchInTime: null,
  punchOutTime: null,
  setPunchIn: (time) => set({ hasPunchedIn: true, punchInTime: time }),
  setPunchOut: (time) => set({ hasPunchedOut: true, punchOutTime: time }),
  resetDaily: () => set({ hasPunchedIn: false, hasPunchedOut: false, punchInTime: null, punchOutTime: null }),
}));
