import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupplierSchema } from "../../schemas/supplier.schema";
import ValidatedInput from "../../reusable/ValidatedInput";

export default function AdminSupplierTable({ enableMultiDel }) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

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
    data: suppliers = [],
    isPending: isSupplierPending,
    isError: isSupplierError,
  } = useQuery({
    queryKey: ["supplier"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/supplier/get-suppliers`);
      return res.data;
    },
  });

  const arraySuppliers = Array.isArray(suppliers) ? suppliers : [];

  const numSelected = selectedIds.length;
  const numProducts = arraySuppliers.length;

  // Checkbox is ticked only if all products are selected
  const allSelected = numProducts > 0 && numSelected === numProducts;

  // --- EDIT MUTATION ---
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

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

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

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(arraySuppliers.map((category) => category._id));
    }
  };

  const cancelMultiDel = () => {
    setSelectedIds([]);
  };

  const pushMultipleSup = (supplierId) => {
    setSelectedIds((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId],
    );
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

  const handleToggleNotification = (supplier) => {
    const newStatus = supplier.enableNotifications === false; // Toggle logic
    toggleNotificationMutation({
      supplierId: supplier._id,
      enableNotifications: newStatus,
    });
  };

  const filteredArraySuppliers = arraySuppliers.filter(
    (supplier) =>
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier._id.includes(searchTerm),
  );

  if (isSupplierError) {
    <p>loading....</p>;
  }
  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          Supplier Table
        </h1>
      </div>

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

      <div className="flex-col border-b-2 border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Suppliers
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Toy Kingdom..."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[600px] py-3">
        {isSupplierPending ? (
          <div className="p-4">
            <AdminTableSkeleton />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black relative">
              <tr>
                <th className="font-black uppercase text-[11px] tracking-widest text-black p-4 pb-2 text-left">
                  Supplier Name
                </th>
                <th className="font-black uppercase text-[11px] tracking-widest text-black p-4 pb-2 text-center">
                  Contact Person
                </th>
                <th className="font-black uppercase text-[11px] tracking-widest text-black p-4 pb-2 text-center">
                  Phone
                </th>
                <th className="font-black uppercase text-[11px] tracking-widest text-black p-4 pb-2 text-left">
                  Address
                </th>
                <th className="font-black uppercase text-[11px] tracking-widest text-black p-4 pb-2 text-center">
                  Notify
                </th>
                <th className="font-black uppercase text-[11px] tracking-widest text-black p-4 pb-2 text-center">
                  Products
                </th>
                <th className="font-black uppercase text-[11px] tracking-widest text-black p-4 pb-2 text-center">
                  Actions
                </th>
                {arraySuppliers.length > 0 && enableMultiDel && (
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
            <tbody className="divide-y divide-black text-[11px]">
              {filteredArraySuppliers.length > 0 ? (
                filteredArraySuppliers.map((supplier) => (
                  <tr
                    key={supplier._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-black uppercase tracking-tight text-black">
                          {supplier.supplierName}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">
                          ID: {supplier._id.slice(-6)}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center font-black text-gray-600">
                      {supplier.contactPerson}
                    </td>

                    <td className="p-4 text-center font-mono font-black text-gray-600">
                      {supplier.contactNumber}
                    </td>
                    <td className="p-4 font-black text-gray-600 max-w-[250px] truncate">
                      {supplier?.supplierAddress}
                    </td>
                    {/* TOGGLE NOTIFY COLUMN */}
                    <td className="p-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={supplier.enableNotifications !== false}
                          onChange={() => handleToggleNotification(supplier)}
                        />
                        <div className="w-9 h-5 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {supplier?.product ? supplier?.product.length : 0}
                      </span>
                    </td>

                    <td className="p-4 text-center">
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
                    </td>
                    {enableMultiDel && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(supplier._id)}
                          onChange={() => pushMultipleSup(supplier._id)}
                          className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center font-black uppercase text-gray-400 tracking-widest"
                  >
                    no suppliers found
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
    </div>
  );
}
