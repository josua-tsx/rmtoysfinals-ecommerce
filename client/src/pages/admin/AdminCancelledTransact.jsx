import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import { IoSearch } from "react-icons/io5";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminCancelledTransact({
  cancelledOrder,
  iscancelledOrderPending,
  iscancelledOrderError,
}) {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // const queryClient = useQueryClient();

  const arrayCancelledOrder = Array.isArray(cancelledOrder)
    ? cancelledOrder
    : [];

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const filteredArrayCancelledOrder = arrayCancelledOrder.filter(
    (cancelled) =>
      cancelled._id.includes(searchTerm) ||
      cancelled?.userId?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cancelled?.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (iscancelledOrderError) return <p>Error.</p>;

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
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search success id, email, payment method"
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {
          iscancelledOrderPending ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner/>
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="">
              <th className="font-normal p-2 pb-5">ORDER ID</th>
              <th className="font-normal p-2 pb-5">CUSTOMER EMAIL</th>
              <th className="font-normal p-2 pb-5">ORDER DATE</th>
              <th className="font-normal p-2 pb-5">GCASH NUMBER</th>
              <th className="font-normal p-2 pb-5">RETURNED ITEMS</th>
              <th className="font-normal p-2 pb-5">STATUS</th>
              <th className="font-normal p-2 pb-5">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {filteredArrayCancelledOrder?.length > 0 ? (
              filteredArrayCancelledOrder.map((cancel) => {
                const totalItems =
                  cancel.orderItems?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0
                  ) || 0;

                return (
                  <tr key={cancel._id}>
                    <td className="px-4">{cancel._id}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2">
                      {cancel.userId?.email}
                    </td>
                    <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {new Date(cancel.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {cancel.userId?.phoneNumber}
                    </td>
                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {totalItems}
                    </td>
                    <td className="px-6 py-4 uppercase text-red-700 whitespace-nowrap text-center text-sm">
                      {cancel.status}
                    </td>
                    <td className=" whitespace-nowrap text-center text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenSingleOrder(cancel)}
                          type="button"
                          className="text-green-700"
                        >
                          VIEW
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4">
                  No Cancelled transactions.
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
