import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from "../lib/firebase";

export type User = {
  name: string;
  email: string;
  avatar?: string;
  token: string;
  emailVerified: boolean;
  provider: "email" | "google";
};

export type Address = {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

type FirebaseUser = {
  providerData: Array<{ providerId?: string }>;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
  savedAddress: Address | null;
  saveAddress: (address: Address) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  sendVerificationEmail: async () => {},
  updateProfile: async () => {},
  savedAddress: null,
  saveAddress: () => {},
});

function mapFirebaseUser(firebaseUser: FirebaseUser | null): User | null {
  if (!firebaseUser) return null;
  const providerId = firebaseUser.providerData[0]?.providerId ?? "password";
  return {
    name: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
    email: firebaseUser.email ?? "",
    avatar: firebaseUser.photoURL ?? undefined,
    token: "",
    emailVerified: firebaseUser.emailVerified,
    provider: providerId === "google.com" ? "google" : "email",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase auth state listener — replaces AsyncStorage manual restore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const mapped = mapFirebaseUser(firebaseUser);
        setUser(mapped);
        if (firebaseUser.email) {
          const addr = await AsyncStorage.getItem(`mira_address_${firebaseUser.email}`);
          if (addr) setSavedAddress(JSON.parse(addr));
        }
      } else {
        setUser(null);
        setSavedAddress(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(firebaseUser, { displayName: name });
    await sendEmailVerification(firebaseUser);
    // Reload so displayName is reflected in onAuthStateChanged
    setUser(mapFirebaseUser({ ...firebaseUser, displayName: name } as any));
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setSavedAddress(null);
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }, []);

  const updateProfile = useCallback(async (updates: { name?: string; avatar?: string }) => {
    if (!auth.currentUser) return;
    await firebaseUpdateProfile(auth.currentUser, {
      displayName: updates.name ?? auth.currentUser.displayName ?? undefined,
      photoURL: updates.avatar ?? auth.currentUser.photoURL ?? undefined,
    });
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const saveAddress = useCallback((address: Address) => {
    setSavedAddress(address);
    if (auth.currentUser?.email) {
      AsyncStorage.setItem(
        `mira_address_${auth.currentUser.email}`,
        JSON.stringify(address)
      );
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: user !== null,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendVerificationEmail,
      updateProfile,
      savedAddress,
      saveAddress,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
