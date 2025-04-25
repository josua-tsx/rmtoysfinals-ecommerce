import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminWorkersTable() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setIsSelectedId] = useState(null);

  const navigate = useNavigate();

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

  const arrayWorkers = Array.isArray(workers) ? workers : [];

  const filteredArrayWorkers = arrayWorkers?.filter(
    (worker) =>
      worker.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker._id.includes(searchTerm)
  );

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

  const handleClickDelete = (workerId) => {
    setIsSelectedId(workerId);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (selectedId) {
      deleteWorkerMutation(selectedId);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsSelectedId(null);
    setIsModalOpen(false);
  };

  if (isWorkersError) {
    <p>Error</p>;
  }

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      <ConfirmModal
        isOpen={isModalOpen}
        title={"Confirm delete"}
        message={
          "Are you sure you want to delete this worker? This action can not be undone."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>WORKER TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search worker emai, name, role, job description, id"
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isWorkersPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr className="">
                <th className="font-normal p-2 pb-5">ID</th>
                <th className="font-normal p-2 pb-5">Email</th>
                <th className="font-normal p-2 pb-5">Username</th>
                <th className="font-normal p-2 pb-5">Phone Number</th>
                <th className="font-normal p-2 pb-5">Active Address</th>
                <th className="font-normal p-2 pb-5">Role</th>
                <th className="font-normal p-2 pb-5">IsOnline</th>
                <th className="font-normal p-2 pb-5">Job Description</th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filteredArrayWorkers?.length > 0 ? (
                filteredArrayWorkers?.map((worker) => (
                  <tr key={worker._id}>
                    <td className="px-4 ">{worker._id}</td>

                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                      {worker.email}
                    </td>

                    <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                      {worker.username}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {!worker.phoneNumber ? (
                        <span className="text-red-700">not updated yet</span>
                      ) : (
                        worker.phoneNumber
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {!worker?.address[0]?.fullAddress ? (
                        <span className="text-red-700">not updated yet</span>
                      ) : (
                        worker?.address[0]?.fullAddress
                      )}
                    </td>
                    <td className="px-6 uppercase py-4 whitespace-nowrap text-center text-sm">
                      {worker.role}
                    </td>

                    <td className="px-6 uppercase py-4 whitespace-nowrap text-center text-sm">
                      {worker?.isLoggedIn === true ? <div className="flex items-center gap-2">
                        <p>Online</p>
                        <div className="bg-green-400 border border-black h-[20px] rounded-full w-[20px]"></div>
                      </div> : <div className="flex items-center gap-2">
                        <p>Ofline</p>
                        <div className="bg-red-400 h-[20px] border border-black rounded-full w-[20px]"></div>
                      </div>}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {worker.jobDescription}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() =>
                          navigate(`/admin/editWorker/${worker._id}`)
                        }
                        // onClick={() => navigateToeditPage(product._id)}
                        className="text-green-600 hover:text-indigo-300 mr-2"
                      >
                        <CiEdit size={25} />
                      </button>
                      <button
                        onClick={() => handleClickDelete(worker._id)}
                        type="button"
                        className="text-red-600 hover:text-red-300"
                      >
                        <MdDelete size={25} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <p className="text-center p-2">no worker found!</p>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
