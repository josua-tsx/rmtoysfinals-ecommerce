import { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminRiderTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderName, setRiderName] = useState("");
  const [riderPhoneNum, setRiderPhoneNum] = useState("");

  const {
    data: getRiders = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["riders"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/rider/get-all-rider`);
      return res.data;
    },
  });

  const arrayRiders = Array.isArray(getRiders) ? getRiders : [];

  const numSelected = selectedIds?.length;
  const numProducts = arrayRiders?.length;

  // Checkbox is ticked only if all products are selected
  const allSelected = numProducts > 0 && numSelected === numProducts;

  // --- EDIT MUTATION ---
  const { mutate: updateRiderMutation, isPending: isEditPending } = useMutation(
    {
      mutationFn: async (data) => {
        const res = await axiosInstance.put(
          `/rider/edit-rider/${selectedRider._id}`,
          data
        );
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["riders"] });
        setIsOpenEditModal(false);
        setSelectedRider(null);
        toast.success("Rider updated succesfully!");
      },
      onError: (err) => {
        toast.error(err.response.data.message);
      },
    }
  );

  const filteredArrayRiders = arrayRiders.filter(
    (rider) =>
      rider?.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider?.riderStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { mutate: deleteRiderMutation } = useMutation({
    mutationFn: async (riderId) => {
      const res = await axiosInstance.delete(`/rider/delete-rider/${riderId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Rider succesfully deleted");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const { mutate: DeleteMultiRiders } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/rider/delete-multi-rider`, {
        riderIds: data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Riders are deleted succesfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

  const handlePushIds = (riderId) => {
    setSelectedIds((prev) =>
      prev.includes(riderId)
        ? prev.filter((id) => id !== riderId)
        : [...prev, riderId]
    );
  };

  const handleDeleteMulti = () => {
    if (selectedIds?.length === 0) {
      return toast.error("Please select at least one rider.");
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} riders?`
      )
    ) {
      DeleteMultiRiders(selectedIds);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedId(id);
    setOpenModal(true);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(arrayRiders.map((category) => category._id));
    }
  };

  const handleCancelMultiDel = () => {
    setSelectedIds([]);
  };

  const handleConfirmDelete = () => {
    deleteRiderMutation(selectedId);
    handleCancelDelete();
  };

  const handleCancelDelete = () => {
    setSelectedId(null);
    setOpenModal(false);
  };

  // --- EDIT HANDLERS ---
  const handleOpenEditModal = (rider) => {
    setSelectedRider(rider);
    setRiderName(rider.riderName);
    setRiderPhoneNum(rider.riderPhoneNumber);
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateRiderMutation({ riderName, riderPhoneNumber: riderPhoneNum });
  };

  if (isError) return <p>Error...</p>;

  return (
    <div className="font-main border rounded-[5px] text-sm md:text-normal border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          Rider Table
        </h1>
      </div>

      <ConfirmModal
        isOpen={openModal}
        title={"Confirm delete"}
        message={
          "Are you sure you want to delete this worker? This action can not be undone."
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Edit Rider Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Edit Rider"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleEditSubmit}
        submitLabel="Update Rider"
        isSubmitting={isEditPending}
      >
        <div className="flex gap-2 p-2 flex-col w-full">
          <div className="flex flex-col gap-2 w-full justify-between">
            <label
              htmlFor="editRiderName"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Rider Full Name:{" "}
            </label>
            <input
              type="text"
              id="editRiderName"
              placeholder="Ex: Brendon Mae"
              value={riderName}
              onChange={handleInputChange(setRiderName)}
              className="border border-black w-full rounded-[5px] p-2 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
          </div>
          <div className="flex flex-col gap-2 w-full justify-between">
            <label
              htmlFor="editRiderPhoneNum"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Rider Phone Number:{" "}
            </label>
            <input
              type="text"
              id="editRiderPhoneNum"
              value={riderPhoneNum}
              onChange={(e) => setRiderPhoneNum(e.target.value)}
              placeholder="Ex: 09*******83"
              className="border border-black w-full rounded-[5px] p-2 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
          </div>
        </div>
      </FormModal>

      <div className="flex-col border-b-2 border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Riders
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search rider.."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>
      <div className="overflow-y-auto h-[600px] py-3">
        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black relative">
              <tr>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Rider Name
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Phone Number
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Status
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Successful Delivery
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Actions
                </th>
                {arrayRiders?.length > 0 && enableMultiDel && (
                  <th className="p-4 pb-2 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                    />
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredArrayRiders?.length > 0 ? (
                filteredArrayRiders?.map((rider) => (
                  <tr
                    key={rider._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap uppercase tracking-tight text-black">
                      {rider.riderName}
                    </td>

                    <td className="p-4 text-center font-mono font-bold text-gray-600">
                      {rider.riderPhoneNumber}
                    </td>

                    <td className="p-4 text-center uppercase">
                      <span
                        className={`px-2 py-0.5 border border-black rounded-[3px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          rider.riderStatus === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rider.riderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center text-indigo-600">
                      {rider.successDelivered}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(rider)}
                          title="Edit"
                          className="p-2 border border-black bg-yellow-400 text-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <CiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(rider._id)}
                          title="Delete"
                          className="p-2 border border-black bg-red-500 text-white rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                    {enableMultiDel && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(rider._id)}
                          onChange={() => handlePushIds(rider._id)}
                          className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center font-black uppercase text-gray-400 tracking-widest"
                  >
                    no riders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedIds && selectedIds.length > 0 && (
        <div className="w-full flex gap-3 justify-end p-4 border-t border-black bg-gray-50">
          <button
            onClick={handleCancelMultiDel}
            className="px-6 py-2 border border-black bg-white font-black uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteMulti()}
            className="px-6 py-2 border border-black bg-red-600 text-white font-black uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}
    </div>
  );
}
