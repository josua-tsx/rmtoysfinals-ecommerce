import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ValidatedInput from "../../reusable/ValidatedInput";
import PasswordInput from "../../reusable/PasswordInput";
import {
  emailSchema,
  usernameSchema,
  passwordSchema,
} from "../../schemas/auth.schema";
import { jobDescriptionSchema } from "../../schemas/worker.schema";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

// Edit worker schema - password is optional for edits
const editWorkerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: z.union([z.literal(""), passwordSchema]).optional(),
  jobDescription: jobDescriptionSchema,
  role: z.enum(["staff", "validatorStaff"]),
});

export default function AdminWorkersTable() {
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setIsSelectedId] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Edit Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editWorkerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      jobDescription: "",
      role: "validatorStaff",
    },
  });

  const {
    data,
    isPending: isWorkersPending,
    isError: isWorkersError,
  } = useQuery({
    queryKey: ["validatorStaff", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/user/getAllWorkers?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const workers = data?.workers || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

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
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validatorStaff"] });
      reset();
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
    reset({
      email: worker.email,
      username: worker.username,
      password: "",
      jobDescription: worker.jobDescription,
      role: worker.role,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (data) => {
    // Only send password if it's not empty
    const submitData = { ...data };
    if (!submitData.password) {
      delete submitData.password;
    }
    updateWorkerMutation(submitData);
  };

  if (isWorkersError) {
    return <p>Error loading workers</p>;
  }

  // Column Definitions
  const columns = [
    {
      header: "ID",
      className: "font-mono text-gray-400 text-left",
      render: (worker) => worker._id.slice(-6),
    },
    {
      header: "Email",
      className: "text-black text-left",
      accessor: "email",
    },
    {
      header: "Username",
      render: (worker) => (
        <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {worker.username}
        </span>
      ),
    },
    {
      header: "Phone",
      className: "text-gray-600",
      render: (worker) =>
        !worker.phoneNumber ? (
          <span className="text-red-500/70 italic">Pending</span>
        ) : (
          worker.phoneNumber
        ),
    },
    {
      header: "Address",
      className: "text-gray-600",
      render: (worker) => (
        <span className="max-w-[200px] truncate block">
          {!worker?.address[0]?.fullAddress ? (
            <span className="text-red-500/70 italic">Pending</span>
          ) : (
            worker?.address[0]?.fullAddress
          )}
        </span>
      ),
    },
    {
      header: "Role",
      render: (worker) => (
        <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {worker.role}
        </span>
      ),
    },
    {
      header: "Job Description",
      className: "text-gray-600",
      accessor: "jobDescription",
    },
    {
      header: "ACTIONS",
      render: (worker) => (
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
      ),
    },
  ];

  return (
    <>
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
        onSubmit={handleSubmit(handleEditSubmit)}
        submitLabel="UPDATE WORKER"
        isSubmitting={isUpdating || isSubmitting}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="editEmail"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              WORKER EMAIL
            </label>
            <ValidatedInput
              type="email"
              id="editEmail"
              {...register("email")}
              error={errors.email}
              placeholder="Ex: worker@example.com"
              required
              maxLength={254}
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
            <ValidatedInput
              type="text"
              id="editUsername"
              {...register("username")}
              error={errors.username}
              placeholder="Ex: JuanDelaCruz"
              required
              maxLength={30}
            />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              (5-50 letters, no numbers or special characters)
            </p>
          </div>

          <PasswordInput
            label="Password (leave blank to keep current)"
            id="editPassword"
            {...register("password")}
            errorText={errors.password?.message}
            placeholder="••••••••"
            maxLength={128}
            autoComplete="new-password"
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="editRole"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500"
            >
              ROLE
            </label>
            <select
              id="editRole"
              {...register("role")}
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
            <ValidatedInput
              type="text"
              id="editJobDescription"
              {...register("jobDescription")}
              error={errors.jobDescription}
              placeholder="Ex: Customer Support & Verification"
              required
              maxLength={200}
            />
          </div>
        </div>
      </FormModal>

      <ReusableTable
        title="Worker Table"
        columns={columns}
        data={workers}
        isLoading={isWorkersPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "search worker...",
        }}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: totalItems,
          onPageChange: setPage,
        }}
        emptyMessage="no worker found!"
      />
    </>
  );
}
