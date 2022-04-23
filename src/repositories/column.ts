import type { CollectionReference, DocumentReference } from "firebase/firestore";
import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";

import { getConverter, useFirestore } from "@/lib/firebase";
import type { Column } from "@/models";
import { columnSchema } from "@/models";

const columnConverter = getConverter<Column>(columnSchema.parse);

export const getColumnDocRef = ({
  userId,
  boardId,
  columnId,
}: {
  userId: string;
  boardId: string;
  columnId: string;
}) => {
  const db = useFirestore();
  return doc(db, `users/${userId}/boards/${boardId}/columns/${columnId}`).withConverter(columnConverter);
};

export const getColumnColRef = ({ userId, boardId }: { userId: string; boardId: string }) => {
  const db = useFirestore();
  return collection(db, `users/${userId}/boards/${boardId}/columns/`).withConverter(columnConverter);
};

export const createColumn = async (ref: DocumentReference<Column>, data: Column) => {
  await setDoc(ref, data);
};

export const createColumnWithAutoId = async (ref: CollectionReference<Column>, data: Column) => {
  await addDoc(ref, data);
};

export const updateColumn = async (ref: DocumentReference<Column>, data: Partial<Column>) => {
  await updateDoc<Column>(ref, data);
};

export const deleteColumn = async (ref: DocumentReference<Column>) => {
  await deleteDoc(ref);
};
