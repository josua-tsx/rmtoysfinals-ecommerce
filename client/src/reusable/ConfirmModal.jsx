export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null; // Do not render if modal is not open

  return (
    <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-sm px-5 z-50">
      <div className="bg-card border flex flex-col justify-between border-black h-[210px] p-5 rounded-[5px] w-[400px]">
        <div className="flex flex-col gap-5">
          <h2 className="text-lg">{title}</h2>
          <p className="">{message}</p>
        </div>
        <div className="flex justify-end gap-2 w-[200px] ml-auto">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 border border-black text-white flex-1 rounded hover:bg-red-600"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="border border-black bg-red-500 flex-1 text-card rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

import PropTypes from "prop-types";

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
