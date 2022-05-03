import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import type * as z from "zod";

import { Checklist } from "@/components/Checklist";
import { Exclaim } from "@/components/Icons";
import { Modal } from "@/components/Modal";
import { useModalState } from "@/hooks/useModalState";
import { typedArrayRemove } from "@/lib/firebase";
import type { DefaultColumn, Task } from "@/models";
import { taskSchema } from "@/models";
import { getColumnDocRef, updateColumn } from "@/repositories/column";
import { deleteTask, getTaskDocRef, updateTask } from "@/repositories/task";
import { extractPriority } from "@/utils";

const schema = taskSchema.pick({ title: true, description: true, priority: true });

export type FormValues = z.infer<typeof schema>;

type Props = {
  taskDetails: Task;
  boardId: string;
  userId: string;
  columnDetails: DefaultColumn;
  onClose: () => void;
};

export const TaskDetails = ({ taskDetails, boardId, userId, columnDetails, onClose }: Props) => {
  const { isModalOpen, openModal: handleOpenModal, closeModal } = useModalState();
  const [isEditing, setIsEditing] = useState(false);
  const methods = useForm<FormValues>({
    defaultValues: { title: taskDetails.title, description: taskDetails.description, priority: taskDetails.priority },
    resolver: zodResolver(schema),
  });
  const { register, handleSubmit, watch } = methods;
  const formFields = watch();

  const handleUpdateTask: SubmitHandler<FormValues> = async (data) => {
    if (!taskDetails.id) return;
    onClose();

    const { title, description, priority } = data;

    const taskDocRef = getTaskDocRef({ userId, boardId, taskId: taskDetails.id });
    await updateTask(taskDocRef, { title, priority, description });
  };

  const handleDeleteTask = async () => {
    if (!columnDetails.id) return;
    onClose();

    const columnDocRef = getColumnDocRef({ userId, boardId, columnId: columnDetails.id });
    await updateColumn(columnDocRef, { taskIds: typedArrayRemove(taskDetails.id) });

    const taskDocRef = getTaskDocRef({ userId, boardId, taskId: taskDetails.id });
    await deleteTask(taskDocRef);
  };

  const handleCloseModal = useCallback(() => {
    closeModal();
  }, []);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleEndEdit = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === "Space") {
      setIsEditing(true);
    }
  };

  return (
    <div className="text-sm md:px-12 md:text-base">
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} ariaText="Task Delete confirmation">
        <div className="md:px-12">
          <div className="mb-2 text-yellow-600">
            <Exclaim />
          </div>
          <h2 className="text-base text-gray-900 md:text-2xl">タスクを本当に削除しますか?</h2>
          <h3 className="text-sm text-red-600 md:text-xl">この処理は取り消せません。</h3>
          <div className="flex my-8">
            <button
              className="py-1 px-2 mr-4 text-sm text-red-700 rounded-sm border border-red-700 md:text-base"
              onClick={handleDeleteTask}
            >
              はい、削除します
            </button>
            <button
              className="py-1 px-2 text-sm text-gray-100 bg-blue-800 rounded-sm md:text-base"
              onClick={handleCloseModal}
            >
              いいえ、削除しません
            </button>
          </div>
        </div>
      </Modal>

      <form onSubmit={handleSubmit(handleUpdateTask)} autoComplete="off">
        <div>
          <label className="block text-xs tracking-wide text-gray-500 uppercase  sm:text-sm" htmlFor="title">
            タイトル:
          </label>
          <input {...register("title")} type="text" className="block w-full text-xl outline-none md:text-2xl" />
        </div>

        <div className="gap-x-20 w-full lg:grid lg:grid-cols-8">
          {/* First column */}
          <div className="col-span-6 mt-12">
            <div>
              <span className="block text-xs tracking-wide text-gray-500 uppercase  sm:text-sm">チェックリスト:</span>
              <Checklist todos={taskDetails.todos || []} taskId={taskDetails.id} boardId={boardId} userId={userId} />
            </div>

            <div className="mt-12 w-full">
              <div className={`${isEditing ? "" : "hidden"}`}>
                <div className="">
                  <label
                    className="block text-xs tracking-wide text-gray-500 uppercase  sm:text-sm"
                    htmlFor="description"
                  >
                    内容:
                  </label>
                  <textarea
                    {...register("description")}
                    className="py-3 px-4  w-full h-56 border border-gray-300 outline-none"
                  />
                  <div>
                    <button
                      onClick={handleEndEdit}
                      className="inline-block py-0.5 px-2 text-gray-700 bg-gray-300 rounded-sm cursor-pointer"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    className="block text-xs tracking-wide text-gray-500 uppercase sm:text-sm"
                    htmlFor="description"
                  >
                    プレビュー:
                  </label>
                  <ReactMarkdown
                    remarkPlugins={[gfm]}
                    className="overflow-y-auto py-3 px-2 text-sm leading-normal text-gray-900 border border-gray-200 prose sm:text-base"
                  >
                    {formFields.description || ""}
                  </ReactMarkdown>
                </div>
              </div>

              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div
                className={`${isEditing ? "hidden" : ""}`}
                onClick={handleStartEdit}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                onKeyUp={handleKeyDown}
              >
                <label
                  className="block text-xs tracking-wide text-gray-500 uppercase  sm:text-sm"
                  htmlFor="description"
                >
                  内容:
                </label>
                <ReactMarkdown
                  remarkPlugins={[gfm]}
                  className="overflow-y-auto py-3 px-2 text-sm leading-normal text-gray-900 bg-gray-50 border border-gray-200 prose  sm:text-base"
                >
                  {taskDetails.description === "" || taskDetails.description === null
                    ? "*何も書いてませんね。追加してみましょう。*"
                    : formFields.description || ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Second column */}
          <div className="col-span-2 mt-12">
            <div className="">
              <label className="block text-xs tracking-wide text-gray-500 uppercase  sm:text-sm" htmlFor="title">
                優先度:
              </label>
              <div className="flex items-center">
                <select {...register("priority")} defaultValue={taskDetails.priority} className="select">
                  <option className="option" value="high">
                    High
                  </option>
                  <option className="option" value="medium">
                    Medium
                  </option>
                  <option className="option" value="low">
                    Low
                  </option>
                </select>
                {extractPriority(taskDetails.priority)}
              </div>
            </div>

            <div className="mt-12">
              <label className="block text-xs tracking-wide text-gray-500 uppercase  sm:text-sm" htmlFor="title">
                ステータス:
              </label>
              <h4 className="inline-block py-1 px-2 text-white bg-gray-600 rounded-sm">{columnDetails.title}</h4>
            </div>

            {taskDetails.dateAdded ? (
              <div className="mt-12">
                <label className="block text-xs tracking-wide text-gray-500 uppercase  sm:text-sm" htmlFor="desc">
                  追加日:
                </label>
                <h4 className="tracking-wide">{new Date(taskDetails.dateAdded).toLocaleString().split(",")[0]}</h4>
              </div>
            ) : null}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end my-12 w-full text-sm sm:text-base">
          {taskDetails.description !== formFields.description ||
          taskDetails.title !== formFields.title ||
          taskDetails.priority !== formFields.priority ? (
            <div className="py-1 px-2 text-white bg-green-700 rounded-sm transition-transform duration-300 hover:-translate-y-1">
              <button className="cursor-pointer" type="submit">
                保存する
              </button>
            </div>
          ) : null}

          <button
            className="py-0.5 px-2 ml-4 text-red-700 hover:text-white hover:bg-red-700 rounded-sm border border-red-700 transition-colors duration-300"
            onClick={handleOpenModal}
          >
            <p className="cursor-pointer">削除する</p>
          </button>
        </div>
      </form>
    </div>
  );
};
