import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

import { typedArrayUnion, typedServerTimestamp } from "@/lib/firebase";
import { taskSchema } from "@/models";
import { getColumnDocRef, updateColumn } from "@/repositories/column";
import { createTask, getTaskDocRef } from "@/repositories/task";

const schema = z.object({
  title: taskSchema.shape.title,
  priority: taskSchema.shape.priority.default("low"),
  column: z.string().nonempty(),
  description: taskSchema.shape.description.default(""),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  userId: string;
  boardId: string;
  onClose: () => void;
  allCols: string[];
};

export const AddTask = ({ boardId, userId, onClose: close, allCols }: Props) => {
  const { register, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleAddTask: SubmitHandler<FormValues> = async (data) => {
    const { title, priority, column, description } = data;
    const uid = uuidv4();

    const taskDocRef = getTaskDocRef({ userId, boardId, taskId: uid });
    await createTask(taskDocRef, {
      id: uid,
      title,
      priority,
      description,
      todos: [],
      dateAdded: typedServerTimestamp(),
    });

    const columnDocRef = getColumnDocRef({ userId, boardId, columnId: column });
    await updateColumn(columnDocRef, { taskIds: typedArrayUnion(uid) });

    close();
  };

  return (
    <div className="py-2 px-3 text-sm  md:px-12 md:text-base">
      <form onSubmit={handleSubmit(handleAddTask)} autoComplete="off">
        <h4 className="text-lg text-gray-800 sm:text-2xl">タスクを追加する</h4>

        <div className="mt-6 sm:mt-12">
          <div>
            <label htmlFor="newTaskTitle" className="block text-gray-500">
              タイトル:
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-3/4 text-lg bg-transparent border-b border-gray-400 outline-none md:text-2xl"
            />
          </div>

          <div className="my-8 sm:flex">
            <div className="">
              <label htmlFor="priority" className=" block text-gray-500 sm:inline">
                優先度:{" "}
              </label>
              <select {...register("priority")} className="select">
                <option value="high" className="option">
                  High
                </option>
                <option value="medium" className="option">
                  Medium
                </option>
                <option value="low" className="option">
                  Low
                </option>
              </select>
            </div>

            <div className="mt-8 sm:mt-0 sm:ml-12">
              <label className="block text-gray-500 sm:inline" htmlFor="column">
                カラム選択:{" "}
              </label>
              <select {...register("column")} required className="select">
                {allCols.map((c) => (
                  <option className="option" value={c} key={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="my-8">
          <label htmlFor="newTaskDescription" className="block text-gray-500">
            内容(任意):
          </label>
          <textarea
            {...register("description")}
            className="py-3 px-4 w-full h-32 border border-gray-300 outline-none"
          />
        </div>

        <button type="submit" className="py-1 px-2 text-white bg-purple-500 rounded-sm">
          タスク登録
        </button>
      </form>
    </div>
  );
};
