import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

import { useModalState } from "@/hooks/useModalState";
import type { Board } from "@/models";
import { createBoard, deleteBoard, getBoardDocRef } from "@/repositories/board";
import { createColumn, getColumnDocRef } from "@/repositories/column";

import { Bin, Exclaim } from "./Icons";
import { Modal } from "./Modal";

const schema = z.object({
  boardName: z.string().nonempty(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  boards: Board[];
  logOut: () => void;
  userId: string;
  name: string;
};

export const BoardList = ({ logOut: handleLogOut, boards, name, userId }: Props) => {
  const { isModalOpen, openModal, closeModal } = useModalState();
  const [idToBeDeleted, setId] = useState<string | undefined>(undefined);
  const { register, handleSubmit, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleRemoveBoard = async (id?: string) => {
    if (!id) return;
    closeModal();
    const boardDocRef = getBoardDocRef({ userId, boardId: id });
    await deleteBoard(boardDocRef);
  };

  const handleOpenDeleteModal = (id?: string) => {
    if (!id) return;
    setId(id);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
  };

  const handleAddNewBoard: SubmitHandler<FormValues> = async (data) => {
    const uid = uuidv4();
    const { boardName } = data;

    const boardDocRef = getBoardDocRef({ userId, boardId: uid });
    await createBoard(boardDocRef, { id: uid, name: boardName });

    const columnOrder = { id: "columnOrder", order: [] };

    const columnOrderDocRef = getColumnDocRef({ userId, boardId: uid, columnId: "columnOrder" });
    await createColumn(columnOrderDocRef, columnOrder);

    reset();
  };

  if (navigator.onLine !== true) {
    return (
      <div className="p-12">
        <div className="my-12">
          <h1 className="text-xl text-red-800">
            ネットワーク接続が切断されました。接続を確認のうえ、再度お試しください。
          </h1>
        </div>
      </div>
    );
  } else
    return (
      <div className="py-4 px-6 h-screen bg-gradient-to-br from-white via-indigo-100 to-primary sm:py-20 sm:px-24">
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} ariaText="Board Delete confirmation">
          <div className="md:px-12 ">
            <div className="mb-2 text-yellow-600">
              <Exclaim />
            </div>
            <h2 className="mb-2 text-base text-gray-900 md:text-3xl">このボードを本当に削除しますか?</h2>
            <h3 className="text-sm text-red-600 md:text-lg">
              すべてのデータが永続的に削除され、この操作は取り消せません。
            </h3>
            <div className="flex my-8">
              <button
                className="py-1 px-2 mr-4 text-sm text-red-600 rounded-sm border border-red-700 md:text-base"
                onClick={() => handleRemoveBoard(idToBeDeleted)}
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
        <div className="flex flex-col my-2">
          <div className="flex justify-between">
            <h1 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-primary sm:text-3xl">
              ようこそ、 {name ? name.split(" ")[0] : "名無しさん"}
            </h1>
            <button
              className="py-1 px-2 text-sm text-red-800 hover:text-white hover:bg-red-700 rounded-sm border border-red-800 sm:text-base"
              onClick={handleLogOut}
            >
              ログアウト
            </button>
          </div>
          <div className="my-12">
            <h1 className="text-xl text-blue-900">ボード</h1>
            <div className="flex flex-wrap mt-2">
              {boards.map((b) => (
                <div
                  className="py-4 px-6 mr-4 mb-3 w-full text-gray-700 bg-white rounded-sm shadow-md sm:w-auto"
                  key={b.id}
                >
                  <div className="flex justify-between items-center">
                    <Link to={`/board/${b.id}`}>
                      <h2 className="text-lg text-gray-700 hover:text-gray-900 sm:text-2xl">{b.name}</h2>
                    </Link>
                    <button
                      onClick={() => handleOpenDeleteModal(b.id)}
                      className="ml-6 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Bin />
                    </button>
                  </div>
                </div>
              ))}
              {boards.length === 0 ? (
                <h1 className="text-gray-700">ボードがひとつもありませんね。作ってみましょう。</h1>
              ) : null}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(handleAddNewBoard)} autoComplete="off" className="my-4 sm:my-8">
          <label htmlFor="boardName" className="block text-xl text-blue-900">
            新しいボードを作成する
          </label>
          <div className="flex items-center mt-2">
            <input
              {...register("boardName")}
              type="text"
              className="py-1 px-2  w-64 placeholder:text-gray-700 bg-transparent rounded-sm border border-gray-500"
              placeholder="ボード名を入力してください"
            />
            <button type="submit" className="py-1.5 px-2 text-green-50  bg-green-600 hover:bg-green-900 rounded-sm">
              追加する
            </button>
          </div>
        </form>
      </div>
    );
};
