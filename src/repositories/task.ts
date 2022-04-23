import type { DocumentReference } from "firebase/firestore";
import { collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";

import { getConverter, useFirestore } from "@/lib/firebase";
import type { Task } from "@/models";
import { taskSchema } from "@/models";

const taskConverter = getConverter<Task>(taskSchema.parse);

export const getTaskDocRef = ({ userId, boardId, taskId }: { userId: string; boardId: string; taskId: string }) => {
  const db = useFirestore();
  return doc(db, `users/${userId}/boards/${boardId}/tasks/${taskId}`).withConverter(taskConverter);
};

export const getTaskColRef = ({ userId, boardId }: { userId: string; boardId: string }) => {
  const db = useFirestore();
  return collection(db, `users/${userId}/boards/${boardId}/tasks`).withConverter(taskConverter);
};

export const updateTask = async (ref: DocumentReference<Task>, task: Partial<Task>) => {
  await updateDoc<Task>(ref, task);
};

export const createTask = async (ref: DocumentReference<Task>, task: Partial<Task>) => {
  await setDoc<Partial<Task>>(ref, task);
};

export const deleteTask = async (ref: DocumentReference<Task>) => {
  await deleteDoc(ref);
};
