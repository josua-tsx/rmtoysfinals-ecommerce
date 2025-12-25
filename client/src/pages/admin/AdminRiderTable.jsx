import React, { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import { useEffect } from "react";
import FormModal from "../../reusable/FormModal";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminRiderTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(null);
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
      const res = await axiosInstance.get(`/rider/get-riders`);
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
    <div className="font-main border rounded-[5px] text-sm md:text-normal border-black bg-card relative ">
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
            <label htmlFor="editRiderName">Rider Full Name: </label>
            <input
              type="text"
              id="editRiderName"
              placeholder="Ex: Brendon Mae"
              value={riderName}
              onChange={handleInputChange(setRiderName)}
              className="border border-black p-1 outline-none  rounded-[5px]"
            />
          </div>
          <div className="flex flex-col gap-2 w-full justify-between">
            <label htmlFor="editRiderPhoneNum">Rider Phone Number: </label>
            <input
              type="number"
              id="editRiderPhoneNum"
              value={riderPhoneNum}
              onChange={(e) => setRiderPhoneNum(e.target.value)}
              placeholder="Ex: 09*******83"
              className="border border-black p-1  outline-none rounded-[5px]"
            />
          </div>
        </div>
      </FormModal>

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>RIDER TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search rider.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead className="relative">
              <tr className="">
                {/* <th className="font-normal p-2 pb-5">ID</th> */}
                <th className="font-normal p-2 pb-5">Rider Name</th>
                <th className="font-normal p-2 pb-5">Rider Phone Number</th>
                <th className="font-normal p-2 pb-5">Rider Status</th>
                <th className="font-normal p-2 pb-5">Sucessful Delivery</th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
                {arrayRiders?.length > 0 && enableMultiDel && (
                  <input
                    type="checkbox"
                    // onChange={() => pushMultipleProd(product._id)}
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="absolute right-4 top-2"
                  />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filteredArrayRiders?.length > 0 ? (
                filteredArrayRiders?.map((rider) => (
                  <tr key={rider._id}>
                    {/* <td className="px-4 ">{rider._id}</td> */}

                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                      {rider.riderName}
                    </td>

                    <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                      {rider.riderPhoneNumber}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {rider.riderStatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {rider.successDelivered}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleOpenEditModal(rider)}
                          // onClick={() => navigateToeditPage(product._id)}
                          className="text-green-600 hover:text-indigo-300 mr-2"
                        >
                          <CiEdit size={25} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(rider._id)}
                          type="button"
                          className="text-red-600 hover:text-red-300"
                        >
                          <MdDelete size={25} />
                        </button>
                      </div>

                      {arrayRiders?.length > 0 && enableMultiDel && (
                        <input
                          type="checkbox"
                          id="wdwadwk"
                          checked={selectedIds.includes(rider._id)}
                          onChange={() => handlePushIds(rider._id)}
                        />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <p className="text-center p-2">no rider found!</p>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedIds && selectedIds.length > 0 && (
        <div className=" w-full flex gap-2 justify-end p-3">
          <button
            onClick={handleCancelMultiDel}
            className="border bg-green-700 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel Detete
          </button>
          <button
            onClick={() => handleDeleteMulti()}
            className="border bg-red-700 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Confirm Detete
          </button>
        </div>
      )}
    </div>
  );
}
