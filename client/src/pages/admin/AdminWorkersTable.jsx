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
    <div className="font-main border rounded-[5px] text-sm md:text-normal border-black bg-card relative ">
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
        submitLabel="Update Worker"
        isSubmitting={isUpdating}
      >
        <div className="flex gap-2 p-2 flex-col">
          <div className="flex justify-between flex-col">
            <label htmlFor="editEmail" className="uppercase mb-2">
              WORKER EMAIL:{" "}
            </label>
            <input
              type="text"
              name="email"
              id="editEmail"
              value={email}
              maxLength={254}
              onChange={(e) => setEmail(e.target.value)}
              className=" outline-none p-1  border-[#313031] border rounded-[5px]"
              required
            />
            <p className="text-sm pt-1 text-green-700">
              (Enter a valid email.)
            </p>
          </div>
          <div className="flex justify-between flex-col">
            <label htmlFor="editUsername" className="uppercase mb-2 ">
              Username:{" "}
            </label>
            <input
              type="text"
              name="username"
              id="editUsername"
              value={username}
              maxLength={50}
              onChange={(e) => setUsername(e.target.value)}
              className=" outline-none p-1  border-[#313031] border rounded-[5px]"
              required
            />
            <p className="text-sm pt-1 text-green-700">
              (Username must be 5-50 letters and contain no numbers or special
              characters.)
            </p>
          </div>

          <div className="flex justify-between flex-col">
            <label htmlFor="editPassword" className="uppercase mb-2 ">
              Password:{" "}
            </label>
            <div className="flex flex-col  gap-2 relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="editPassword"
                value={password}
                maxLength={128}
                onChange={(e) => setPassword(e.target.value)}
                className=" outline-none p-2 w-full border-[#313031] border rounded-[5px]"
                // Password is optional during edit usually, but keeping consistency with existing logic.
                // If backend requires it, keep required. AdminEditWorker did not have required explicitly but had validation text.
                // Assuming optional to keep current password if empty, or required to change.
                // The original AdminEditWorker code had it as an input, suggesting you can change it.
                // Let's leave it as controllable input.
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-2 top-3 flex items-center gap-2 cursor-pointer"
              >
                <p className="text-xs">SHOW PASSWORD</p>
                <input
                  type="checkbox"
                  checked={showPassword}
                  readOnly
                  className="border size-[20px] border-black cursor-pointer"
                />
              </button>
              <p className="text-sm text-green-700">
                (Password must be at least 8 characters, include one uppercase
                letter, one number, and one special character.)
              </p>
            </div>
          </div>

          <div className="flex justify-between flex-col">
            <label htmlFor="editRole" className="uppercase mb-2 ">
              ROLE:{" "}
            </label>
            <select
              name="role"
              id="editRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border outline-none border-black rounded-[5px] py-1"
              required
            >
              <option value="staff">Staff</option>
              <option value="validatorStaff">Validator Staff</option>
            </select>
          </div>

          <div className="flex justify-between flex-col">
            <label htmlFor="editJobDescription" className="uppercase mb-2 ">
              Job Description:{" "}
            </label>
            <input
              type="text"
              name="jobDescription"
              id="editJobDescription"
              value={jobDescription}
              maxLength={200}
              onChange={(e) => setJobDescription(e.target.value)}
              className=" outline-none p-1  border-[#313031] border rounded-[5px]"
              required
            />
          </div>
        </div>
      </FormModal>

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>WORKER TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search worker.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
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

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {worker.jobDescription}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() => handleEditClick(worker)}
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
