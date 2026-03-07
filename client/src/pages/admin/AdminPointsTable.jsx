import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pointsSchema } from "../../schemas/points.schema";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import ValidatedInput from "../../reusable/ValidatedInput";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminPointsTable() {
  const queryClient = useQueryClient();

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState(null);

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm({
    resolver: zodResolver(pointsSchema),
    defaultValues: { pointsValue: 0 },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm({
    resolver: zodResolver(pointsSchema),
    defaultValues: { pointsValue: 0 },
  });

  const {
    data: pointsTable = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["points"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/points/get-points`);
      return res.data;
    },
  });

  const { mutate: addPointsMutation, isPending: isAdding } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/points/add-points`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added Successfully!");
      queryClient.invalidateQueries({ queryKey: ["points"] });
      resetAdd();
      setIsOpenAddModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  const { mutate: updatePointsMutation, isPending: isUpdating } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/points/edit-points/${selectedPoints._id}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["points"] });
      setIsOpenEditModal(false);
      setSelectedPoints(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  const { mutate: deletePointsMutation } = useMutation({
    mutationFn: async (pointsId) => {
      const res = await axiosInstance.delete(
        `/points/delete-points/${pointsId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Deleted Points Option");
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  const handleOpenAddModal = () => {
    resetAdd({ pointsValue: 0 });
    setIsOpenAddModal(true);
  };

  const handleOpenEditModal = (pointsObj) => {
    setSelectedPoints(pointsObj);
    resetEdit({ pointsValue: pointsObj.pointsValue });
    setIsOpenEditModal(true);
  };

  const onAddSubmit = (data) => {
    addPointsMutation(data);
  };

  const onEditSubmit = (data) => {
    updatePointsMutation(data);
  };

  const handleClickDelete = (pointsId) => {
    setSelectedId(pointsId);
    setIsOpenDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deletePointsMutation(selectedId);
      setIsOpenDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setSelectedId(null);
    setIsOpenDeleteModal(false);
  };

  if (isError) return <p>Error loading points</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      <div className="absolute -top-4 -left-3 bg-[#4ade80] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          Points Options
        </h1>
      </div>

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

      <ConfirmModal
        isOpen={isOpenDeleteModal}
        title={"Confirm delete"}
        message={
          "Are you sure you want to delete this points option? This action cannot be undone."
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <FormModal
        isOpen={isOpenAddModal}
        title="Add Points Option"
        onClose={() => setIsOpenAddModal(false)}
        onSubmit={handleSubmitAdd(onAddSubmit)}
        submitLabel="ADD POINTS"
        isSubmitting={isAdding || isSubmittingAdd}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label
              htmlFor="add-pointsValue"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Points Value:
            </label>
            <ValidatedInput
              type="number"
              id="add-pointsValue"
              min="0"
              placeholder="Ex: 10"
              {...registerAdd("pointsValue")}
              error={errorsAdd.pointsValue}
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={isOpenEditModal}
        title="Edit Points Option"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleSubmitEdit(onEditSubmit)}
        submitLabel="UPDATE POINTS"
        isSubmitting={isUpdating || isSubmittingEdit}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label
              htmlFor="edit-pointsValue"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Points Value:
            </label>
            <ValidatedInput
              type="number"
              id="edit-pointsValue"
              min="0"
              placeholder="Ex: 10"
              {...registerEdit("pointsValue")}
              error={errorsEdit.pointsValue}
            />
          </div>
        </div>
      </FormModal>

      <div className="flex-col border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <button
          onClick={handleOpenAddModal}
          className="bg-[#22c55e] text-black font-black uppercase px-6 py-2 rounded-[5px] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          Add Points Option
        </button>
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
                  Points Value
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
              {pointsTable.length > 0 ? (
                pointsTable.map((pts) => (
                  <tr
                    key={pts._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap font-mono font-black uppercase text-black">
                      {pts?.pointsValue} Points
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {pts?.productId?.length || 0} Products
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(pts)}
                          className="border border-black p-1.5 rounded-[5px] bg-[#22c55e] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          title="Edit Points"
                        >
                          <CiEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleClickDelete(pts._id)}
                          className="border border-black p-1.5 rounded-[5px] bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          title="Delete Points"
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
                    colSpan="3"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No Points options configured. Click &quot;Add Points
                    Option&quot; to set up available points.
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
