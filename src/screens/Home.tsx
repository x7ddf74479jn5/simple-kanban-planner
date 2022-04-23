import { BrowserRouter, Route, Routes } from "react-router-dom";

import { BoardList } from "@/components/BoardList";
import { useBoards } from "@/hooks/useBoards";

import { Kanban } from "./Kanban";

type Props = {
  logOut: () => void;
  userId: string;
  name: string;
};

export const Home = (props: Props) => {
  const boards = useBoards(props.userId);

  return boards !== null ? (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BoardList boards={boards} {...props} />} />
        <Route path="/board/:boardId" element={<Kanban userId={props.userId} />} />
      </Routes>
    </BrowserRouter>
  ) : (
    <div className="w-screen h-screen spinner" />
  );
};
