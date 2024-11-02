import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminAddWorker() {

    const queryClient = useQueryClient()

    const {mutate: addWorkerMutation} = useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.post(`/auth/add-worker`, data)
            return res.data
        }, 
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']})
            toast.success("Worker Added!")
        },
        onError: (err) => {
            toast.error(err.response.data.message || "something went wrong!")
        }
    })


    const handleAddWorkerFormSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData(e.target)
        const inputs = Object.fromEntries(formData)

        const {email, username, password, confirmPassword, role, jobDescription} = inputs

        addWorkerMutation({email, username, password, confirmPassword, role, jobDescription})
        e.target.reset()

    }


  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"ADD NEW WORKER"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form onSubmit={handleAddWorkerFormSubmit}
        className="border flex flex-col gap-5 relative rounded-[5px] border-black bg-card">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
          <div className="flex gap-2 p-2 flex-col">
            <div className="flex justify-between flex-col">
              <label htmlFor="email" className="uppercase mb-2">
                WORKER EMAIL:{" "}
              </label>
              <input
                type="email"
                name="email"
                id="email"
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
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
              />
            </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="password" className="uppercase mb-2 ">
                Password:{" "}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
              />
            </div>

            <div className="flex justify-between flex-col">
            <label htmlFor="password2" className="uppercase mb-2 ">
              Confirm password:{" "}
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className=" outline-none p-1 border-[#313031] border rounded-[5px]"
            />
          </div>

            <div className="flex justify-between flex-col">
              <label htmlFor="password" className="uppercase mb-2 ">
                ROLE:{" "}
              </label>
             <select name="role" id="role" className="border border-black rounded-[5px] py-1">
                <option>Select Role</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
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
                className=" outline-none p-1  border-[#313031] border rounded-[5px]"
              />
            </div>


          </div>

          <div className="flex flex-col">
            <button className="border bg-primary text-card rounded-b-[5px] p-2">
              ADD WORKER
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
