import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import LoadingSpinner from "../../reusable/LoadingSpinner";

const ACTION_TYPES = ["user_add_order", "newly_created_user", "user_added_review"];

export default function AdminCustomerLogs() {

  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: customerLogs = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["customerLogs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/audit/customer`);
      return res.data;
    },
  });

  const arrayCustomerLogs = Array.isArray(customerLogs) ? customerLogs : []

  const filteredArrayCustomerLogs = arrayCustomerLogs.filter((logs) => (
    logs.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    logs.targetId.includes(searchTerm) 
  ))


  if (isError) return <p>Error.</p>;


  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>ADMIN LOGS</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search products.."
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          {/* <IoSearch className="absolute right-0" size={30} /> */}
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
              <th className="font-normal p-2 pb-5">TIMESTAMPS</th>
              <th className="font-normal p-2 pb-5">ACTION</th>
              <th className="font-normal p-2 pb-5">AFFECTED ID</th>
              <th className="font-normal p-2 pb-5">CUSTOMER EMAIL</th>
              <th className="font-normal p-2 pb-5">ROLE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {filteredArrayCustomerLogs.length > 0 ? (
              filteredArrayCustomerLogs.map((customer) => (
                <tr key={customer._id}>
                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2">
                    {new Date(customer.timestamp).toLocaleString()}
                  </td>

                  {/* IF ACTION_TYPES INCLUDES OTHE customer ACTION */}
                  {ACTION_TYPES.includes(customer.action) ? (
                    <td className="px-4 text-green-700 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {customer.action}
                    </td>
                  ) : (
                    <td className="px-4 text-red-700 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {customer.action}
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <div>
                      {customer.targetId}
                      <div className="flex gap-2 justify-center">

                        {/* /////////////////////////////// */}
                        {customer.action === "user_add_order" &&
                          customer.details?.description&&
                         (
                            <div className="flex gap-2">
                              <p className="text-blue-700">{customer.details?.description}</p>
                             
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {customer.action === "user_cancelled_order" &&
                          customer.details?.description&&
                         (
                            <div className="flex gap-2">
                              <p className="text-blue-700">{customer.details?.description}</p>
                             
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {customer.action === "newly_created_user" &&
                          customer.details?.description&&
                         (
                            <div className="flex gap-2">
                              <p className="text-blue-700">{customer.details?.description}</p>
                             
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {customer.action === "user_added_review" &&
                          customer.details?.description&&
                         (
                            <div className="flex gap-2">
                              <p className="text-blue-700">{customer.details?.description}</p>
                             
                            </div>
                          )}

                        {/* /////////////////////////////// */}
                        {customer.action === "user_deleted_review" &&
                          customer.details?.description&&
                         (
                            <div className="flex gap-2">
                              <p className="text-blue-700">{customer.details?.description}</p>
                             
                            </div>
                          )}
                        {/* /////////////////////////////// */}


                      
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {customer.userId?.email}
                  </td>

                  <td className="px-4 text-indigo-700 py-4 uppercase whitespace-nowrap text-center text-sm">
                    {customer.role}
                  </td>
                </tr>
              ))
            ) : (
              <p>No admin logs.</p>
            )}
          </tbody>
        </table>
          )
        }
      </div>
    </div>
  );
}
