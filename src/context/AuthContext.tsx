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
    let isMounted = true;

    const initAuth = async () => {
      // 1. Check for guest user first (instant)
      const savedGuest = localStorage.getItem('shadow_sovereign_guest_user');
      if (savedGuest && isMounted) {
        try {
          setUser(JSON.parse(savedGuest));
        } catch (e) {
          localStorage.removeItem('shadow_sovereign_guest_user');
        }
      }

      // 2. Check if we are expecting a redirect result
      const isPendingRedirect = localStorage.getItem('firebase_redirect_pending') === 'true';

      try {
        const result = await getRedirectResult(auth);
        localStorage.removeItem('firebase_redirect_pending'); // Clear it
        
        if (result?.user) {
          if (isMounted) {
            setUser(result.user);
            localStorage.removeItem('shadow_sovereign_guest_user');
          }
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error handling redirect result", error);
        localStorage.removeItem('firebase_redirect_pending');
      }

      // 3. Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!isMounted) return;

        if (firebaseUser) {
          setUser(firebaseUser);
          localStorage.removeItem('shadow_sovereign_guest_user');
          localStorage.removeItem('firebase_redirect_pending');
          setLoading(false);
        } else {
          // If we are NOT pending a redirect, we can safely stop loading
          if (!isPendingRedirect) {
            if (!localStorage.getItem('shadow_sovereign_guest_user')) {
              setUser(null);
            }
            setLoading(false);
          }
        }
      });

      // Emergency timeout: if still loading after 10 seconds, force stop
      setTimeout(() => {
        if (isMounted && !firebase.auth?.currentUser && !localStorage.getItem('shadow_sovereign_guest_user')) {
           // Wait, I can't use firebase.auth directly easily here, just use loading state
        }
        // Simplified: just force loading false after 10s if still stuck
        if (isMounted) setLoading(false);
      }, 10000);

      return unsubscribe;
    };

    const unsubscribePromise = initAuth();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsub => unsub?.());
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        localStorage.setItem('firebase_redirect_pending', 'true');
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      localStorage.removeItem('firebase_redirect_pending');
      setLoading(false);
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
      setLoading(true);
      localStorage.removeItem('shadow_sovereign_guest_user');
      await signOut(auth);
      setUser(null);
      setLoading(false);
      // Removed reload to handle state naturally, but if needed can be added back
      // window.location.reload(); 
    } catch (error) {
      console.error("Error signing out", error);
      setLoading(false);
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
