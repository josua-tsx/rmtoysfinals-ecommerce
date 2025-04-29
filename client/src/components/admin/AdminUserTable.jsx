import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoSearch } from "react-icons/io5";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminUserTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const {
    data: users = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/user/getAllCustomer`);
      return res.data;
    },
  });

  const { mutate: updateUserStatusMutation } = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosInstance.put(`/user/update-status/${id}`, {
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Successfully updated status!`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const handleStatusChange = (id, e) => {
    const newStatus = e.target.value;

    updateUserStatusMutation({ id, status: newStatus });
  };

  const arrayCustomer = Array.isArray(users) ? users : [];

  const filteredArrayCustomer = arrayCustomer.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer._id.includes(searchTerm) ||
      customer.status.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (isError) {
    return <p>error...</p>;
  }

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative ">
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>USERS TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search user.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {
          isPending ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner/>
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="">
              <th className="font-normal p-2 pb-5">ID</th>
              <th className="font-normal p-2 pb-5">Email</th>
              <th className="font-normal p-2 pb-5">Username</th>
              <th className="font-normal p-2 pb-5">Credits</th>
              <th className="font-normal p-2 pb-5">Phone Number</th>
              <th className="font-normal p-2 pb-5">Active Address</th>
              <th className="font-normal p-2 pb-5">Status</th>
              <th className="font-normal p-2 pb-5">Role</th>
              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {filteredArrayCustomer.length > 0 &&
              filteredArrayCustomer.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 ">{user._id}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium  gap-2	">
                    {user.email}
                  </td>
                  <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {user.username}
                  </td>
                  <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {user.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {!user.phoneNumber ? (
                      <span className="text-red-700">not updated yet</span>
                    ) : (
                      user.phoneNumber
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {!user?.address[0]?.fullAddress ? (
                      <span className="text-red-700">not updated yet</span>
                    ) : (
                      user?.address[0]?.fullAddress
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {user.status}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {user.role}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user._id, e)}
                      className="border border-black p-1 outline-none rounded-[5px]"
                    >
                      <option value="active">ACTIVE</option>
                      <option value="blocked">BLOCKED</option>
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
          )
        }
      </div>
    </div>
  );
}
