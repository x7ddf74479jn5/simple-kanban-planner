import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useFirestore } from "@/lib/firebase";
import type { Board } from "@/models";
import { getBoardColRef } from "@/repositories/board";

export const useBoards = (userId: string) => {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const db = useFirestore();

  useEffect(() => {
    let isCleanup = false;
    const load = async () => {
      const userDocRef = doc(db, `users`, userId);
      const userDoc = await getDoc(userDocRef);
      try {
        if (userDoc) {
          const boardColRef = getBoardColRef({ userId: userDoc.id });
          const unsub = onSnapshot(boardColRef, (snapshot) => {
            const boards = snapshot.docs.map((doc) => {
              const board = doc.data();
              return {
                ...board,
                id: doc.id,
              };
            });
            if (!isCleanup) {
              setBoards(boards);
            }
          });
          return () => {
            isCleanup = true;
            unsub();
          };
        } else return;
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, [userId]);

  return boards;
};
