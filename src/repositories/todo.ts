import type { DocumentReference } from "firebase/firestore";
import { doc, setDoc, updateDoc } from "firebase/firestore";

import { getConverter, useFirestore } from "@/lib/firebase";
import type { Todo } from "@/models";
import { todoSchema } from "@/models";

const todoConverter = getConverter<Todo>(todoSchema.parse);

export const getTodoDocRef = ({ userId, boardId, todoId }: { userId: string; boardId: string; todoId: string }) => {
  const db = useFirestore();
  return doc(db, `users/${userId}/boards/${boardId}/todos/${todoId}`).withConverter(todoConverter);
};

export const updateTodo = async (ref: DocumentReference<Todo>, task: Partial<Todo>) => {
  await updateDoc<Todo>(ref, task);
};

export const createTodo = async (ref: DocumentReference<Todo>, task: Todo) => {
  await setDoc<Todo>(ref, task);
};
