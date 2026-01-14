import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminWorkersTable from "./AdminWorkersTable";
import { IoMdAdd } from "react-icons/io";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import ValidatedInput from "../../reusable/ValidatedInput";
import {
  addWorkerSchema,
  jobDescriptionSchema,
} from "../../schemas/worker.schema";
import {
  emailSchema,
  usernameSchema,
  passwordSchema,
} from "../../schemas/auth.schema";

export default function AdminWorker() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  // Add Form State
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState("validatorStaff"); // Default role

  const { mutate: addWorkerMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/auth/add-worker`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validatorStaff"] });
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setJobDescription("");
      toast.success("Worker Added!");
      setShowAdd(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const result = addWorkerSchema.safeParse({
      email,
      username,
      password,
      confirmPassword,
      role,
      jobDescription,
    });

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    addWorkerMutation(result.data);
  };

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
  };

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"WORKER TABLE"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <div className="flex gap-4">
              <button
                onClick={toggleAddCategory}
                className="flex items-center gap-3 bg-indigo-600 text-white border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group"
              >
                {showAdd ? "CANCEL ADD" : "ADD WORKER"}
                <IoMdAdd
                  className={`text-xl transition-transform ${
                    showAdd ? "rotate-45" : "group-hover:scale-125"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <FormModal
          isOpen={showAdd}
          title="Add Worker"
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddSubmit}
          submitLabel="ADD WORKER"
          isSubmitting={isPending}
        >
          <div className="flex gap-4 p-2 flex-col">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                WORKER EMAIL
              </label>
              <ValidatedInput
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: worker@example.com"
                schema={emailSchema}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="username"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Username
              </label>
              <ValidatedInput
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: JuanDelaCruz"
                schema={usernameSchema}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Password
              </label>
              <ValidatedInput
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                schema={passwordSchema}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Confirm password
              </label>
              <ValidatedInput
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="role"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                ROLE
              </label>
              <select
                name="role"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-black rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
                required
              >
                <option value="validatorStaff">Validator Staff</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="jobDescription"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Job Description
              </label>
              <ValidatedInput
                type="text"
                name="jobDescription"
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Ex: Customer Support & Verification"
                schema={jobDescriptionSchema}
                required
              />
            </div>
          </div>
        </FormModal>

        <AdminWorkersTable />
      </div>
    </section>
  );
}
