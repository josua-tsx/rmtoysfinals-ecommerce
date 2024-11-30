import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import formatPrice from "../../reusable/formatPrice";

export default function AdminSuccesfullTransactions({
  successOrderData,
  isSuccessPending,
  isSuccessError,
}) {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const arraySuccessOrder = Array.isArray(successOrderData)
    ? successOrderData
    : [];

  console.log(successOrderData);

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const { mutate: updateToRefundMutation } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(`/order/refund-order`, orderId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["successOrder"] });
      queryClient.invalidateQueries({ queryKey: ["refundedCancelled"] });
      toast.success(`Updated to refunded`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleUpdateToRefunded = (orderId) => {
    updateToRefundMutation({ orderId });
  };

  const { mutate: cancelSuccessMutation } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(
        `/order/cancel-success-transact`,
        orderId
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["successOrder"] });
      toast.success("Successfully Cancelled!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const filteredSuccessOrder = arraySuccessOrder.filter(
    (success) =>
      success?.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      success?.userId?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      success?.userId?._id.includes(searchTerm) ||
      success?._id.includes(searchTerm) ||
      success?.paymentMethod.toLowerCase().includes(searchTerm) ||
      success?.status.toLowerCase().includes(searchTerm)
  );

  const handleCancelSuccessTransact = (orderId) => {
    cancelSuccessMutation({ orderId });
  };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  if (isSuccessPending) return <p>loading...</p>;
  if (isSuccessError) return <p>Error</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>SUCCESFUL TRANSACTIONS</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search products.."
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="">
              <th className="font-normal p-2 pb-5">ORDER ID</th>
              <th className="font-normal p-2 pb-5">CUSTOMER EMAIL</th>
              <th className="font-normal p-2 pb-5">ORDER DATE</th>
              <th className="font-normal p-2 pb-5">TOTAL AMOUNT</th>
              <th className="font-normal p-2 pb-5">GCASH NUMBER</th>
              <th className="font-normal p-2 pb-5">TOTAL ITEMS BOUGHT</th>
              <th className="font-normal p-2 pb-5">PAYMENT METHOD</th>
              <th className="font-normal p-2 pb-5">PAYMENT STATUS</th>
              <th className="font-normal p-2 pb-5">STATUS</th>
              <th className="font-normal p-2 pb-5">ADDRESS</th>
              <th className="font-normal p-2 pb-5">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {filteredSuccessOrder.length > 0 ? (
              filteredSuccessOrder.map((success) => {
                const totalItemsBought =
                  success.orderItems?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0
                  ) || 0;

                return (
                  <tr key={success?._id}>
                    <td className="px-4">{success?._id}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium gap-2">
                      {success?.userId?.email}
                    </td>
                    <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {new Date(success.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {formatPrice(success.totalPrice)} PHP
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {success.userId?.phoneNumber}
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {totalItemsBought}
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {success.paymentMethod}
                    </td>
                    <td className="px-6 py-4 uppercase text-green-700 whitespace-nowrap text-center text-sm">
                      {success.paymentStatus}
                    </td>
                    <td className="px-6 py-4 uppercase text-green-700 whitespace-nowrap text-center text-sm">
                      {success.status}
                    </td>
                    <td className="py-6 px-6 uppercase whitespace-nowrap text-center text-sm">
                      {success.userId?.address[0]?.fullAddress}
                    </td>
                    <td className=" whitespace-nowrap text-center text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenSingleOrder(success)}
                          type="button"
                          className="text-indigo-700"
                        >
                          VIEW
                        </button>
                        <button
                          onClick={() =>
                            handleCancelSuccessTransact(success._id)
                          }
                          type="button"
                          className="text-red-700"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={() => handleUpdateToRefunded(success._id)}
                          type="button"
                          className="text-green-700"
                        >
                          REFUND
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4">
                  No successful transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
