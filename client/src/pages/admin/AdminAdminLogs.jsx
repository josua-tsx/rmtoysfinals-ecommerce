import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import LoadingSpinner from "../../reusable/LoadingSpinner";

const ACTION_TYPES = [
  "create_product",
  "update_product",
  "draft_product",
  "published_addStock_product",
  "updated_product_stockQuantity",
  "create_supplier",
  "update_supplier",
  "create_category",
  "update_category",
  "create_gcashQR",
  "set_OrderStatus_delivered",
  "set_OrderStatus_Processing",
  "set_OrderStatus_Shipped",
  "set_OrderStatus_OutforDelivery",
  "admin_add_worker",
  "admin_edit_worker",
];

export default function AdminAdminLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: adminLogs = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/audit/admin`);
      return res.data;
    },
  });

  const arrayAdminLogs = Array.isArray(adminLogs) ? adminLogs : [];

  const filteredArrayAdminLogs = arrayAdminLogs.filter(
    (logs) =>
      logs.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      logs.targetId.includes(searchTerm)
  );


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
            {filteredArrayAdminLogs.length > 0 ? (
              filteredArrayAdminLogs.map((admin) => (
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
                        {admin.action === "create_product" &&
                          admin.details?.productName &&
                          admin.details?.price && (
                            <div className="flex gap-2">
                              <p>Created: {admin.details.productName}</p>
                              <p>price: {admin.details.price}</p>
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "update_product" &&
                          admin.details?.productName &&
                          admin.details?.price && (
                            <div className="flex gap-2">
                              <p>Updated: {admin.details.productName}</p>
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "delete_product" &&
                          admin.details?.productName &&
                          admin.details?.price && (
                            <div className="flex gap-2">
                              <p>Deleted: {admin.details.productName}</p>
                              <p>price: {admin.details.price}</p>
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "published_addStock_product" &&
                          admin.details?.quantity && (
                            <p>
                              {" "}
                              Published product and added{" "}
                              {admin.details?.quantity} stock
                            </p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "updated_product_stockQuantity" &&
                          admin.details?.quantity && (
                            <p> Updated stock to {admin.details?.quantity} </p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "create_supplier" &&
                          admin.details?.supplierName && (
                            <p> Added a {admin.details?.supplierName} </p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "update_supplier" &&
                          admin.details?.supplierName && (
                            <p> Updated {admin.details?.supplierName} </p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "delete_supplier" &&
                          admin.details?.supplierName && (
                            <p> Deleted {admin.details?.supplierName}</p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "create_category" &&
                          admin.details?.categoryName && (
                            <p> Added {admin.details?.categoryName} category</p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "delete_category" &&
                          admin.details?.categoryName && (
                            <p>
                              {" "}
                              Deleted {admin.details?.categoryName} category
                            </p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "update_category" &&
                          admin.details?.categoryName && (
                            <p>
                              {" "}
                              Updated {admin.details?.categoryName} category
                            </p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "create_gcashQR" &&
                          admin.details?.gcashName && (
                            <p> Created {admin.details?.gcashName}</p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "delete_gcashQR" &&
                          admin.details?.gcashName && (
                            <p> Created {admin.details?.gcashName}</p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "update_gcashStatus" &&
                          admin.details?.gcashName &&
                          admin.details?.gcashStatus && (
                            <div>
                              <p> Updated {admin.details?.gcashName}</p>
                              <p> Status to {admin.details?.gcashStatus}</p>
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "set_OrderStatus_delivered" &&
                          admin.details?.email && (
                            <div>
                              <p> Order of {admin.details?.email}</p>
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "set_OrderStatus_Processing" &&
                          admin.details?.email && (
                            <div>
                              <p> Order of {admin.details?.email}</p>
                            </div>
                          )}

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

                        {/* /////////////////////////////// */}
                        {admin.action === "admin_add_worker" &&
                          admin.details?.email && (
                            <div className="text-sm">
                              <p> Added {admin.details?.email}</p>
                              <p> job: {admin.details?.job}</p>
                              <p>
                                {" "}
                                jobDescription: {admin.details?.jobDescription}
                              </p>
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "admin_delete_worker" &&
                          admin.details?.email && (
                            <div className="text-sm">
                              <p> Added {admin.details?.email}</p>
                              <p> job: {admin.details?.job}</p>
                              <p>
                                {" "}
                                jobDescription: {admin.details?.jobDescription}
                              </p>
                            </div>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "admin_edit_worker" &&
                          admin.details?.email && (
                            <div className="text-sm">
                              <p> Added {admin.details?.email}</p>
                              <p> job: {admin.details?.job}</p>
                              <p>
                                {" "}
                                jobDescription: {admin.details?.jobDescription}
                              </p>
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
