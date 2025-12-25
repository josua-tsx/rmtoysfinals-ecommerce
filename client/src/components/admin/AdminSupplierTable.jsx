import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import FormModal from "../../reusable/FormModal";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminSupplierTable({ enableMultiDel }) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

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
          data
        );
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supplier"] });
        toast.success("Successfully Edited!");
        setIsOpenEditModal(false);
        setSelectedSupplier(null);
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong");
      },
    });

  const { mutate: deleteSupplierMutation } = useMutation({
    mutationFn: async (supplierId) => {
      const res = await axiosInstance.delete(
        `/supplier/delete-supplier/${supplierId}`
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
        `Are you sure you want to delete ${selectedIds.length} suppliers?`
      )
    ) {
      deleteMultiSupplier(selectedIds);
    }
  };

  const handleClickDelete = (supplierId) => {
    setSelectedId(supplierId);
    setIsModalOpen(true);
  };

  const handleSelectAll = (e) => {
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
        : [...prev, supplierId]
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
    setSupplierName(supplier.supplierName);
    setContactPerson(supplier.contactPerson);
    setContactNumber(supplier.contactNumber);
    setSupplierAddress(supplier.supplierAddress);
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editSupplierMutation({
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
    });
  };

  const filteredArraySuppliers = arraySuppliers.filter(
    (supplier) =>
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier._id.includes(searchTerm)
  );

  if (isSupplierError) {
    <p>loading....</p>;
  }
  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative ">
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
        onSubmit={handleEditSubmit}
        submitLabel="Update Supplier"
        isSubmitting={isEditPending}
      >
        <div className="flex gap-2 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label htmlFor="editSupplierName" className="uppercase">
              Supplier Name:{" "}
            </label>
            <input
              type="text"
              name="supplierName"
              id="editSupplierName"
              value={supplierName}
              maxLength={50}
              onChange={handleInputChange(setSupplierName)}
              className="border border-black w-full rounded-[5px] p-1  outline-none"
              required
            />
            <p className="text-sm pt-1 lowercase text-green-700">
              (Supplier name do not allow double spaces, and number. it should
              be between 3 and 50 characters.)
            </p>
          </div>
          <div className="flex gap-2 flex-col">
            <label htmlFor="editContactPerson" className="uppercase">
              Contact Person Fulllname :{" "}
            </label>
            <input
              type="text"
              name="contactPerson"
              id="editContactPerson"
              value={contactPerson}
              maxLength={100}
              onChange={handleInputChange(setContactPerson)}
              className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              required
            />
            <p className="text-sm pt-1 lowercase text-green-700">
              (Contact person full name does not allow double spaces.)
            </p>
          </div>

          <div className="flex gap-2 flex-col">
            <label htmlFor="editContactNumber" className="uppercase">
              Contact Number:{" "}
            </label>
            <input
              type="tel"
              name="contactNumber"
              id="editContactNumber"
              value={contactNumber}
              maxLength={11}
              onChange={handleInputChange(setContactNumber)}
              className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              required
            />
            <p className="text-sm pt-1 lowercase text-green-700">
              (Phone number should be valid number. It should start with 09 and
              exact 11 numbers)
            </p>
          </div>

          <div className="flex gap-2 flex-col">
            <label htmlFor="editSupplierAddress" className="uppercase">
              Supplier Address:{" "}
            </label>
            <input
              type="text"
              name="supplierAddress"
              id="editSupplierAddress"
              value={supplierAddress}
              maxLength={200}
              onChange={handleInputChange(setSupplierAddress)}
              className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              required
            />
          </div>
          <p className="text-sm pt-1 lowercase text-green-700">
            (Supplier address do not allow double spaces and is between 5 and
            200 max characters long.)
          </p>
        </div>
      </FormModal>

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>SUPPLIER TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search supplier.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isSupplierPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead className="relative">
              <tr className="">
                {/* <th className="font-normal p-2 pb-5">ID</th> */}
                <th className="font-normal p-2 pb-5">Supplier Name</th>
                <th className="font-normal p-2 pb-5">
                  Contact Person Fullname
                </th>
                <th className="font-normal p-2 pb-5">Contact Number</th>
                <th className="font-normal p-2 pb-5">Supplier Address</th>
                <th className="font-normal p-2 pb-5">
                  Supplied Products Count
                </th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
                {arraySuppliers.length > 0 && enableMultiDel && (
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
              {filteredArraySuppliers.length > 0 &&
                filteredArraySuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    {/* <td className="px-4 ">{supplier._id}</td> */}
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {supplier.supplierName}
                    </td>

                    <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {supplier.contactPerson}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {supplier.contactNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center uppercase text-sm">
                      {supplier?.supplierAddress}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center uppercase text-sm">
                      {supplier?.product ? supplier?.product.length : 0}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleOpenEditModal(supplier)}
                          className="text-green-600 hover:text-indigo-300 mr-2"
                        >
                          <CiEdit size={25} />
                        </button>
                        <button
                          onClick={() => handleClickDelete(supplier._id)}
                          className="text-red-600 hover:text-red-300"
                        >
                          <MdDelete size={25} />
                        </button>
                      </div>

                      {arraySuppliers.length > 0 && enableMultiDel && (
                        <input
                          type="checkbox"
                          id="wdwadwk"
                          checked={selectedIds.includes(supplier._id)}
                          onChange={() => pushMultipleSup(supplier._id)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedIds && selectedIds.length > 0 && (
        <div className=" w-full flex gap-2 justify-end p-3">
          <button
            onClick={cancelMultiDel}
            className="border bg-green-700 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel Detete
          </button>
          <button
            onClick={() => handleMultiDelete()}
            className="border bg-red-700 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Confirm Detete
          </button>
        </div>
      )}
    </div>
  );
}
