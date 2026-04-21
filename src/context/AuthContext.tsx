"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  phone: string | null;
  collegeId: string | null;
  role: "user" | "admin" | "vendor";
  isOnboarded: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user
          const newProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || "",
            email: user.email,
            phone: user.phoneNumber,
            collegeId: null,
            role: "user",
            isOnboarded: false
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { ...profile, ...data, isOnboarded: true }, { merge: true });
    setProfile(prev => prev ? { ...prev, ...data, isOnboarded: true } : null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
