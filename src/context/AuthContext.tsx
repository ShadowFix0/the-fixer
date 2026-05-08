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
        // Only await if we are actually expecting a result or it's the first load
        const result = await getRedirectResult(auth);
        if (result?.user) {
          if (isMounted) {
            setUser(result.user);
            localStorage.removeItem('shadow_sovereign_guest_user');
            localStorage.removeItem('firebase_redirect_pending');
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
          } else {
             // We ARE pending a redirect, but onAuthStateChanged returned null.
             // This is common on mobile while the result is being processed.
             // We stay in loading state.
          }
        }
      });

      // Emergency timeout: increased to 20 seconds for slow mobile redirects
      setTimeout(() => {
        if (isMounted) {
          setLoading(false);
          if (isPendingRedirect) {
            console.log("Redirect timeout reached");
            localStorage.removeItem('firebase_redirect_pending');
          }
        }
      }, 20000);

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
      
      // Store flag BEFORE any action
      localStorage.setItem('firebase_redirect_pending', 'true');

      // Try popup first on ALL devices. Modern mobile browsers often handle popups better than redirects
      // if they are triggered by a direct click.
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          setUser(result.user);
          localStorage.removeItem('shadow_sovereign_guest_user');
          localStorage.removeItem('firebase_redirect_pending');
          setLoading(false);
        }
      } catch (popupError: any) {
        console.log("Popup failed, falling back to redirect:", popupError.code);
        // If popup is blocked or fails, then fallback to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/cancelled-popup-request' ||
            popupError.code === 'auth/popup-closed-by-user') {
           await signInWithRedirect(auth, googleProvider);
        } else {
           localStorage.removeItem('firebase_redirect_pending');
           setLoading(false);
           throw popupError;
        }
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
