import type { Todo } from "@/models";

import { CheckedOutline } from "./Icons";

type Props = {
  todos: Todo[];
};

export const ChecklistProgress = ({ todos }: Props) => {
  const tasksCompleted = todos.filter((todo) => todo.done === true);

  return (
    <div className="flex justify-between items-center text-xs sm:text-sm">
      <div className="flex py-0.5 px-1 mr-1 text-blue-900 bg-blue-100 rounded-3xl sm:px-1.5">
        <CheckedOutline />
        <h4 className="tracking-wider">{`${tasksCompleted.length}/${todos.length}`}</h4>
      </div>
      <progress className="w-12 shadow-2xl sm:w-20" value={tasksCompleted.length} max={todos.length}></progress>
    </div>
  );
};
