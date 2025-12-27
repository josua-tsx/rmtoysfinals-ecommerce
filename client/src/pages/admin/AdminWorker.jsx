import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminWorkersTable from "./AdminWorkersTable";
import { IoMdAdd } from "react-icons/io";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

import PasswordInput from "../../reusable/PasswordInput";

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
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    addWorkerMutation({
      email,
      username,
      password,
      confirmPassword,
      role,
      jobDescription,
    });
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
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
              >
                WORKER EMAIL
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                maxLength={254}
                onChange={handleInputChange(setEmail)}
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
                htmlFor="username"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                maxLength={50}
                onChange={handleInputChange(setUsername)}
                placeholder="Ex: JuanDelaCruz"
                className="border border-black rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors"
                required
              />
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                (5-50 letters, no numbers or special characters)
              </p>
            </div>

            <PasswordInput
              label="Password"
              name="password"
              value={password}
              onChange={handleInputChange(setPassword)}
              errorText="(Min 8 chars, 1 uppercase, 1 number, 1 special char)"
              required
            />

            <PasswordInput
              label="Confirm password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              required
            />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="role"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
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
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
              >
                Job Description
              </label>
              <input
                type="text"
                name="jobDescription"
                id="jobDescription"
                value={jobDescription}
                maxLength={200}
                onChange={handleInputChange(setJobDescription)}
                placeholder="Ex: Customer Support & Verification"
                className="border border-black rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors"
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
