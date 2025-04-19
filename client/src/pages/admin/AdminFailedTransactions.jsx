import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import SingleOrderList from "../../components/SingleOrderList";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";

import formatPrice from "../../reusable/formatPrice";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminFailedTransactions({
  failedCancelledData,
  isFailedCancelledPending,
  isFailedCancelledError,
}) {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const arrayCustomerFailed = Array.isArray(failedCancelledData)
    ? failedCancelledData
    : [];

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

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
      queryClient.invalidateQueries({ queryKey: ["failedCancelled"] });
      toast.success("Successfully Cancelled!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleCancelSuccessTransact = (orderId) => {
    cancelSuccessMutation({ orderId });
  };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const filteredFailedOrder = arrayCustomerFailed.filter(
    (failed) =>
      failed._id.includes(searchTerm) ||
      failed?.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      failed.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      failed.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      failed.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );



  if (isFailedCancelledError) return <p>Error.</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>FAILED TRANSACTIONS</h1>
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
        {
          isFailedCancelledPending ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner/>
            </div>
          ): (
            <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="">
              <th className="font-normal p-2 pb-5">ORDER ID</th>
              <th className="font-normal p-2 pb-5">CUSTOMER EMAIL</th>
              <th className="font-normal p-2 pb-5">ORDER DATE</th>
              <th className="font-normal p-2 pb-5">ORDER FAILED DATE</th>
              <th className="font-normal p-2 pb-5">TOTAL AMOUNT</th>
              <th className="font-normal p-2 pb-5">GCASH NUMBER</th>
              <th className="font-normal p-2 pb-5">TOTAL ITEMS</th>
              <th className="font-normal p-2 pb-5">PAYMENT METHOD</th>
              <th className="font-normal p-2 pb-5">PAYMENT STATUS</th>
              <th className="font-normal p-2 pb-5">STATUS</th>
              <th className="font-normal p-2 pb-5">REASON</th>
              <th className="font-normal p-2 pb-5">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {filteredFailedOrder?.length > 0 ? (
              filteredFailedOrder.map((failed) => {
                const totalItems =
                  failed.orderItems?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0
                  ) || 0;

                return (
                  <tr key={failed._id}>
                    <td className="px-4">{failed._id}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium  gap-2">
                      {failed.userId?.email}
                    </td>
                    <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {new Date(failed.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {failed.updatedAt}
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {formatPrice(failed.totalPrice)} PHP
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {failed.userId?.phoneNumber}
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {failed?.totalItemsOrdered}
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {failed.paymentMethod}
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {failed.paymentStatus}
                    </td>
                    <td className="py-6 px-6 uppercase whitespace-nowrap text-center text-sm">
                      {failed.status}
                    </td>
                    <td className="py-6 px-6 text-red-700 uppercase whitespace-nowrap text-center text-sm">
                      {failed.reason}
                    </td>
                    <td className=" whitespace-nowrap px-4 text-center text-sm">
                      <div className="flex gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenSingleOrder(failed)}
                            type="button"
                            className="text-green-700"
                          >
                            VIEW
                          </button>
                          <button
                            onClick={() =>
                              handleCancelSuccessTransact(failed._id)
                            }
                            type="button"
                            className="text-red-700"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4">
                  No failed transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
          )
        }
      </div>
    </div>
  );
}
