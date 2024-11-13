import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminOrderStatusTable() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const queryClient = useQueryClient()

  const {
    data: allOrders = [],
    isPending: isOrdersPending,
    isError: isOrdersError,
  } = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-orders`);
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

  const {mutate: updateStatusMutation} = useMutation({
    mutationFn: async ({id, status}) => {
      const res = await axiosInstance.put(`/order/${id}/status`, {status} )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['order']})
      queryClient.invalidateQueries({queryKey: ['deliveredCancelled']})
      toast.success("Sucessfully Updated Status!")
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong")
    }
  })

  const handleChangeStatus = (id, e) => {
    const newStatus = e.target.value 

    updateStatusMutation({id, status: newStatus})
  } 

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };



  if (isOrdersPending) return <p>loading...</p>;
  if (isOrdersError) return <p>error.</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>PRODUCTS TABLE</h1>
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
              <th className="font-normal p-2 pb-5">CUSTOMER NAME</th>
              <th className="font-normal p-2 pb-5">CUSTOMER EMAIL</th>
              <th className="font-normal p-2 pb-5">ORDER DATE</th>
              <th className="font-normal p-2 pb-5">TOTAL AMOUNT</th>
              {/* <th className="font-normal p-2 pb-5">PAYMENT STATUS</th> */}
              {/* <th className="font-normal p-2 pb-5">SHIPPING STATUS</th> */}
              <th className="font-normal p-2 pb-5">ORDER STATUS</th>
              {/* <th className="font-normal p-2 pb-5">Stocks</th> */}
              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {allOrders?.length > 0 ? (
              allOrders?.map((data) => (
                <tr key={data._id}>
                  <td className="px-4 ">{data._id}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                    {data.userId.fullName}
                  </td>

                  <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                    {data.userId.email}
                  </td>
                  <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                    {data.createdAt}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {data.totalPrice}
                  </td>

                  <td className="px-6 py-4  whitespace-nowrap text-center text-sm">
                    {data.status}
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
                      className=""
                    >
                      VIEW
                    </button>

                    <div>
                      <select
                        name="status"
                        id="status"
                        onChange={(e) => handleChangeStatus(data._id, e)}
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
      </div>
    </div>
  );
}
