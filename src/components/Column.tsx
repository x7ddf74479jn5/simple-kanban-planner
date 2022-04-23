import { arrayRemove } from "firebase/firestore";
import { useRef, useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";

import type { Kanban } from "@/hooks/useKanbanData";
import { useModalState } from "@/hooks/useModalState";
import type { Column as TColumn, DefaultColumn, Priority } from "@/models";
import { deleteColumn, getColumnDocRef, updateColumn } from "@/repositories/column";
import { deleteTask, getTaskDocRef } from "@/repositories/task";
import type { SetRequired } from "@/types/utils";
import { debounce } from "@/utils";

import { Bin, Exclaim } from "./Icons";
import { Modal } from "./Modal";
import { Task } from "./Task";

type Props = {
  column: SetRequired<DefaultColumn, "title">;
  tasks: string[];
  allData: Kanban;
  boardId: string;
  filterBy: Priority | "all" | null;
  index: number;
  userId: string;
};

export const Column = ({ column, tasks, allData, boardId, userId, filterBy, index }: Props) => {
  const { isModalOpen, openModal: handleOpenModal, closeModal: handleCloseModal } = useModalState();
  const [isEditingCol, setIsEditing] = useState(false);
  const colInput = useRef<HTMLInputElement>(null);

  const handleDeleteCol = async (columnId: string, tasks: string[]) => {
    const columnOrderDocRef = getColumnDocRef({ userId, boardId, columnId: "columnOrder" });
    await updateColumn(columnOrderDocRef, { order: arrayRemove(columnId) } as Partial<TColumn>);
    const columnDocRef = getColumnDocRef({ userId, boardId, columnId });
    await deleteColumn(columnDocRef);

    //Extract and delete its tasks
    await Promise.all(
      tasks.map(async (taskId: string) => {
        const taskDocRef = getTaskDocRef({ userId, boardId, taskId });
        await deleteTask(taskDocRef);
      })
    );
  };

  const handleChangeColName = debounce(async (e: React.ChangeEvent<HTMLInputElement>, columnId: string) => {
    const columnDocRef = getColumnDocRef({ userId, boardId, columnId });
    await updateColumn(columnDocRef, { title: e.currentTarget.value });
  }, 7000);

  const handleMoveToInp = () => {
    setIsEditing(true);
    setTimeout(() => {
      colInput?.current?.focus();
    }, 50);
  };

  const handleOnBlur = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Draggable draggableId={column.id} index={index} key={column.id}>
        {(provided) => (
          <div {...provided.draggableProps} ref={provided.innerRef} className="mr-5">
            <div style={{ background: "#edf2ff" }}>
              <div
                {...provided.dragHandleProps}
                className="flex justify-between items-center py-1 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-sm"
              >
                <input
                  ref={colInput}
                  className={`sm:text-xl text-blue-700 text-lg px-2 w-10/12 ${isEditingCol ? "" : "hidden"}`}
                  onBlur={handleOnBlur}
                  type="text"
                  defaultValue={column.title || ""}
                  onChange={(e) => handleChangeColName(e, column.id)}
                />
                <button
                  className={`sm:text-lg text-blue-100 truncate text-lg ${isEditingCol ? "hidden" : ""}`}
                  onClick={handleMoveToInp}
                >
                  {column?.title || ""}{" "}
                </button>
                <button className="text-blue-700 hover:text-blue-50 cursor-pointer" onClick={handleOpenModal}>
                  <Bin />
                </button>
              </div>
              <Droppable droppableId={column.id} type="task">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`shadow-sm h-full py-4 px-2 ${
                      snapshot.isDraggingOver ? "bg-gradient-to-br from-green-400 via-green-200 to-green-100" : ""
                    }`}
                  >
                    {tasks.map((t, i) => (
                      <Task
                        allData={allData}
                        id={t}
                        index={i}
                        key={t}
                        boardId={boardId}
                        userId={userId}
                        columnDetails={column}
                        filterBy={filterBy}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} ariaText="Column Delete confirmation">
              <div className="md:px-12">
                <div className="mb-2 text-yellow-600">
                  <Exclaim />
                </div>
                <h2 className="mb-2 text-base text-gray-900 md:text-2xl">このカラムを本当に削除しますか?</h2>
                <h3 className="text-sm text-red-600 md:text-lg">
                  このカラムとタスクは完全に削除され、この操作は取り消せません。
                </h3>
                <div className="flex my-8">
                  <button
                    className="py-1 px-2 mr-4 text-sm text-red-600 rounded-sm border border-red-700 md:text-base"
                    onClick={() => handleDeleteCol(column.id, tasks)}
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
          </div>
        )}
      </Draggable>
    </>
  );
};
