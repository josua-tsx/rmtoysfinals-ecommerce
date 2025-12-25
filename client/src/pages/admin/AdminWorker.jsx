import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminWorkersTable from "./AdminWorkersTable";
import { IoMdAdd } from "react-icons/io";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

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
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"WORKER TABLE"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* <AdminStatCard title={"TOTAL PRODUCTS"} value={98}/>
          <AdminStatCard title={"TOTAL CATEGORIES"} value={5}/>
          <AdminStatCard title={"STOCKS"} value={98}/>
          <AdminStatCard title={"SUPPLIERS"} value={5}/> */}
        </div>

        <div className="w-full  flex justify-end">
          <button
            onClick={toggleAddCategory}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px]"
          >
            {showAdd ? "Cancel" : "Add Worker"}
            <IoMdAdd />
          </button>
        </div>

        <FormModal
          isOpen={showAdd}
          title="Add Worker"
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddSubmit}
          submitLabel="Add Worker"
          isSubmitting={isPending}
        >
          <div className="flex gap-2 p-2 flex-col">
            <div className="flex justify-between flex-col">
              <label htmlFor="email" className="uppercase mb-2">
                WORKER EMAIL:{" "}
              </label>
              <input
                type="text"
                name="email"
                id="email"
                value={email}
                maxLength={254}
                onChange={handleInputChange(setEmail)}
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
                required
              />
              <p className="text-sm pt-1 text-green-700">
                (Enter a valid email.)
              </p>
            </div>
            <div className="flex justify-between flex-col">
              <label htmlFor="username" className="uppercase mb-2 ">
                Username:{" "}
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                maxLength={50}
                onChange={handleInputChange(setUsername)}
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
                required
              />
              <p className="text-sm pt-1 text-green-700">
                (Username must be 5-50 letters and contain no numbers or special
                characters.)
              </p>
            </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="password" className="uppercase mb-2 ">
                Password:{" "}
              </label>
              <div className="flex flex-col  gap-2 relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password}
                  maxLength={128}
                  onChange={handleInputChange(setPassword)}
                  className=" outline-none p-2 w-full border-[#313031] border rounded-[5px]"
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-2 top-3 flex items-center gap-2 cursor-pointer"
                >
                  <p className="text-xs">Show Password</p>
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
              <label htmlFor="confirmPassword" className="uppercase mb-2 ">
                Confirm password:{" "}
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                maxLength={128}
                onChange={handleInputChange(setConfirmPassword)}
                className=" outline-none p-1 border-[#313031] border rounded-[5px]"
                required
              />
            </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="role" className="uppercase mb-2 ">
                ROLE:{" "}
              </label>
              <select
                name="role"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border outline-none border-black rounded-[5px] py-1"
                required
              >
                <option value="validatorStaff">Validator Staff</option>
                {/* Add other roles if needed */}
              </select>
            </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="jobDescription" className="uppercase mb-2 ">
                Job Description:{" "}
              </label>
              <input
                type="text"
                name="jobDescription"
                id="jobDescription"
                value={jobDescription}
                maxLength={200}
                onChange={handleInputChange(setJobDescription)}
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
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
