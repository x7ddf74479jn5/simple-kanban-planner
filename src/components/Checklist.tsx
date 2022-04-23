import { useRef, useState } from "react";
import type { DropResult } from "react-beautiful-dnd";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

import { typedArrayUnion } from "@/lib/firebase";
import type { Todo } from "@/models";
import { todoSchema } from "@/models";
import { getTaskDocRef, updateTask } from "@/repositories/task";

import { Checked, Cross, Dragger, Unchecked } from "./Icons";

type Props = {
  todos: Todo[];
  taskId: string;
  boardId: string;
  userId: string;
};

export const Checklist = ({ todos, taskId, boardId, userId }: Props) => {
  const [todoList, setList] = useState<Todo[]>(todos);
  const newTaskRef = useRef<HTMLInputElement>(null);
  const taskSchema = todoSchema.shape.task;

  const handleAddSubTask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value !== "") {
      const uid = uuidv4();
      const newTask = taskSchema.parse(e.currentTarget.value);
      setList([...todoList, { id: uid, task: newTask, done: false }]);
      const taskDocRef = getTaskDocRef({ userId, boardId, taskId });
      await updateTask(taskDocRef, {
        todos: typedArrayUnion<Todo>({ id: uid, task: newTask, done: false }),
      });
      if (newTaskRef.current) newTaskRef.current.value = "";
    }
  };

  const handleCheckMark = async (todo: Todo) => {
    const toBeChanged = todoList.filter((t) => t.task === todo.task)[0];
    const rest = todoList.filter((t) => t.task !== todo.task);
    toBeChanged.done = !toBeChanged.done;
    const taskDocRef = getTaskDocRef({ userId, boardId, taskId });
    await updateTask(taskDocRef, { todos: [...rest, toBeChanged] });
  };

  const handleDeleteSubTask = async (taskName: string) => {
    const filtered = todoList.filter((t) => t.task !== taskName);
    setList(filtered);
    const taskDocRef = getTaskDocRef({ userId, boardId, taskId });
    await updateTask(taskDocRef, { todos: filtered });
  };

  const handleEndOfDrag = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    const toBeMoved = todoList[source.index];
    const newOrder = [...todoList];
    newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, toBeMoved);
    setList(newOrder);
    const taskDocRef = getTaskDocRef({ userId, boardId, taskId });
    await updateTask(taskDocRef, { todos: newOrder });
  };

  return (
    <div className="">
      <DragDropContext onDragEnd={handleEndOfDrag}>
        <Droppable droppableId={"Checklist"}>
          {(provided, _snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {todoList.map((t, i) => (
                <Draggable draggableId={t.task} index={i} key={t.id}>
                  {(provided, _snapshot) => (
                    <div
                      className="flex justify-between items-center pr-6 mt-3 w-full"
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <div className="flex w-2/3">
                        <button className="mr-1" onClick={() => handleCheckMark(t)}>
                          {t.done ? <Checked /> : <Unchecked />}
                        </button>
                        <h4 className={`ml-2 ${t.done ? "line-through text-gray-400" : ""}`}>{t.task}</h4>
                      </div>
                      <button
                        className="text-red-400 hover:text-red-700 cursor-pointer"
                        onClick={() => handleDeleteSubTask(t.task)}
                      >
                        <Cross />
                      </button>
                      <div {...provided.dragHandleProps} className="text-gray-600">
                        <Dragger />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <input
        name="task"
        ref={newTaskRef}
        type="text"
        placeholder="サブタスクを入力してください"
        onKeyPress={handleAddSubTask}
        className="my-3 w-full border-b border-gray-300 outline-none"
      />
    </div>
  );
};
