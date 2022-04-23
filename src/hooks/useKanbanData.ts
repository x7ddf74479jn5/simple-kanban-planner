import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import type { Column, DefaultColumn, Task } from "@/models";
import { columnOrderSchema } from "@/models";
import { getBoardDoc, getBoardDocRef } from "@/repositories/board";
import { getColumnColRef } from "@/repositories/column";
import { getTaskColRef } from "@/repositories/task";

export type Kanban = {
  columnOrder: string[];
  columns: Record<string, DefaultColumn>;
  tasks: Record<string, Task>;
};

export const useKanban = (userId: string, boardId: string) => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [columns, setColumns] = useState<Column[] | null>(null);
  const [final, setKanban] = useState<Kanban | null>(null);
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    const loadBoard = async () => {
      const boardDocRef = getBoardDocRef({ userId, boardId });
      const boardDoc = await getBoardDoc(boardDocRef);
      const data = boardDoc.data();
      if (data?.name) {
        setBoardName(data?.name);
      }
    };

    const loadTasks = async () => {
      const taskColRef = getTaskColRef({ userId, boardId });
      return onSnapshot(taskColRef, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => {
          const data = doc.data();
          const task = {
            ...data,
            id: doc.id,
          };
          return task;
        });
        setTasks(tasks);
      });
    };

    const loadColumns = async () => {
      const columnColRef = getColumnColRef({ userId, boardId });
      return onSnapshot(columnColRef, (snapshot) => {
        const columns = snapshot.docs.map((doc) => {
          const data = doc.data();
          const column = {
            ...data,
            id: doc.id,
          };
          return column;
        });
        setColumns(columns);
      });
    };

    loadBoard();
    loadTasks();
    loadColumns();
  }, [userId, boardId]);

  useEffect(() => {
    if (tasks && columns) {
      let co = columns.find((c) => c.id === "columnOrder");
      co = columnOrderSchema.parse(co);
      const cols = columns.filter((c): c is DefaultColumn => c.id !== "columnOrder");

      const finalCols = cols.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as Kanban["columns"]);
      const finalTasks = tasks.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as Kanban["tasks"]);

      const finalObject: Kanban = {
        columnOrder: co?.order,
        columns: finalCols,
        tasks: finalTasks,
      };

      setKanban(finalObject);
    }
  }, [tasks, columns]);

  return { initialData: final, setInitialData: setKanban, boardName };
};
