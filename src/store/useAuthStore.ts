import { create } from 'zustand';

type UserRole = 'admin' | 'employee' | null;

interface AuthState {
  role: UserRole;
  isAuthenticated: boolean;
  email: string | null;
  faceRegistered: boolean;
  setAuthData: (token: string, user: { email: string, role: string, faceRegistered: boolean }) => void;
  setFaceRegistered: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  return {
    role: user?.role || null,
    isAuthenticated: !!token,
    email: user?.email || null,
    faceRegistered: user?.faceRegistered || false,
    
    setAuthData: (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ 
        role: user.role as UserRole, 
        isAuthenticated: true, 
        email: user.email, 
        faceRegistered: user.faceRegistered 
      });
    },
    
    setFaceRegistered: (status) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.faceRegistered = status;
      localStorage.setItem('user', JSON.stringify(user));
      set({ faceRegistered: status });
    },
    
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ role: null, isAuthenticated: false, email: null, faceRegistered: false });
    },
  };
});
