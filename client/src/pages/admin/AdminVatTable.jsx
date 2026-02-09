import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vatSchema } from "../../schemas/vat.schema";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import ValidatedInput from "../../reusable/ValidatedInput";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminVatTable() {
  const queryClient = useQueryClient();

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedVat, setSelectedVat] = useState(null);

  // React Hook Form Setup for Add Modal
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    watch: watchAdd,
    setValue: setValueAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm({
    resolver: zodResolver(vatSchema),
    defaultValues: {
      vatPercent: 0,
      vatValue: 0,
    },
  });

  // React Hook Form Setup for Edit Modal
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    watch: watchEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm({
    resolver: zodResolver(vatSchema),
    defaultValues: {
      vatPercent: 0,
      vatValue: 0,
    },
  });

  // Watch vatPercent for auto-calculation
  const addVatPercent = watchAdd("vatPercent");
  const editVatPercent = watchEdit("vatPercent");

  // Auto-calculate vatValue when vatPercent changes (Add Modal)
  useEffect(() => {
    const percent = parseFloat(addVatPercent) || 0;
    setValueAdd("vatValue", percent / 100);
  }, [addVatPercent, setValueAdd]);

  // Auto-calculate vatValue when vatPercent changes (Edit Modal)
  useEffect(() => {
    const percent = parseFloat(editVatPercent) || 0;
    setValueEdit("vatValue", percent / 100);
  }, [editVatPercent, setValueEdit]);

  const {
    data: vatTable = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/vat/get-vat`);
      return res.data;
    },
  });

  const { mutate: addVatMutation, isPending: isAdding } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/vat/add-vat`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added Successfully!");
      queryClient.invalidateQueries({ queryKey: ["vats"] });
      resetAdd();
      setIsOpenAddModal(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const { mutate: updateVatMutation, isPending: isUpdating } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/vat/edit-vat/${selectedVat._id}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["vats"] });
      setIsOpenEditModal(false);
      setSelectedVat(null);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const { mutate: deleteVatMutation } = useMutation({
    mutationFn: async (vatId) => {
      const res = await axiosInstance.delete(`/vat/delete-vat/${vatId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Deleted Vat");
      queryClient.invalidateQueries({ queryKey: ["vats"] });
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleOpenAddModal = () => {
    resetAdd({ vatPercent: 0, vatValue: 0 });
    setIsOpenAddModal(true);
  };

  const handleOpenEditModal = (vat) => {
    setSelectedVat(vat);
    resetEdit({
      vatPercent: vat.vatPercent,
      vatValue: vat.vatValue,
    });
    setIsOpenEditModal(true);
  };

  const onAddSubmit = (data) => {
    addVatMutation(data);
  };

  const onEditSubmit = (data) => {
    updateVatMutation(data);
  };

  const handleClickDelete = (vatId) => {
    setSelectedId(vatId);
    setIsOpenDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteVatMutation(selectedId);
      setIsOpenDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setSelectedId(null);
    setIsOpenDeleteModal(false);
  };

  if (isError) return <p>Error</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          VAT Table
        </h1>
      </div>

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        title={"Confirm delete"}
        message={
          "This data might be in use in different modules. Are you sure you want to delete this VAT? This action cannot be undone."
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Add VAT Modal */}
      <FormModal
        isOpen={isOpenAddModal}
        title="Add VAT Rate"
        onClose={() => setIsOpenAddModal(false)}
        onSubmit={handleSubmitAdd(onAddSubmit)}
        submitLabel="ADD VAT"
        isSubmitting={isAdding || isSubmittingAdd}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label
              htmlFor="vat"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              VAT %:
            </label>
            <ValidatedInput
              type="number"
              id="add-vatPercent"
              step={"any"}
              placeholder="Ex: 12"
              {...registerAdd("vatPercent")}
              error={errorsAdd.vatPercent}
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label
              htmlFor="vatValue"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              VAT VALUE:
            </label>
            <input
              type="number"
              value={watchAdd("vatValue")}
              disabled
              id="vatValue"
              className="border border-black rounded-[5px] p-3 bg-gray-100 font-bold"
            />
          </div>
        </div>
      </FormModal>

      {/* Edit VAT Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Edit VAT Rate"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleSubmitEdit(onEditSubmit)}
        submitLabel="UPDATE VAT"
        isSubmitting={isUpdating || isSubmittingEdit}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label
              htmlFor="edit-vat"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              VAT %:
            </label>
            <ValidatedInput
              type="number"
              id="edit-vatPercent"
              step={"any"}
              placeholder="Ex: 12"
              {...registerEdit("vatPercent")}
              error={errorsEdit.vatPercent}
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label
              htmlFor="edit-vatValue"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              VAT VALUE:
            </label>
            <input
              type="number"
              value={watchEdit("vatValue")}
              disabled
              id="edit-vatValue"
              className="border border-black rounded-[5px] p-3 bg-gray-100 font-bold"
            />
          </div>
        </div>
      </FormModal>

      <div className="flex-col border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        {/* Show Add button only if no VAT exists */}
        {vatTable.length === 0 && (
          <button
            onClick={handleOpenAddModal}
            className="bg-[#22c55e] text-black font-black uppercase px-6 py-2 rounded-[5px] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            Add VAT Rate
          </button>
        )}
      </div>
      <div className="overflow-y-auto h-full">
        {isLoading ? (
          <div className="p-4">
            <AdminTableSkeleton />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black sticky top-0 bg-[#fffdf6] z-10">
              <tr>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                  VAT Percent
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                  VAT Value
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                  Products in Use
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[13px]">
              {vatTable.length > 0 ? (
                vatTable.map((vat) => (
                  <tr
                    key={vat._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap font-mono font-black uppercase text-black">
                      {vat?.vatPercent}%
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono font-black uppercase text-black">
                      {(vat?.vatValue * 100).toFixed(2)}%
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {vat?.productId?.length || 0} Products
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(vat)}
                          className="border border-black p-1.5 rounded-[5px] bg-[#22c55e] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          title="Edit VAT"
                        >
                          <CiEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleClickDelete(vat._id)}
                          className="border border-black p-1.5 rounded-[5px] bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          title="Delete VAT"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No VAT configured. Click &quot;Add VAT Rate&quot; to set up
                    your VAT.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
