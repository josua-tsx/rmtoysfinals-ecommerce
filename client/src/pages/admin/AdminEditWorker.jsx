import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminEditWorker() {
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate("")

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const {
    data: singleWorker,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["worker"],
    queryFn: async () => {
      const { userId } = params;
      const res = await axiosInstance.get(`/user/get-user/${userId}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (singleWorker) {
      setEmail(singleWorker?.email);
      setUsername(singleWorker?.username);
      setJobDescription(singleWorker?.jobDescription);
      setRole(singleWorker?.role);
    }
  }, [singleWorker]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const { mutate: updateWorkerMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/user/edit-worker/${singleWorker._id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker"] });
      setEmail("")
      setUsername("")
      setJobDescription("")
      setRole("")
      setPassword("")
      toast.success("Successfully worker updated!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleSubmitForm = (e) => {
    e.preventDefault();

    updateWorkerMutation({
      email,
      username,
      password,
      role,
      jobDescription,
    });
  };

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error.</p>;

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"EDIT WORKER"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
            onSubmit={handleSubmitForm}
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
                  <p className="text-xs">SHOW PASSWORD</p>
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
              <label htmlFor="password" className="uppercase mb-2 ">
                ROLE:{" "}
              </label>
              <select
                name="role"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border outline-none border-black rounded-[5px] py-1"
              >
                <option>Select Role</option>
                <option value="staff">Staff</option>
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

          <div className="flex p-2 gap-2">
            <button className="border flex-1 bg-primary text-card rounded-[5px] border-black p-2">
              UPDATE
            </button>
            <button onClick={() => navigate(`/admin/worker`)}
            type="button" className="bg-red-600 w-[20%] border border-black rounded-[5px] text-card ">Cancel</button>
          </div>
        </form>
      </div>
    </section>
  );
}
