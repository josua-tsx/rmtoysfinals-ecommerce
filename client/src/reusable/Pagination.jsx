import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
  currentItemsCount, // To display "Showing X of Y"
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-black bg-white rounded-[5px] mt-4">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
        Showing {currentItemsCount} of {totalItems} items
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-1 border border-black rounded-[3px] hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <MdChevronLeft size={20} />
        </button>

        <span className="mx-2 font-black text-xs">
          PAGE {currentPage} OF {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0 || isLoading}
          className="p-1 border border-black rounded-[3px] hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
