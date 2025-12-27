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
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Users Table
        </h1>
      </div>

      <div className="flex-col border-b-2 border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Customers
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Juan Cruz..."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[600px] py-3">
        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black relative">
              <tr>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Customer
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Username
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Credits
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Phone
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Address
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Status
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Role
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredArrayCustomer.length > 0 ? (
                filteredArrayCustomer.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px] text-black">
                          {user.email}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          ID: {user._id.slice(-6)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {user.username}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-black">
                      {user.credits}
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {!user.phoneNumber ? (
                        <span className="text-red-500/70 italic">Pending</span>
                      ) : (
                        user.phoneNumber
                      )}
                    </td>

                    <td className="p-4 text-gray-600 max-w-[250px] truncate">
                      {!user?.address[0]?.fullAddress ? (
                        <span className="text-red-500/70 italic">
                          No Address Set
                        </span>
                      ) : (
                        user?.address[0]?.fullAddress
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 border border-black rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user._id, e)}
                          className="border border-black p-1 text-[11px] font-black uppercase outline-none rounded-[5px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer appearance-none px-4"
                        >
                          <option value="active">✓ Activate</option>
                          <option value="blocked">✗ Block</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center font-black uppercase text-gray-400 tracking-widest"
                  >
                    no customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
// AdminUserTable has no props currently, so PropTypes not strictly required yet,
// but added for consistency if we decide to pass any later.
