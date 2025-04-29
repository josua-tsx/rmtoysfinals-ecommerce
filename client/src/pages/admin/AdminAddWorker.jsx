import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { useNavigate } from "react-router-dom";

export default function AdminAddWorker() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const { mutate: addWorkerMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/auth/add-worker`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setJobDescription("");
      toast.success("Worker Added!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleAddWorkerFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { role } = inputs;

    addWorkerMutation({
      email,
      username,
      password,
      confirmPassword,
      role,
      jobDescription,
    });
    e.target.reset();
  };

  return (
    <section className="bg-yellow text-sm md:text-normal h-screen font-main">
      <AdminHeader title={"ADD NEW WORKER"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleAddWorkerFormSubmit}
          className="border flex flex-col gap-5 relative rounded-[5px] border-black bg-card"
        >
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
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
                onChange={handleInputChange(setEmail)}
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
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
                onChange={handleInputChange(setUsername)}
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
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
                  onChange={handleInputChange(setPassword)}
                  className=" outline-none p-2 w-full border-[#313031] border rounded-[5px]"
                />
                <label
                  htmlFor=""
                  className="absolute right-2 top-3 flex items-center gap-2"
                >
                  <p className="text-xs">Show Password</p>
                  <input
                    type="checkbox"
                    onChange={togglePassword}
                    checked={showPassword}
                    className="border  size-[20px] border-black"
                  />
                </label>
                <p className="text-sm text-green-700">
                  (Password must be at least 8 characters, include one uppercase
                  letter, one number, and one special character.)
                </p>
              </div>
            </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="password2" className="uppercase mb-2 ">
                Confirm password:{" "}
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange(setConfirmPassword)}
                className=" outline-none p-1 border-[#313031] border rounded-[5px]"
              />
            </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="password" className="uppercase mb-2 ">
                ROLE:{" "}
              </label>
              <select
                name="role"
                id="role"
                className="border outline-none border-black rounded-[5px] py-1"
              >
                <option>Select Role</option>
                <option value="validatorStaff">Validator Staff</option>
              </select>
            </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="password" className="uppercase mb-2 ">
                Job Description:{" "}
              </label>
              <input
                type="text"
                name="jobDescription"
                id="jobDescription"
                value={jobDescription}
                onChange={handleInputChange(setJobDescription)}
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row p-2 gap-2">
            <button className="border flex-1 bg-primary text-card rounded-[5px] border-black p-2">
              ADD WORKER
            </button>
            <button
              onClick={() => navigate(`/admin/worker`)}
              type="button"
              className="bg-red-600 w-full p-2 md:w-[20%] border border-black rounded-[5px] text-card "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
