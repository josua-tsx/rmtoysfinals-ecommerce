import {  useQuery,  } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
// import toast from "react-hot-toast";
import SingleOrderList from "../../components/SingleOrderList";

export default function AdminRefundedCancelledTransactions() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // const queryClient = useQueryClient();

  const {
    data: refundedCancelled = [],
    isPending: isRefundedCancelledPending,
    isError: isRefundedCancelledError,
  } = useQuery({
    queryKey: ["refundedCancelled"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-refundedCancelled`);
      return res.data;
    },
  });

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  // const { mutate: cancelSuccessMutation } = useMutation({
  //   mutationFn: async (orderId) => {
  //     const res = await axiosInstance.put(
  //       `/order/cancel-success-transact`,
  //       orderId
  //     );
  //     return res.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["order"] });
  //     queryClient.invalidateQueries({ queryKey: ["refundedCancelled"] });
  //     toast.success("Successfully Cancelled!");
  //   },
  //   onError: (err) => {
  //     toast.error(err.response.data.message || "Something went wrong!");
  //   },
  // });

  // const handleCancelSuccessTransact = (orderId) => {
  //   cancelSuccessMutation({ orderId });
  // };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  console.log(refundedCancelled);

  if (isRefundedCancelledPending) return <p>Loading...</p>;
  if (isRefundedCancelledError) return <p>Error.</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      {openModal && singleUserOrder && (
      <SingleOrderList
        order={singleUserOrder}
        onClose={() => setOpenModal(false)}
      />
    )}

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>REFUNDED/CANCELLED TRANSACTIONS</h1>
        {/* <div className="flex items-center relative">
        <input
          type="text"
          placeholder="search products.."
          className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
        />
        <IoSearch className="absolute right-0" size={30} />
      </div> */}
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="">
              <th className="font-normal p-2 pb-5">ORDER ID</th>
              <th className="font-normal p-2 pb-5">CUSTOMER EMAIL</th>
              <th className="font-normal p-2 pb-5">ORDER DATE</th>
              <th className="font-normal p-2 pb-5">REFUNDED DATE</th>
              <th className="font-normal p-2 pb-5">AMOUNT REFUNDED</th>
              <th className="font-normal p-2 pb-5">GCASH NUMBER</th>
              <th className="font-normal p-2 pb-5">TOTAL ITEMS</th>
              <th className="font-normal p-2 pb-5">PAYMENT METHOD</th>
              <th className="font-normal p-2 pb-5">PAYMENT STATUS</th>
              <th className="font-normal p-2 pb-5">REASON</th>
              <th className="font-normal p-2 pb-5">STATUS</th>
              <th className="font-normal p-2 pb-5">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {refundedCancelled?.length > 0 ? (
              refundedCancelled.map((refund) => (
                <tr key={refund._id}>
                  <td className="px-4">{refund._id}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium gap-2">
                    {refund.userId?.email}
                  </td>
                  <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                  {new Date(refund.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  {new Date(refund.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {refund.totalPrice}
                  </td>
                  <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                    32
                  </td>
                  <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {refund.userId?.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-indigo-700 uppercase whitespace-nowrap text-center text-sm">
                    {refund.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-red-700 uppercase whitespace-nowrap text-center text-sm">
                    {refund.paymentStatus}
                  </td>
                  <td className="px-6 py-4 text-indigo-700 uppercase whitespace-nowrap text-center text-sm">
                    {refund.reason ? refund.reason : "no reason inputed"}
                  </td>
                  <td className="py-6 px-6 uppercase text-red-700 whitespace-nowrap text-center text-sm">
                    {refund.status}
                  </td>
                  <td className=" whitespace-nowrap text-center text-sm">
                    <div className="flex gap-2">
                      <button
                          onClick={() => handleOpenSingleOrder(refund)}
                        type="button"
                        className="text-green-700"
                      >
                        VIEW
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4">
                  No Refunded transactions.
                </td>
              </tr>
            )
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
