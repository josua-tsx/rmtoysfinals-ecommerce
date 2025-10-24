import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import formatPrice from "../../reusable/formatPrice";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import ToShipModal from "../../modals/ToShipModal";

export default function AdminOrderGuestStatus() {
  const queryClient = useQueryClient();
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [openToShipModal, setOpenToShipModal] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState(null);

  const {
    data: allOrders = [],
    isPending: isOrdersPending,
    isError: isOrdersError,
  } = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-guest-orders`);
      return res.data;
    },
  });

  const arrayAllOrders = Array.isArray(allOrders) ? allOrders : [];

  const filteredArrayAllOrders = arrayAllOrders.filter(
    (order) =>
      order._id.includes(searchTerm) ||
      order.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: async ({ id, status, riderId }) => {
      const res = await axiosInstance.put(`/order/${id}/status`, {
        status,
        riderId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["notificationLogs"] });
      queryClient.invalidateQueries({ queryKey: ["deliveredCancelled"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["riders", "riderId"] });
      toast.success("Sucessfully Updated Status!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const selectOrderRiderId = (riderId) => {
    const orderWithRider = allOrders.find((order) => order.riderId === riderId);
    const riderIdValue = orderWithRider ? orderWithRider.riderId : null;

    return riderIdValue;
  };

  // const handleChangeStatus = (id, e) => {
  //   const newStatus = e.target.value;

  //   updateStatusMutation({ id, status: newStatus });
  // };

  const confirmOrderStatus = () => {
    // if (newStatus === "Shipped" && selectedRiderId === null) {"You must pick a rider to update status to shipped."
    //   return toast.error("You must pick a rider to update status to shipped.");
    // }

    updateStatusMutation({
      id: selectedId,
      status: newStatus,
      riderId: selectedRiderId,
    });
    cancelConfirmModal();
  };

  console.log(selectedRiderId);

  const handleOpenConfirmModal = (id, e, riderId) => {
    setOpenConfirmModal(true);
    setSelectedId(id);
    selectOrderRiderId(riderId);
    setNewStatus(e.target.value);

    if (e.target.value === "Shipped") {
      setOpenToShipModal(true);
    } else {
      setOpenToShipModal(false);
    }
  };

  const cancelConfirmModal = () => {
    setSelectedId(null);
    setOpenConfirmModal(false);
    setNewStatus("");
  };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const handleCancelOpenShipModal = () => {
    setOpenToShipModal(false);
    setOpenConfirmModal(false);
    setSelectedRiderId(null);
  };

  const handleConfirmToShipModal = () => {
    setOpenToShipModal(false);
  };

  if (isOrdersError) return <p>error.</p>;

  return (
    <div className="font-main border rounded-[5px] text-sm md:text-normal border-black bg-card relative ">
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={openConfirmModal}
        onCancel={cancelConfirmModal}
        onConfirm={confirmOrderStatus}
        title={"Update Order Status"}
        message={"Are you sure you want to update the order status?"}
      />

      <ToShipModal
        selectedRiderId={selectedRiderId}
        setSelectedRiderId={setSelectedRiderId}
        isOpen={openToShipModal}
        onConfirm={handleConfirmToShipModal}
        onCancel={handleCancelOpenShipModal}
      />

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>GUEST ORDER TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search order.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isOrdersPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr className="">
                <th className="font-normal p-2 pb-5">ORDER ID</th>
                <th className="font-normal p-2 pb-5">CUSTOMER GUEST NAME</th>
                <th className="font-normal p-2 pb-5">CUSTOMER GUEST PHONE</th>
                <th className="font-normal p-2 pb-5">CUSTOMER GUEST ADDRESS</th>
                <th className="font-normal p-2 pb-5">ORDER DATE</th>
                <th className="font-normal p-2 pb-5">TOTAL AMOUNT</th>

                <th className="font-normal p-2 pb-5">PAYMENT METHOD</th>
                {/* <th className="font-normal p-2 pb-5">PAYMENT STATUS</th> */}
                {/* <th className="font-normal p-2 pb-5">SHIPPING STATUS</th> */}
                <th className="font-normal p-2 pb-5">PAYMENT STATUS</th>
                <th className="font-normal p-2 pb-5">ORDER STATUS</th>
                {/* <th className="font-normal p-2 pb-5">Stocks</th> */}
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filteredArrayAllOrders?.length > 0 ? (
                filteredArrayAllOrders?.map((data) => (
                  <tr key={data._id}>
                    <td className="px-4 ">{data._id}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                      {data?.guestUser?.name}
                    </td>

                    <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                      {data?.guestUser?.phone}
                    </td>
                    <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                      {data?.shippingAddress}
                    </td>
                    <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                      {new Date(data?.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {formatPrice(data?.totalPrice)} PHP
                    </td>

                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {data?.paymentMethod}
                    </td>

                    <td className="px-6 py-4 uppercase  whitespace-nowrap text-center text-sm">
                      {(data?.paymentStatus &&
                        data?.paymentStatus === "Failed") ||
                      data?.paymentStatus === "Refunded" ? (
                        <span className="text-red-700">
                          {data?.paymentStatus}
                        </span>
                      ) : (
                        <span className="text-blue-700">
                          {data?.paymentStatus}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {data?.status && data?.status === "Cancelled" ? (
                        <span className="text-red-700">{data?.status}</span>
                      ) : (
                        <span className="text-blue-700">{data?.status}</span>
                      )}
                    </td>
                    {/* 
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{data.status}</td> */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-center text-sm"></td> */}

                    {/* <td className="px-4 py-4 whitespace-nowrap text-cener text-sm">
                {product.stocks}
              </td> */}
                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() => handleOpenSingleOrder(data)}
                        type="button"
                      >
                        VIEW
                      </button>

                      <div>
                        <select
                          name="status"
                          id="status"
                          // onChange={(e) => handleChangeStatus(data._id, e)}
                          onChange={(e) =>
                            handleOpenConfirmModal(data._id, e, data.riderId)
                          }
                          value={data.status}
                          className="outline-none border border-black text-center uppercase py-1 rounded-[5px]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <p>no order.</p>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
