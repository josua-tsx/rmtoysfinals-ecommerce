import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupplierSchema } from "../../schemas/supplier.schema";
import ValidatedInput from "../../reusable/ValidatedInput";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminSupplierTable({ enableMultiDel }) {
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // Edit Form Setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      supplierName: "",
      contactPerson: "",
      contactNumber: "",
      supplierAddress: "",
      enableNotifications: true,
    },
  });

  const enableNotifications = watch("enableNotifications");

  const {
    data,
    isPending: isSupplierPending,
    isError: isSupplierError,
  } = useQuery({
    queryKey: ["supplier", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/supplier/get-suppliers?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const suppliers = data?.suppliers || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  // --- MUTATIONS ---
  const { mutate: editSupplierMutation, isPending: isEditPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await axiosInstance.put(
          `/supplier/edit-supplier/${selectedSupplier._id}`,
          data,
        );
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supplier"] });
        toast.success("Successfully Updated!");
        setIsOpenEditModal(false);
        setSelectedSupplier(null);
        reset();
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong");
      },
    });

  const { mutate: deleteSupplierMutation } = useMutation({
    mutationFn: async (supplierId) => {
      const res = await axiosInstance.delete(
        `/supplier/delete-supplier/${supplierId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
      toast.success("Supplier Successfully Deleted");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const { mutate: deleteMultiSupplier } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/supplier/delete-multi-sup`, {
        supplierIds: data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
      toast.success("Suppliers are deleted succesfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const { mutate: toggleNotificationMutation } = useMutation({
    mutationFn: async ({ supplierId, enableNotifications }) => {
      const res = await axiosInstance.patch(
        `/supplier/toggle-notification/${supplierId}`,
        { enableNotifications },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
      toast.success("Notification setting updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update setting");
    },
  });

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

  // Selection Logic for ReusableTable
  const handleSelect = (supplierId) => {
    setSelectedIds((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId],
    );
  };

  const handleSelectAll = () => {
    const allOnPageSelected =
      suppliers.length > 0 &&
      suppliers.every((s) => selectedIds.includes(s._id));

    if (allOnPageSelected) {
      // Unselect all on current page
      const newSelected = selectedIds.filter(
        (id) => !suppliers.map((s) => s._id).includes(id),
      );
      setSelectedIds(newSelected);
    } else {
      // Select all on current page
      const currentIds = suppliers.map((s) => s._id);
      const uniqueIds = [...new Set([...selectedIds, ...currentIds])];
      setSelectedIds(uniqueIds);
    }
  };

  const cancelMultiDel = () => {
    setSelectedIds([]);
  };

  const handleMultiDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one supplier");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} suppliers?`,
      )
    ) {
      deleteMultiSupplier(selectedIds);
    }
  };

  const handleClickDelete = (supplierId) => {
    setSelectedId(supplierId);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (selectedId) {
      deleteSupplierMutation(selectedId);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedId(null);
    setIsModalOpen(false);
  };

  // --- EDIT HANDLERS ---
  const handleOpenEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    reset({
      supplierName: supplier.supplierName,
      contactPerson: supplier.contactPerson,
      contactNumber: supplier.contactNumber,
      supplierAddress: supplier.supplierAddress,
      enableNotifications: supplier.enableNotifications !== false,
    });
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (data) => {
    editSupplierMutation(data);
  };

  const handleToggleNotification = (supplier) => {
    const newStatus = supplier.enableNotifications === false; // Toggle logic
    toggleNotificationMutation({
      supplierId: supplier._id,
      enableNotifications: newStatus,
    });
  };

  if (isSupplierError) {
    return <p>Error loading suppliers</p>;
  }

  // Column Definitions
  const columns = [
    {
      header: "Supplier Name",
      className: "text-left",
      render: (supplier) => (
        <div className="flex flex-col">
          <span className="font-black uppercase tracking-tight text-black">
            {supplier.supplierName}
          </span>
          <span className="text-[9px] font-mono text-gray-400">
            ID: {supplier._id.slice(-6)}
          </span>
        </div>
      ),
    },
    {
      header: "Contact Person",
      className: "font-black text-gray-600",
      accessor: "contactPerson",
    },
    {
      header: "Phone",
      className: "font-mono font-black text-gray-600",
      accessor: "contactNumber",
    },
    {
      header: "Address",
      className: "font-black text-gray-600",
      render: (supplier) => (
        <span className="max-w-[250px] truncate block">
          {supplier?.supplierAddress}
        </span>
      ),
    },
    {
      header: "Notify",
      render: (supplier) => (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={supplier.enableNotifications !== false}
            onChange={() => handleToggleNotification(supplier)}
          />
          <div className="w-9 h-5 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      ),
    },
    {
      header: "Products",
      render: (supplier) => (
        <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {supplier?.product ? supplier?.product.length : 0}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (supplier) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenEditModal(supplier)}
            title="Edit"
            className="p-2 border border-black bg-yellow-400 text-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <CiEdit size={18} />
          </button>
          <button
            onClick={() => handleClickDelete(supplier._id)}
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
        isOpen={isModalOpen}
        title={"Confirm delete"}
        message={
          "Are you sure you want to delete this supplier? This action cannot be undone."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Edit Supplier Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Edit Supplier"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleSubmit(handleEditSubmit)}
        submitLabel="UPDATE SUPPLIER"
        isSubmitting={isEditPending || isSubmitting}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="editSupplierName"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Supplier Name
            </label>
            <ValidatedInput
              id="editSupplierName"
              {...register("supplierName")}
              error={errors.supplierName}
              placeholder="Ex: Toy Kingdom"
              required
              maxLength={50}
            />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              (3-50 chars, no double spaces or numbers)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editContactPerson"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Contact Person Full Name
            </label>
            <ValidatedInput
              id="editContactPerson"
              {...register("contactPerson")}
              error={errors.contactPerson}
              placeholder="Ex: Juan Dela Cruz"
              required
              maxLength={100}
            />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              (No double spaces allowed)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editContactNumber"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Contact Number
            </label>
            <ValidatedInput
              type="tel"
              id="editContactNumber"
              {...register("contactNumber")}
              error={errors.contactNumber}
              placeholder="Ex: 09123456789"
              required
              maxLength={11}
            />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              (Starts with 09, exactly 11 digits)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editSupplierAddress"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Supplier Address
            </label>
            <ValidatedInput
              type="textarea"
              id="editSupplierAddress"
              {...register("supplierAddress")}
              error={errors.supplierAddress}
              placeholder="Ex: 123 Toy St., Manila City"
              className="h-[100px]"
              required
              maxLength={200}
            />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              (5-200 chars, no double spaces)
            </p>
          </div>

          {/* New Toggle for Edit Modal */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="editEnableNotifications"
              checked={enableNotifications}
              onChange={(e) =>
                setValue("enableNotifications", e.target.checked)
              }
              className="w-5 h-5 border border-black rounded-[3px] accent-green-500 cursor-pointer"
            />
            <label
              htmlFor="editEnableNotifications"
              className="font-black uppercase text-[11px] tracking-widest text-black cursor-pointer"
            >
              Enable Low Stock Notifications
            </label>
          </div>
        </div>
      </FormModal>

      <ReusableTable
        title="Supplier Table"
        columns={columns}
        data={suppliers}
        isLoading={isSupplierPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "Ex: Toy Kingdom...",
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
        emptyMessage="no suppliers found"
      />

      {selectedIds && selectedIds.length > 0 && (
        <div className="w-full flex gap-3 justify-end p-4 border border-t-0 border-black bg-gray-50 rounded-b-[5px] mt-[-6px] relative z-10">
          <button
            onClick={cancelMultiDel}
            className="px-6 py-2 border border-black bg-white font-black uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleMultiDelete()}
            className="px-6 py-2 border border-black bg-red-600 text-white font-black uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}
    </>
  );
}
