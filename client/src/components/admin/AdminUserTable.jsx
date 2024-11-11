import { useQuery } from "@tanstack/react-query";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";

export default function AdminUserTable() {

    const {data: users=[], isPending, isError} = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await axiosInstance.get(`/user/getAllCustomer`)
            return res.data
        }
    })

    console.log(users)

    

    if (isPending) {
        return <p>loading...</p>
    }

    if (isError) {
        return <p>error...</p>
    }

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
    <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
      <h1>USERS TABLE</h1>
      <div className="flex items-center relative">
        <input
          type="text"
          placeholder="search products.."
          className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
        />
        <IoSearch className="absolute right-0" size={30} />
      </div>
    </div>
    <div className="overflow-y-auto  h-[600px] py-3">
      <table className="w-full divide-y divide-gray-700">
        <thead>
          <tr className="">
            <th className="font-normal p-2 pb-5">ID</th>
            <th className="font-normal p-2 pb-5">Email</th>
            <th className="font-normal p-2 pb-5">Username</th>
            <th className="font-normal p-2 pb-5">Phone Number</th>
            <th className="font-normal p-2 pb-5">Active Address</th>
            <th className="font-normal p-2 pb-5">Role</th>
            <th className="font-normal p-2 pb-5">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 ">
       
              {
                users.length > 0 && users.map((user) => (
                    <tr key={user._id} >
                <td className="px-4 ">{user._id}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                
     
                </td>
                    {user.email}
                <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
  
                    {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    { !user.phoneNumber ? "not updated yet" : user.phoneNumber}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {!user?.address[0]?.fullAddress ? <span className="text-red-700">not updated yet</span> : user?.address[0]?.fullAddress }
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {user.role}
                </td>
            
                <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                
                  <button
                
                    className="text-red-600 hover:text-red-300"
                  >
                    <MdDelete size={25} />
                  </button>
               
                </td>
              </tr>
                ))
              }

        </tbody>
      </table>
    </div>
  </div>
  )
}
