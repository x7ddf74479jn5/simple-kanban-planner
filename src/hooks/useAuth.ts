import type { User } from "firebase/auth";
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithRedirect, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { auth, useFirestore } from "@/lib/firebase";
import { createBoardForAnons } from "@/utils";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const db = useFirestore();

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
        setError(err.message);
      }
    }
  }, []);

  const loginAnonymously = useCallback(() => {
    signInAnonymously(auth).then((user) => {
      console.info("Welcome Anon");
      createBoardForAnons(user.user.uid);
    });
  }, []);

  const logOut = useCallback(() => {
    signOut(auth);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, { id: user.uid, name: user.displayName, email: user.email }, { merge: true });
      } else setUser(null);
      setIsLoading(false);
    });
  }, [user]);

  return [user, isLoading, loginWithGoogle, logOut, error, loginAnonymously] as const;
};
