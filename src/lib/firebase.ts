import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from "firebase/firestore";
import { arrayRemove } from "firebase/firestore";
import { arrayUnion, enableIndexedDbPersistence, getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
enableIndexedDbPersistence(db);
const useFirestore = () => {
  return db;
};

const auth = getAuth(app);

const getConverter = <T extends object>(assert: (data: unknown) => asserts data is T): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data({ serverTimestamps: "estimate" });

    const result = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (typeof value.toString == "function" && value.toString().startsWith("Timestamp")) {
          return [key, value.toDate()];
        }
        return [key, value];
      })
    );

    assert(result);

    return result;
  },
});

const typedArrayUnion = <T>(...args: any[]) => {
  return arrayUnion(...args) as unknown as Array<T>;
};

const typedArrayRemove = <T>(...args: any[]) => {
  return arrayRemove(...args) as unknown as Array<T>;
};

const typedServerTimestamp = () => {
  return serverTimestamp() as unknown as Date;
};

export { auth, getConverter, typedArrayRemove, typedArrayUnion, typedServerTimestamp, useFirestore };
