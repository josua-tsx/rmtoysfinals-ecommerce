import { IoIosClose } from "react-icons/io";
import { FaCheck, FaTimes } from "react-icons/fa";
import Buttons from "./Buttons";

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  isSubmitting,
  onSubmit,
  submitLabel = "Submit",
}) {
  if (!isOpen) return null;

  const content = (
    <>
      <div className="absolute -top-5 -left-4 bg-primary text-white border border-black px-6 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] font-black uppercase tracking-widest text-xs transform -rotate-1 z-20">
        {title}
      </div>
      <button
        onClick={onClose}
        type="button"
        disabled={isSubmitting}
        className="absolute -top-3 -right-3 bg-red-600 text-white border border-black size-8 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all z-30 group"
      >
        <IoIosClose
          size={24}
          className="group-hover:rotate-90 transition-transform"
        />
      </button>

      <div className="flex flex-col gap-6">
        {children}

        {onSubmit && (
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <Buttons
              buttonType="submit"
              buttonName={submitLabel}
              isLoading={isSubmitting}
              icon={<FaCheck size={18} />}
              animateIcon={true}
              className="flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
            <Buttons
              buttonName="Cancel"
              onClick={onClose}
              icon={<FaTimes size={18} />}
              animateIcon={true}
              className="bg-red-600 !text-white md:w-[30%] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              disabled={isSubmitting}
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md p-3 flex items-center justify-center font-main overflow-y-auto bg-black/50">
      <div className="bg-white border border-black rounded-lg w-full md:w-[500px] relative  mt-10 animate-in zoom-in duration-200 p-6 pt-10">
        {onSubmit ? <form onSubmit={onSubmit}>{content}</form> : content}
      </div>
    </div>
  );
}
