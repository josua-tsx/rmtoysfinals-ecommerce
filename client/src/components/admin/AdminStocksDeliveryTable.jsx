import {  useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminStocksDeliveryTable() {

    // const queryClient = useQueryClient()

  const {
    data: processingStocks = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["processingStocks"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/stocks/get-processingStocks`
      );
      return res.data;
    },
  });


  const {mutate: setAsDeliveredMutation} = useMutation({
    mutationFn: async (deliveryId) => {
        const res = await axiosInstance.put(`/stocks/set-as-delivered/${deliveryId}`)
        return res.data
    },
    onSuccess: () => {
        toast.success("success")
    }, 
    onError: (err) => {
        toast.error(err.response.data.message || "something went wrong!")
    }
  })




  if (isPending) {
    return <p>loading...</p>;
  }

  if (isError) {
    return <p>error...</p>;
  }

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative">
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className="border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4">
        <h1>DELIVERY TABLE</h1>
        {/* <div className="flex items-center relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="search stocks id, product name, supplier name, category name"
          className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
        />
        <IoSearch className="absolute right-0" size={30} />
      </div> */}
      </div>
      <div className="overflow-y-auto h-[600px] py-3">
        <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {/* <th className="font-normal p-2 pb-5">ID</th> */}
              <th className="font-normal p-2 pb-5">DELIVERY ID</th>
              <th className="font-normal p-2 pb-5">Product Name</th>
              <th className="font-normal p-2 pb-5">Supplier Name</th>
              <th className="font-normal p-2 pb-5">Category Name</th>
              <th className="font-normal p-2 pb-5">Quantity to add</th>

              <th className="font-normal p-2 pb-5">Shop Price</th>

              <th className="font-normal p-2 pb-5">Supplier Price</th>
              <th className="font-normal p-2 pb-5">Shipping Price</th>
              <th className="font-normal p-2 pb-5">Total Cost</th>

              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
         {
            processingStocks.map((processing) => (
                <tr key={processing._id}>
                <td className="px-4">{processing._id}</td>
                <td className="flex items-center px-4 gap-2">
                    {processing?.product?.productName}
                </td>
                <td>{processing?.supplier?.supplierName}</td>
                <td>{processing?.product?.category?.categoryName}</td>
                <td>{processing?.quantity}</td>
                <td>{processing?.shopPrice}</td>
                <td>{processing?.supplierPrice}</td>
                <td>{processing?.shippingPrice}</td>
                <td>{processing?.totalCost}</td>
                <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                  <button 
                    onClick={() => setAsDeliveredMutation(processing._id)}
                  className="border border-black p-1 px-2 rounded-[5px] bg-green-700 text-white hover:text-indigo-300 mr-2">
                    SET AS DELIVERED
                  </button>
                </td>
              </tr>
            ))
         }
          </tbody>
        </table>
      </div>
    </div>
  );
}
