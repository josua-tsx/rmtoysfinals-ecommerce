import React, { useState } from "react";
import axiosInstance from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IoSearch } from "react-icons/io5";
import LoadingSpinner from "../../reusable/LoadingSpinner";

const ACTION_TYPES = [
    "set_OrderStatus_delivered",
    "set_OrderStatus_Processing",
    "set_OrderStatus_Shipped",
    "set_OrderStatus_OutforDelivery",
    "set_OrderStatus_Cancelled",

    "set_PaymentStatus_Failed"
  ];

export default function AdminValidatorStaffLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: validatorStaff = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["validatorStaff"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/audit/validatorStaff`);
      return res.data;
    },
  });

  const arrayValidatorStaff = Array.isArray(validatorStaff)
    ? validatorStaff
    : [];

  const filteredArrayValidatorLogs = arrayValidatorStaff.filter(
    (logs) =>
      logs.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      logs.targetId.includes(searchTerm)
  );

  if (isError) return <p>Error.</p>

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
             <IoSearch className="absolute right-0" size={30} />
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
                 <th className="font-normal p-2 pb-5">ADMIN EMAIL</th>
                 <th className="font-normal p-2 pb-5">ROLE</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-700 ">
               {filteredArrayValidatorLogs.length > 0 ? (
                 filteredArrayValidatorLogs.map((admin) => (
                   <tr key={admin._id}>
                     <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2">
                       {new Date(admin.timestamp).toLocaleString()}
                     </td>
   
                     {/* IF ACTION_TYPES INCLUDES OTHE ADMIN ACTION */}
                     {ACTION_TYPES.includes(admin.action) ? (
                       <td className="px-4 text-green-700 py-4 uppercase whitespace-nowrap text-center text-sm">
                         {admin.action}
                       </td>
                     ) : (
                       <td className="px-4 text-red-700 py-4 uppercase whitespace-nowrap text-center text-sm">
                         {admin.action}
                       </td>
                     )}
   
                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                       <div>
                         {admin.targetId}
                         <div className="flex gap-2 justify-center">
                          
                           {/* /////////////////////////////// */}
                           {admin.action === "set_OrderStatus_Shipped" &&
                             admin.details?.email && (
                               <div>
                                 <p> Order of {admin.details?.email}</p>
                               </div>
                             )}
                           {/* /////////////////////////////// */}
   
                           {/* /////////////////////////////// */}
                           {admin.action === "set_OrderStatus_OutforDelivery" &&
                             admin.details?.email && (
                               <div>
                                 <p> Order of {admin.details?.email}</p>
                               </div>
                             )}
                           {/* /////////////////////////////// */}
   
                           {/* /////////////////////////////// */}
                           {admin.action === "set_OrderStatus_Cancelled" &&
                             admin.details?.email && (
                               <div>
                                 <p> Order of {admin.details?.email}</p>
                               </div>
                             )}
                           {/* /////////////////////////////// */}
   
                           {/* /////////////////////////////// */}
                           {admin.action === "set_PaymentStatus_paid" &&
                             admin.details?.email && (
                               <div>
                                 <p> Order of {admin.details?.email}</p>
                               </div>
                             )}
                           {/* /////////////////////////////// */}
   
                           {/* /////////////////////////////// */}
                           {admin.action === "set_PaymentStatus_Failed" &&
                             admin.details?.email && (
                               <div>
                                 <p> Order of {admin.details?.email}</p>
                               </div>
                             )}
                           {/* /////////////////////////////// */}
   
                           {/* /////////////////////////////// */}
                           {admin.action === "set_PaymentStatus_Refunded" &&
                             admin.details?.email && (
                               <div>
                                 <p> Order of {admin.details?.email}</p>
                               </div>
                             )}
                           {/* /////////////////////////////// */}
   
                           {/* /////////////////////////////// */}
                           {admin.action === "cancelled_Order_Transact" &&
                             admin.details?.email && (
                               <div>
                                 <p> Order of {admin.details?.email}</p>
                               </div>
                             )}
                           {/* /////////////////////////////// */}
   
             
                         </div>
                       </div>
                     </td>
   
                     <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                       {admin.userId?.email}
                     </td>
   
                     <td className="px-4 text-indigo-700 py-4 uppercase whitespace-nowrap text-center text-sm">
                       {admin.role}
                     </td>
                   </tr>
                 ))
               ) : (
                 <p className="">No Validator logs.</p>
               )}
             </tbody>
           </table>
             )
           }
         </div>
       </div>
  );
}
