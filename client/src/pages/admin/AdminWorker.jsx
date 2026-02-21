import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminWorkersTable from "./AdminWorkersTable";
import { IoMdAdd } from "react-icons/io";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import ValidatedInput from "../../reusable/ValidatedInput";
import PasswordInput from "../../reusable/PasswordInput";
import { addWorkerSchema } from "../../schemas/worker.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminWorker() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addWorkerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      jobDescription: "",
      role: "validatorStaff",
    },
  });

  const { mutate: addWorkerMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/auth/add-worker`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validatorStaff"] });
      reset();
      toast.success("Worker Added!");
      setShowAdd(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const onSubmit = (data) => {
    addWorkerMutation(data);
  };

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
    if (!showAdd) reset();
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
          onSubmit={handleSubmit(onSubmit)}
          submitLabel="ADD WORKER"
          isSubmitting={isPending || isSubmitting}
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
                id="email"
                {...register("email")}
                error={errors.email}
                placeholder="Ex: worker@example.com"
                required
                maxLength={254}
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
                id="username"
                {...register("username")}
                error={errors.username}
                placeholder="Ex: JuanDelaCruz"
                required
                maxLength={30}
              />
            </div>

            <PasswordInput
              label="Password"
              id="password"
              {...register("password")}
              errorText={errors.password?.message}
              placeholder="••••••••"
              required
              maxLength={128}
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              id="confirmPassword"
              {...register("confirmPassword")}
              errorText={errors.confirmPassword?.message}
              placeholder="••••••••"
              required
              maxLength={128}
              autoComplete="new-password"
            />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="role"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                ROLE
              </label>
              <select
                id="role"
                {...register("role")}
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
                id="jobDescription"
                {...register("jobDescription")}
                error={errors.jobDescription}
                placeholder="Ex: Customer Support & Verification"
                required
                maxLength={200}
              />
            </div>
          </div>
        </FormModal>

        <AdminWorkersTable />
      </div>
    </section>
  );
}
