import type { User } from "firebase/auth";
import type { DocumentReference } from "firebase/firestore";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

import { getConverter, useFirestore } from "@/lib/firebase";

// const userConverter = getConverter<User>();

export const getUserDocRef = ({ userId }: { userId: string }) => {
  const db = useFirestore();
  return doc(db, `users/${userId}}`);
};

export const getUserColRef = ({ userId }: { userId: string }) => {
  const db = useFirestore();
  return collection(db, `users/${userId}`);
};

export const createUser = async (ref: DocumentReference<User>, data: User) => {
  await setDoc(ref, data);
};

export const getUser = async (ref: DocumentReference<User>) => {
  return await getDoc(ref);
};
