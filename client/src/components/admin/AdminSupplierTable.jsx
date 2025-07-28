import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminSupplierTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const cancelMultiDel = () => {
    setSelectedIds([])
    console.log("clicked")
  }

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

  const navigateToEditSupplier = (supplierId) => {
    navigate(`/admin/editSupplier/${supplierId}`);
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
            <thead>
              <tr className="">
                <th className="font-normal p-2 pb-5">ID</th>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filteredArraySuppliers.length > 0 &&
                filteredArraySuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td className="px-4 ">{supplier._id}</td>
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

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() => navigateToEditSupplier(supplier._id)}
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

                      {enableMultiDel ? (
                        <input
                          type="checkbox"
                          id="wdwadwk"
                          checked={selectedIds.includes(supplier._id)}
                          onChange={() => pushMultipleSup(supplier._id)}
                        />
                      ) : (
                        ""
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
            className="border bg-green-700 text-white rounded-[5px] border-black p-2"
          >
            Cancel Detete
          </button>
          <button
            onClick={() => handleMultiDelete()}
            className="border bg-red-700 text-white rounded-[5px] border-black p-2"
          >
            Confirm Detete
          </button>
        </div>
      )}
    </div>
  );
}
