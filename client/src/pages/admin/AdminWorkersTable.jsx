import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import FormModal from "../../reusable/FormModal";

export default function AdminWorkersTable() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setIsSelectedId] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    data: workers = [],
    isPending: isWorkersPending,
    isError: isWorkersError,
  } = useQuery({
    queryKey: ["validatorStaff"],
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
      queryClient.invalidateQueries({ queryKey: ["validatorStaff"] });
      toast.success("worker deleted");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const { mutate: updateWorkerMutation, isPending: isUpdating } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/user/edit-worker/${selectedWorker._id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validatorStaff"] });
      setEmail("");
      setUsername("");
      setJobDescription("");
      setRole("");
      setPassword("");
      toast.success("Successfully worker updated!");
      setIsEditModalOpen(false);
      setSelectedWorker(null);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
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

  // Edit Handlers
  const handleEditClick = (worker) => {
    setSelectedWorker(worker);
    setEmail(worker.email);
    setUsername(worker.username);
    setJobDescription(worker.jobDescription);
    setRole(worker.role);
    setPassword(""); // Reset password field
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateWorkerMutation({
      email,
      username,
      password,
      role,
      jobDescription,
    });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  if (isWorkersError) {
    <p>Error</p>;
  }

  return (
    <div className="font-main border rounded-[5px] text-sm md:text-normal border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          Worker Table
        </h1>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title={"Confirm delete"}
        message={
          "Are you sure you want to delete this worker? This action can not be undone."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Edit Worker Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        title="Edit Worker"
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        submitLabel="UPDATE WORKER"
        isSubmitting={isUpdating}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="editEmail"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              WORKER EMAIL
            </label>
            <input
              type="email"
              name="email"
              id="editEmail"
              value={email}
              maxLength={254}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: worker@example.com"
              className="border border-black rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors"
              required
            />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              (Enter a valid email address)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editUsername"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="editUsername"
              value={username}
              maxLength={50}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: JuanDelaCruz"
              className="border border-black rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors"
              required
            />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              (5-50 letters, no numbers or special characters)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editPassword"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Password (leave blank to keep current)
            </label>
            <div className="flex flex-col gap-2 relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="editPassword"
                value={password}
                maxLength={128}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-black rounded-[5px] p-3 w-full outline-none bg-gray-50 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-3.5 flex items-center gap-2 cursor-pointer bg-white border border-black px-2 py-0.5 rounded-[3px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <p className="text-[8px] font-black uppercase">Show</p>
                <input
                  type="checkbox"
                  checked={showPassword}
                  readOnly
                  className="size-[10px] border border-black cursor-pointer"
                />
              </button>
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                (Min 8 chars, 1 uppercase, 1 number, 1 special char)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editRole"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              ROLE
            </label>
            <select
              name="role"
              id="editRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-black rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
              required
            >
              <option value="staff">Staff</option>
              <option value="validatorStaff">Validator Staff</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editJobDescription"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              Job Description
            </label>
            <input
              type="text"
              name="jobDescription"
              id="editJobDescription"
              value={jobDescription}
              maxLength={200}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Ex: Customer Support & Verification"
              className="border border-black rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors"
              required
            />
          </div>
        </div>
      </FormModal>

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Workers
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search worker.."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-all font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isWorkersPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black relative">
              <tr>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  ID
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Email
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Username
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Phone
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Address
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Role
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Job Description
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredArrayWorkers?.length > 0 ? (
                filteredArrayWorkers?.map((worker) => (
                  <tr
                    key={worker._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap font-mono text-gray-400">
                      {worker._id.slice(-6)}
                    </td>

                    <td className="p-4 whitespace-nowrap text-black">
                      {worker.email}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {worker.username}
                      </span>
                    </td>

                    <td className="p-4 text-center text-gray-600">
                      {!worker.phoneNumber ? (
                        <span className="text-red-500/70 italic">Pending</span>
                      ) : (
                        worker.phoneNumber
                      )}
                    </td>

                    <td className="p-4 text-gray-600 max-w-[200px] truncate">
                      {!worker?.address[0]?.fullAddress ? (
                        <span className="text-red-500/70 italic">Pending</span>
                      ) : (
                        worker?.address[0]?.fullAddress
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {worker.role}
                      </span>
                    </td>

                    <td className="p-4 text-center text-gray-600">
                      {worker.jobDescription}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(worker)}
                          title="Edit"
                          className="p-2 border border-black bg-yellow-400 text-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <CiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleClickDelete(worker._id)}
                          title="Delete"
                          className="p-2 border border-black bg-red-500 text-white rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
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
