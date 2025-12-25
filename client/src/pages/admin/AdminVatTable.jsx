import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";

export default function AdminVatTable() {
  const queryClient = useQueryClient();

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedVat, setSelectedVat] = useState(null);

  // Form states
  const [vatPercent, setVatPercent] = useState(0);
  const [vatValue, setVatValue] = useState(0);

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

  const handleConvertedToPercent = (e) => {
    const input = parseFloat(e.target.value) || 0;
    setVatPercent(input);
    setVatValue(input / 100);
  };

  const { mutate: addVatMutation, isPending: isAdding } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/vat/add-vat`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added Successfully!");
      queryClient.invalidateQueries({ queryKey: ["vats"] });
      setVatPercent(0);
      setVatValue(0);
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
        data
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
    setVatPercent(0);
    setVatValue(0);
    setIsOpenAddModal(true);
  };

  const handleOpenEditModal = (vat) => {
    setSelectedVat(vat);
    setVatPercent(vat.vatPercent);
    setVatValue(vat.vatValue);
    setIsOpenEditModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addVatMutation({ vatPercent, vatValue });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateVatMutation({ vatPercent, vatValue });
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
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative ">
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
        onSubmit={handleAddSubmit}
        submitLabel="Add VAT"
        isSubmitting={isAdding}
      >
        <div className="flex gap-2 flex-col mb-4">
          <label htmlFor="vat">VAT %:</label>
          <input
            type="number"
            value={vatPercent}
            onChange={handleConvertedToPercent}
            step={"any"}
            id="vat"
            name="vat"
            min={0}
            className="border border-black w-full rounded-[5px] p-2 outline-none"
            required
          />
        </div>

        <div className="flex gap-2 flex-col mb-4">
          <label htmlFor="vatValue">VAT VALUE:</label>
          <input
            type="number"
            value={vatValue}
            disabled
            id="vatValue"
            name="vatValue"
            className="border border-black w-full rounded-[5px] p-2 bg-gray-100"
          />
        </div>
      </FormModal>

      {/* Edit VAT Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Edit VAT Rate"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleEditSubmit}
        submitLabel="Update VAT"
        isSubmitting={isUpdating}
      >
        <div className="flex gap-2 flex-col mb-4">
          <label htmlFor="edit-vat">VAT %:</label>
          <input
            type="number"
            value={vatPercent}
            onChange={handleConvertedToPercent}
            step={"any"}
            id="edit-vat"
            name="vat"
            min={0}
            className="border border-black w-full rounded-[5px] p-2 outline-none"
            required
          />
        </div>

        <div className="flex gap-2 flex-col mb-4">
          <label htmlFor="edit-vatValue">VAT VALUE:</label>
          <input
            type="number"
            value={vatValue}
            disabled
            id="edit-vatValue"
            name="vatValue"
            className="border border-black w-full rounded-[5px] p-2 bg-gray-100"
          />
        </div>
      </FormModal>

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>VAT TABLE</h1>

        {/* Show Add button only if no VAT exists */}
        {vatTable.length === 0 && (
          <button
            onClick={handleOpenAddModal}
            className="bg-primary text-white px-4 py-2 rounded-[5px] border border-black hover:bg-opacity-90"
          >
            Add VAT Rate
          </button>
        )}
      </div>
      <div className="overflow-y-auto h-full py-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr className="flex justify-between">
                <th className="font-normal p-2 pb-5">VAT Percent</th>
                <th className="font-normal p-2 pb-5">VAT Value</th>
                <th className="font-normal p-2 pb-5">Products in Use</th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {vatTable.length > 0 ? (
                vatTable.map((vat) => (
                  <tr
                    key={vat._id}
                    className="flex items-center justify-between"
                  >
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {vat?.vatPercent}%
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {vat?.vatValue}%
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {vat?.productId?.length}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() => handleOpenEditModal(vat)}
                        className="text-green-600 hover:text-indigo-300 mr-2"
                      >
                        <CiEdit size={25} />
                      </button>
                      <button
                        onClick={() => handleClickDelete(vat._id)}
                        className="text-red-600 hover:text-red-300"
                      >
                        <MdDelete size={25} />
                      </button>
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
