import { Draggable } from "react-beautiful-dnd";

import type { Kanban } from "@/hooks/useKanbanData";
import { useModalState } from "@/hooks/useModalState";
import type { DefaultColumn, Priority } from "@/models";
import { TaskDetails } from "@/screens/TaskDetails";
import { extractPriority } from "@/utils";

import { ChecklistProgress } from "./ChecklistProgress";
import { Description } from "./Icons";
import { Modal } from "./Modal";

type Props = {
  allData: Kanban;
  id: string;
  index: number;
  boardId: string;
  userId: string;
  columnDetails: DefaultColumn;
  filterBy: Priority | "all" | null;
};

export const Task = ({ allData, id, index, boardId, userId, columnDetails, filterBy }: Props) => {
  const { isModalOpen, openModal: handleOpenModal, closeModal: handleCloseModal } = useModalState();
  const theTask = allData.tasks[id];
  const isMatched = filterBy === null ? false : filterBy === "all" ? true : theTask.priority === filterBy;

  return (
    <div className={`${isMatched ? "" : "opacity-10"}`}>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} ariaText="Task Details">
        <TaskDetails
          taskDetails={theTask}
          boardId={boardId}
          onClose={handleCloseModal}
          userId={userId}
          columnDetails={columnDetails}
        />
      </Modal>

      <Draggable draggableId={id} index={index}>
        {(provided, snapshot) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
          <div
            onClick={handleOpenModal}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className={`shadow-lg w-full transition-shadow duration-300 hover:shadow-xl mb-4 rounded px-1.5 py-2.5 ${
              snapshot.isDragging ? "bg-gradient-to-r from-red-100 to-blue-100 text-gray-900" : "bg-white text-gray-800"
            }`}
          >
            <div className="w-full">
              <h4 className="text-sm  text-left sm:text-base">{theTask.title}</h4>
              <div className="flex mt-2 space-x-3 sm:space-x-5">
                {extractPriority(theTask.priority)}
                {theTask?.todos?.length >= 1 && <ChecklistProgress todos={theTask.todos} />}
                {theTask.description !== null && theTask.description && theTask.description?.length > 1 ? (
                  <Description />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    </div>
  );
};
