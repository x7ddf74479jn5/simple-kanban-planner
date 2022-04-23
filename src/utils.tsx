import { High, Low, Medium } from "@/components/Icons";
import type { Column, Priority, Task } from "@/models";
import { createBoard, getBoardDocRef } from "@/repositories/board";
import { createColumn, getColumnDocRef } from "@/repositories/column";
import { createTask, getTaskDocRef } from "@/repositories/task";
import type { SetRequired } from "@/types/utils";

export const extractPriority = (priority: Priority) => {
  switch (priority) {
    case "low": {
      return <Low />;
    }

    case "medium": {
      return <Medium />;
    }

    case "high": {
      return <High />;
    }

    default:
      return null;
  }
};

export const debounce = (callback: (...args: any[]) => void, wait: number) => {
  let timeoutId = 0;
  return (...args: any[]) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

export const createBoardForAnons = async (userId: string) => {
  const tasks: SetRequired<Task, "id">[] = [
    {
      id: "1",
      title: "Simple Kanban Plannerへようこそ 🙌",
      description: "Simple Kanaban Plannerは思考の整理を手助けします。",
      priority: "low",
      dateAdded: new Date(),
      todos: [],
    },

    {
      id: "2",
      title: "記述方法",
      description:
        "## Simple Kanaban PlannerはMarkdownにも対応しています!\n- GFM形式で記述できます。\n- **太字** と *斜体*。\n ```\n コードも書けます!\n```\n>引用部分。\nMarkdownについては[ここ](https://commonmark.org/help/)を参照してください。",
      priority: "high",
      dateAdded: new Date(),
      todos: [],
    },

    {
      id: "3",
      title: "タスクやカラムの順番を入れ替えてみましょう",
      description: "",
      priority: "high",
      dateAdded: new Date(),
      todos: [],
    },

    {
      id: "4",
      title: "タスクの細分化",
      description: "達成可能な小さいサイズに分割しましょう",
      priority: "medium",
      dateAdded: new Date(),
      todos: [
        { id: "1", task: "1番目", done: false },
        { id: "3", task: "2番め", done: true },
        { id: "2", task: "並べ替えられます!", done: false },
      ],
    },

    {
      id: "5",
      title: "3種類の優先順位があります",
      priority: "low",
      todos: [],
      description: "- High\n- Medium\n- Low",
    },

    {
      id: "6",
      title: "気に入りましたか? 😊",
      priority: "medium",
      todos: [],
      description:
        "### フィードバックや提案がありましたらぜひ!\n[GitHub](http://github.com/x7ddf74479jn5/simple-kanban-planner)レポジトリのリンクです。よろしければ🌟を!\n**モチベーションが向上します。**",
    },

    {
      id: "7",
      title: "ボード名やカラム名を変えてみましょう",
      priority: "low",
      todos: [],
      description: "",
    },
  ];

  const columns = [
    { title: "未分類", taskIds: ["1", "2"] },
    { title: "進行中", taskIds: ["3", "5", "7"] },
    { title: "完了", taskIds: ["6"] },
    { title: "待機中", taskIds: ["4"] },
  ];

  const columnOrder: Column = { id: "columnOrder", order: ["未分類", "待機中", "進行中", "完了"] };
  const columnDocRef = getColumnDocRef({ userId, boardId: "first", columnId: "columnOrder" });
  await createColumn(columnDocRef, columnOrder);

  const boardDocRef = getBoardDocRef({ userId, boardId: "first" });
  createBoard(boardDocRef, { name: "Main Board" });

  await Promise.all(
    columns.map(async (c) => {
      const columnDocRef = getColumnDocRef({ userId, boardId: "first", columnId: c.title });
      await createColumn(columnDocRef, { title: c.title, taskIds: c.taskIds, id: c.title });
    })
  );

  tasks.forEach((t) => {
    const taskDocRef = getTaskDocRef({ userId, boardId: "first", taskId: t.id });
    createTask(taskDocRef, t);
  });
};
