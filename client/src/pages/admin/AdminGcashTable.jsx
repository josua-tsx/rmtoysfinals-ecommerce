import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";

import toast from "react-hot-toast";

export default function AdminGcashTable() {
  const queryClient = useQueryClient();

  const {
    data: gcashInfo = [],
    isPending: isGcashPending,
    isError: isGcashError,
  } = useQuery({
    queryKey: ["gcash"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/gcash/get-gcash`);
      return res.data;
    },
  });

  const { mutate: deleteSingleGcash } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.delete(`/gcash/delete-gcash/${orderId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gcash"] });
      toast.success("Successfully Deleted!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const { mutate: updateGcashStatusMutation } = useMutation({
    mutationFn: async ({ id, gcashStatus }) => {
      const res = await axiosInstance.put(`/gcash/${id}/gcash`, {
        gcashStatus,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gcash"] });
      toast.success("Successfully Updated Status!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleChangeStatus = (id, e) => {
    const newStatus = e.target.value;

    updateGcashStatusMutation({ id, gcashStatus: newStatus });
  };

  console.log(gcashInfo);

  if (isGcashPending) return <p>loading...</p>;
  if (isGcashError) return <p>error</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>USERS TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
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
              <th className="font-normal p-2 pb-5">ID</th>
              <th className="font-normal p-2 pb-5">Gcash Image</th>
              <th className="font-normal p-2 pb-5">Gcash Name</th>
              <th className="font-normal p-2 pb-5">Active</th>
              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700 ">
            {gcashInfo?.length > 0 ? (
              gcashInfo.map((gcash) => (
                <tr key={gcash._id}>
                  <td className="px-4 ">{gcash._id}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                    <img
                      src={gcash?.gcashUrl}
                      alt="gcash image"
                      className="w-[20px]"
                    />
                  </td>

                  <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {gcash?.gcashName}
                  </td>
                  <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {gcash.gcashStatus === "Active" ? (
                      <span className="text-green-700">
                        {gcash.gcashStatus}
                      </span>
                    ) : (
                      <span className="text-red-700">{gcash.gcashStatus}</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                    <button
                      onClick={() => deleteSingleGcash(gcash._id)}
                      className="text-red-600 hover:text-red-300"
                    >
                      <MdDelete size={25} />
                    </button>
                    <div>
                      <select
                        onChange={(e) => handleChangeStatus(gcash._id, e)}
                        value={gcash.gcashStatus}
                        name="gcashStatus"
                        id="gcashStatus"
                        className="border border-black uppercase outline-none p-1 rounded-[5px]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <p>no gcash</p>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
