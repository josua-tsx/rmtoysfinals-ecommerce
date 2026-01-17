import { createPortal } from "react-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import Buttons from "./Buttons";

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-md px-5 z-[100] overflow-y-auto">
      <div className="bg-card border border-black p-8 rounded-[5px] w-full md:w-[450px] relative ">
        <div className="absolute -top-6 -left-4 bg-[#22c55e] border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs transform -rotate-1">
          {title}
        </div>

        <div className="flex flex-col gap-6 mt-4">
          <p className="text-gray-700 leading-relaxed font-main-text">
            {message}
          </p>
        </div>

        <div className="flex flex-col md:flex-row-reverse gap-4 mt-8">
          <Buttons
            buttonName="Confirm Action"
            onClick={onConfirm}
            icon={<FaCheck size={18} />}
            animateIcon={true}
            className="flex-1 bg-[#22c55e] !text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <Buttons
            buttonName="Cancel"
            onClick={onCancel}
            icon={<FaTimes size={18} />}
            animateIcon={true}
            className="md:w-[35%] bg-red-600 !text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
