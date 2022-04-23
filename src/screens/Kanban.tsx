import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import type { DropResult } from "react-beautiful-dnd";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import * as z from "zod";

import { Column } from "@/components/Column";
import { Add, Github } from "@/components/Icons";
import { Modal } from "@/components/Modal";
import { useKanban } from "@/hooks/useKanbanData";
import { useModalState } from "@/hooks/useModalState";
import { typedArrayUnion } from "@/lib/firebase";
import type { Priority } from "@/models";
import { defaultColumnSchema } from "@/models";
import { getBoardDocRef, updateBoard } from "@/repositories/board";
import { createColumn, getColumnDocRef, updateColumn } from "@/repositories/column";
import { debounce } from "@/utils";

import { AddTask } from "./AddTask";

const schema = z.object({
  newColumnName: defaultColumnSchema.shape.id,
});

type FormValues = z.infer<typeof schema>;

type Filter = Priority | "all";

type Props = {
  userId: string;
};

export const Kanban = ({ userId }: Props) => {
  const { boardId } = useParams();
  if (!boardId) throw new Error("boardId is not defined");
  const { isModalOpen, openModal, closeModal } = useModalState();
  const { initialData, setInitialData, boardName } = useKanban(userId, boardId);
  const [filter, setFilter] = useState<Filter | null>("all");
  const filters = ["high", "medium", "low"] as const;
  const { register, handleSubmit, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!initialData) return;
    if (!destination) return;

    if (result.type === "task") {
      const startColumn = initialData?.columns[source.droppableId];
      const endColumn = initialData?.columns[destination.droppableId];

      if (!startColumn || !endColumn) return;

      if (startColumn === endColumn) {
        const newTaskIds = Array.from(endColumn?.taskIds ?? []);

        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        const newColumn = {
          ...endColumn,
          taskIds: newTaskIds,
        };

        const newState = {
          ...initialData,
          columns: { ...initialData?.columns, [endColumn.id]: newColumn },
        };

        setInitialData(newState);

        const columnDocRef = getColumnDocRef({ userId, boardId, columnId: startColumn.id });
        await updateColumn(columnDocRef, { taskIds: newTaskIds });

        return;
      }

      const startTaskIDs = Array.from(startColumn?.taskIds ?? []);
      startTaskIDs.splice(source.index, 1);
      const newStart = {
        ...startColumn,
        taskIds: startTaskIDs,
      };

      const finishTaskIDs = Array.from(endColumn.taskIds);
      finishTaskIDs.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...endColumn,
        taskIds: finishTaskIDs,
      };

      const newState = {
        ...initialData,
        columns: {
          ...initialData.columns,
          [startColumn.id]: newStart,
          [endColumn.id]: newFinish,
        },
      };

      setInitialData(newState);

      const startColumnDocRef = getColumnDocRef({ userId, boardId, columnId: newStart.id });
      await updateColumn(startColumnDocRef, { taskIds: startTaskIDs });

      const finishColumnDocRef = getColumnDocRef({ userId, boardId, columnId: newFinish.id });
      await updateColumn(finishColumnDocRef, { taskIds: finishTaskIDs });
    } else {
      const newColumnOrder = Array.from(initialData?.columnOrder ?? []);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      setInitialData({ ...initialData, columnOrder: newColumnOrder });
      const columnOrderDocRef = getColumnDocRef({ userId, boardId, columnId: "columnOrder" });
      await updateColumn(columnOrderDocRef, { order: newColumnOrder });
    }
  };

  const handleFilter = (f: Filter) => {
    setFilter(f);
  };

  const handleAddCol: SubmitHandler<FormValues> = async (data) => {
    const { newColumnName } = data;
    const columnDocRef = getColumnDocRef({ userId, boardId, columnId: newColumnName });
    await createColumn(columnDocRef, { id: newColumnName, title: newColumnName, taskIds: [] });

    const columnOrderDocRef = getColumnDocRef({ userId, boardId, columnId: "columnOrder" });
    await updateColumn(columnOrderDocRef, { order: typedArrayUnion(newColumnName) });

    reset();
  };

  const handleChangeBoardName = debounce(async (ev) => {
    const boardDocRef = getBoardDocRef({ userId, boardId });
    await updateBoard(boardDocRef, { name: ev });
  }, 7000);

  const handleCloseModal = useCallback(() => {
    closeModal();
  }, []);

  const handleOpenModal = useCallback(() => {
    openModal();
  }, []);

  return (
    <>
      {initialData ? (
        <>
          <Modal isOpen={isModalOpen} onClose={handleCloseModal} ariaText="Add a new task">
            <AddTask boardId={boardId} userId={userId} allCols={initialData.columnOrder} onClose={handleCloseModal} />
          </Modal>

          <main className="pb-2 w-screen h-screen">
            <div className="flex flex-col h-full">
              <header className="z-10 py-5 mx-3 text-sm bg-white sm:text-base md:mx-6">
                <div className="flex flex-wrap justify-between items-center">
                  <span className="text-xl">
                    <Link to="/" className="text-blue-800 hover:text-blue-500">
                      ボード{" "}
                    </Link>
                    <span className="">/</span>
                    <input
                      type="text"
                      defaultValue={boardName}
                      className="ml-2 w-1/2 text-gray-800 truncate"
                      onChange={(e) => handleChangeBoardName(e.target.value)}
                    />
                  </span>
                  <div className="flex flex-wrap items-center sm:space-x-9">
                    <div className="flex items-center mt-2 sm:mt-0 ">
                      <h3 className="mr-2 text-gray-500">優先度: </h3>
                      <div className="flex space-x-1 text-blue-900 bg-indigo-50 rounded-sm">
                        {filters.map((f) => (
                          <button
                            key={f}
                            className={`px-3  border-black py-1 hover:bg-blue-600 hover:text-blue-50 cursor-pointer capitalize ${
                              filter === f ? "bg-blue-600 text-blue-50" : ""
                            }`}
                            onClick={() => handleFilter(f)}
                          >
                            {f}
                          </button>
                        ))}
                        {filter ? (
                          <button
                            className="py-1 px-2 hover:text-blue-700 rounded-sm cursor-pointer"
                            onClick={() => handleFilter("all")}
                          >
                            All
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="hidden items-center py-1 px-2 mr-3 text-blue-900 hover:text-blue-50 bg-indigo-50 hover:bg-blue-600 rounded-sm sm:flex">
                      <Github />
                      <a href="https://github.com/x7ddf74479jn5/simple-kanban-planner" target="blank">
                        GitHub
                      </a>
                    </div>
                    <button
                      className="fixed right-6 bottom-6 p-2 text-white bg-gradient-to-br from-primary via-indigo-600 to-blue-600 rounded-full transition-all duration-300 hover:scale-110 sm:static sm:p-1"
                      onClick={handleOpenModal}
                    >
                      <Add />
                    </button>
                  </div>
                </div>
              </header>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="allCols" type="column" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid overflow-x-auto grid-flow-col auto-cols-220 items-start pt-3 mx-1 h-full md:auto-cols-270 md:pt-2 md:mx-6"
                      style={{ height: "90%" }}
                    >
                      {initialData?.columnOrder.map((col, i) => {
                        const column = initialData?.columns[col];
                        const tasks = column.taskIds?.map((t) => t);
                        return (
                          <Column
                            column={column}
                            tasks={tasks}
                            allData={initialData}
                            key={column.id}
                            boardId={boardId}
                            userId={userId}
                            filterBy={filter}
                            index={i}
                          />
                        );
                      })}
                      {provided.placeholder}
                      <form onSubmit={handleSubmit(handleAddCol)} autoComplete="off" className="ml-2">
                        <input
                          {...register("newColumnName")}
                          className="py-1 px-2 text-indigo-800 placeholder:text-indigo-500 truncate bg-indigo-50 rounded-sm outline-none ring-2 focus:ring-indigo-500"
                          type="text"
                          placeholder="新しいカラムを作成する"
                        />
                      </form>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </main>
        </>
      ) : (
        <div className="w-screen h-screen spinner" />
      )}
    </>
  );
};
