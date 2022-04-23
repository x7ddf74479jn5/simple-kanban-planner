import type { DocumentReference } from "firebase/firestore";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { getConverter, useFirestore } from "@/lib/firebase";
import type { Board } from "@/models";
import { boardSchema } from "@/models";

const boardConverter = getConverter<Board>(boardSchema.parse);

export const getBoardDocRef = ({ userId, boardId }: { userId: string; boardId: string }) => {
  const db = useFirestore();
  return doc(db, `users/${userId}/boards/${boardId}`).withConverter(boardConverter);
};

export const getBoardColRef = ({ userId }: { userId: string }) => {
  const db = useFirestore();
  return collection(db, `users/${userId}/boards`).withConverter(boardConverter);
};

export const getBoardDoc = async (ref: DocumentReference<Board>) => {
  return await getDoc(ref);
};

export const createBoard = async (ref: DocumentReference<Board>, data: Board) => {
  await setDoc(ref, data);
};

export const updateBoard = async (ref: DocumentReference<Board>, data: Board) => {
  await updateDoc(ref, data);
};

export const deleteBoard = async (ref: DocumentReference<Board>) => {
  await deleteDoc(ref);
};
