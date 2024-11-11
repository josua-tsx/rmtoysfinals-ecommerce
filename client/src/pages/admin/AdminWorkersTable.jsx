import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminWorkersTable() {
  const queryClient = useQueryClient();

  const {
    data: workers = [],
    isPending: isWorkersPending,
    isError: isWorkersError,
  } = useQuery({
    queryKey: ["worker"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/user/getAllWorkers`);
      return res.data;
    },
  });

  const { mutate: deleteWorkerMutation } = useMutation({
    mutationFn: async (workerId) => {
      const res = await axiosInstance.delete(`/user/delete-worker/${workerId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker"] });
      toast.success("worker deleted");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  if (isWorkersPending) {
    <p>loading...</p>;
  }
  if (isWorkersError) {
    <p>Error</p>;
  }

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>WORKER TABLE</h1>
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
              <th className="font-normal p-2 pb-5">ID</th>
              <th className="font-normal p-2 pb-5">Email</th>
              <th className="font-normal p-2 pb-5">Username</th>
              <th className="font-normal p-2 pb-5">Phone Number</th>
              <th className="font-normal p-2 pb-5">Active Address</th>
              <th className="font-normal p-2 pb-5">Role</th>
              <th className="font-normal p-2 pb-5">Job Description</th>
              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {workers.length > 0 ? (
              workers.map((worker) => (
                <tr key={worker._id}>
                  <td className="px-4 ">{worker._id}</td>

                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                    {worker.email}
                  </td>

                  <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                    {worker.username}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {!worker.phoneNumber
                      ? <span className="text-red-700">not updated yet</span>
                      : worker.phoneNumber}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  {!worker?.address[0]?.fullAddress ? <span className="text-red-700">not updated yet</span> : worker?.address[0]?.fullAddress }
                </td>
                  <td className="px-6 uppercase py-4 whitespace-nowrap text-center text-sm">
                    {worker.role}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {worker.jobDescription}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                    <button onClick={() => deleteWorkerMutation(worker._id)}
                      type="button"
                      className="text-red-600 hover:text-red-300"
                    >
                      <MdDelete size={25} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <p>no worker found!</p>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
