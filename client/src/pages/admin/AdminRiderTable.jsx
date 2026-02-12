import { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addRiderSchema } from "../../schemas/rider.schema";
import ValidatedInput from "../../reusable/ValidatedInput";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminRiderTable({ enableMultiDel }) {
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const [selectedId, setSelectedId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);

  // Edit Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addRiderSchema),
    defaultValues: {
      riderName: "",
      riderPhoneNumber: "",
    },
  });

  const { data, isPending, isError } = useQuery({
    queryKey: ["riders", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/rider/get-all-rider?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const riders = data?.riders || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  // --- MUTATIONS ---
  const { mutate: updateRiderMutation, isPending: isEditPending } = useMutation(
    {
      mutationFn: async (data) => {
        const res = await axiosInstance.put(
          `/rider/edit-rider/${selectedRider._id}`,
          data,
        );
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["riders"] });
        setIsOpenEditModal(false);
        setSelectedRider(null);
        reset();
        toast.success("Rider updated succesfully!");
      },
      onError: (err) => {
        toast.error(err.response.data.message);
      },
    },
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

  // Selection Logic for ReusableTable
  const handleSelect = (riderId) => {
    setSelectedIds((prev) =>
      prev.includes(riderId)
        ? prev.filter((id) => id !== riderId)
        : [...prev, riderId],
    );
  };

  const handleSelectAll = () => {
    const allOnPageSelected =
      riders.length > 0 && riders.every((r) => selectedIds.includes(r._id));

    if (allOnPageSelected) {
      // Unselect all on current page
      const newSelected = selectedIds.filter(
        (id) => !riders.map((r) => r._id).includes(id),
      );
      setSelectedIds(newSelected);
    } else {
      // Select all on current page
      const currentIds = riders.map((r) => r._id);
      const uniqueIds = [...new Set([...selectedIds, ...currentIds])];
      setSelectedIds(uniqueIds);
    }
  };

  const handleCancelMultiDel = () => {
    setSelectedIds([]);
  };

  const handleDeleteMulti = () => {
    if (selectedIds?.length === 0) {
      return toast.error("Please select at least one rider.");
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} riders?`,
      )
    ) {
      DeleteMultiRiders(selectedIds);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedId(id);
    setOpenModal(true);
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
    reset({
      riderName: rider.riderName,
      riderPhoneNumber: rider.riderPhoneNumber,
    });
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (data) => {
    updateRiderMutation(data);
  };

  if (isError) return <p>Error loading riders</p>;

  // Column Definitions
  const columns = [
    {
      header: "Rider Name",
      className: "uppercase tracking-tight text-black text-left",
      accessor: "riderName",
    },
    {
      header: "Phone Number",
      className: "font-mono font-bold text-gray-600",
      accessor: "riderPhoneNumber",
    },
    {
      header: "Status",
      render: (rider) => (
        <span
          className={`px-2 py-0.5 border border-black rounded-[3px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase ${
            rider.riderStatus === "available"
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {rider.riderStatus}
        </span>
      ),
    },
    {
      header: "Successful Delivery",
      className: "text-indigo-600",
      accessor: "successDelivered",
    },
    {
      header: "Actions",
      render: (rider) => (
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
      ),
    },
  ];

  return (
    <>
      <ConfirmModal
        isOpen={openModal}
        title={"Confirm delete"}
        message={
          "Are you sure you want to delete this rider? This action can not be undone."
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Edit Rider Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Edit Rider"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleSubmit(handleEditSubmit)}
        submitLabel="Update Rider"
        isSubmitting={isEditPending || isSubmitting}
      >
        <div className="flex gap-2 p-2 flex-col w-full">
          <div className="flex flex-col gap-2 w-full justify-between">
            <label
              htmlFor="editRiderName"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Rider Full Name:{" "}
            </label>
            <ValidatedInput
              type="text"
              id="editRiderName"
              placeholder="Ex: Brendon Mae"
              {...register("riderName")}
              error={errors.riderName}
            />
          </div>
          <div className="flex flex-col gap-2 w-full justify-between">
            <label
              htmlFor="editRiderPhoneNumber"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Rider Phone Number:{" "}
            </label>
            <ValidatedInput
              type="text"
              id="editRiderPhoneNumber"
              placeholder="Ex: 09*******83"
              {...register("riderPhoneNumber")}
              error={errors.riderPhoneNumber}
            />
          </div>
        </div>
      </FormModal>

      <ReusableTable
        title="Rider Table"
        columns={columns}
        data={riders}
        isLoading={isPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "search rider...",
        }}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: totalItems,
          onPageChange: setPage,
        }}
        selection={
          enableMultiDel
            ? {
                selectedIds,
                onSelect: handleSelect,
                onSelectAll: handleSelectAll,
              }
            : undefined
        }
        emptyMessage="no riders found"
      />

      {selectedIds && selectedIds.length > 0 && (
        <div className="w-full flex gap-3 justify-end p-4 border border-t-0 border-black bg-gray-50 rounded-b-[5px] mt-[-6px] relative z-10">
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
    </>
  );
}
