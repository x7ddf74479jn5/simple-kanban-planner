import { Dialog } from "@reach/dialog";

import { Cross } from "./Icons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaText: string;
};

export const Modal = ({ isOpen: isModalOpen, onClose: handleCloseModal, children, ariaText }: Props) => {
  return (
    <Dialog isOpen={isModalOpen} onDismiss={handleCloseModal} aria-label={ariaText} className="z-20 fade-in">
      <div className="flex justify-end">
        <button onClick={handleCloseModal}>
          <div className="p-1.5 text-red-900 hover:bg-red-200 rounded-full">
            <Cross />
          </div>
        </button>
      </div>
      {children}
    </Dialog>
  );
};
