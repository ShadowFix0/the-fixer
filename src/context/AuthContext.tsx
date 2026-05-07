import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for persistent Guest user in localStorage
    const savedGuest = localStorage.getItem('shadow_sovereign_guest_user');
    if (savedGuest) {
      setUser(JSON.parse(savedGuest));
      setLoading(false);
    }

    // 2. Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.removeItem('shadow_sovereign_guest_user'); // Clear guest if real user exists
      } else if (!savedGuest) {
        setUser(null);
      }
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error("Error handling redirect result", error);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Use redirect on mobile for better compatibility
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const loginAsGuest = () => {
    const guestUser = { 
      uid: 'guest', 
      displayName: 'صياد مجهول', 
      photoURL: '',
      isAnonymous: true 
    } as any;
    
    setUser(guestUser);
    localStorage.setItem('shadow_sovereign_guest_user', JSON.stringify(guestUser));
    setLoading(false);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('shadow_sovereign_guest_user');
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
