import { IoIosClose } from "react-icons/io";

export default function FormModal({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isSubmitting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm p-3 flex items-center justify-center">
      <div className="bg-card border border-black rounded-[5px] w-full md:w-[500px] relative">
        <div className="absolute -top-10 bg-primary border border-black left-0 rounded-[5px] text-card px-5 py-1">
          <h1>{title}</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute border border-black text-card bg-red-700 rounded-[5px] px-5 right-0 -top-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <IoIosClose size={25} />
        </button>

        <form onSubmit={onSubmit} className="p-4">
          {children}

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 border border-black bg-primary text-card rounded-[5px] uppercase p-2 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {isSubmitting ? `${submitLabel}...` : submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 px-4 border border-black rounded-[5px] text-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import PropTypes from "prop-types";

FormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  isSubmitting: PropTypes.bool,
};
