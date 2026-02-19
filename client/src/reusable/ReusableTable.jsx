import { IoSearch } from "react-icons/io5";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import AdminTableSkeleton from "../components/skeleton/AdminTableSkeleton";

export default function ReusableTable({
  title,
  subtitle,
  headerColor,
  columns,
  data,
  isLoading,
  search, // { value, onChange, placeholder }
  pagination, // { currentPage, totalPages, totalItems, onPageChange }
  selection, // { selectedIds, onSelect, onSelectAll }
  actions, // ReactNode for extra buttons/filters (right side of header)
  emptyMessage = "No data found",
}) {
  const {
    value: searchValue,
    onChange: onSearchChange,
    placeholder: searchPlaceholder = "Search...",
    maxLength: searchMaxLength = 100,
  } = search || {};

  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    onPageChange,
  } = pagination || {};

  const { selectedIds = [], onSelect, onSelectAll } = selection || {};
  const headerBgColor = headerColor || "bg-[#22c55e]";

  const allSelected =
    data &&
    data.length > 0 &&
    data.every((item) => selectedIds.includes(item._id));

  // Handle Search Input
  const handleSearchChange = (e) => {
    if (onSearchChange) onSearchChange(e.target.value);
  };

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Sticker Header */}
      {title && (
        <div
          className={`absolute -top-4 -left-3 ${headerBgColor} text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20`}
        >
          <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
            {title}
          </h1>
        </div>
      )}

      {/* Header / Controls */}
      <div className="flex-col border-b-2 border-black rounded-t-[5px] flex md:flex-row items-end justify-between p-4 pt-8 gap-4 bg-gray-50/50">
        {/* Subtitle / Left Content */}
        <div className="w-full md:w-auto">
          {title && !subtitle && (
            <h2 className="hidden md:block font-black uppercase text-gray-500 tracking-widest pl-1 text-[11px]">
              Manage your {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Content: Search & Actions */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Search */}
          {search && (
            <div className="flex items-center gap-1 flex-col md:flex-row w-full md:w-auto">
              <div className="flex items-center relative w-full md:w-auto">
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  maxLength={searchMaxLength}
                  className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-all font-bold uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] placeholder:text-gray-300"
                />
                <IoSearch className="absolute right-3" size={20} />
              </div>
            </div>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-y-auto min-h-[400px] py-3">
        {isLoading ? (
          <div className="p-4">
            <AdminTableSkeleton />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black relative">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 ${col.className || "text-center"}`}
                  >
                    {col.header}
                  </th>
                ))}

                {/* Selection Column Header */}
                {selection && data.length > 0 && (
                  <th className="p-4 pb-2 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onSelectAll}
                      className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                    />
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[13px]">
              {data && data.length > 0 ? (
                data.map((item, rowIndex) => (
                  <tr
                    key={item._id || rowIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`p-4 ${col.className || "text-center"}`}
                      >
                        {col.render ? col.render(item) : item[col.accessor]}
                      </td>
                    ))}

                    {/* Selection Checkbox */}
                    {selection && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => onSelect(item._id)}
                          className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (selection ? 1 : 0)}
                    className="p-8 text-center text-[16px] uppercase text-gray-400 tracking-widest"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between p-4 border-t border-black bg-white rounded-b-[5px]">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Showing {data ? data.length : 0} of {totalItems} items
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
              disabled={
                currentPage === totalPages || totalPages === 0 || isLoading
              }
              className="p-1 border border-black rounded-[3px] hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
