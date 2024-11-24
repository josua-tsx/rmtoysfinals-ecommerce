import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

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
  "create_gcashQR"
];

export default function AdminAdminLogs() {
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

  console.log(adminLogs);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error.</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>ADMIN LOGS</h1>
        {/* <div className="flex items-center relative">
          <input
            type="text"
            placeholder="search products.."
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div> */}
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
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
            {adminLogs.length > 0 ? (
              adminLogs.map((admin) => (
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
                            <p> Deleted {admin.details?.categoryName} category</p>
                          )}
                        {/* /////////////////////////////// */}

                        {/* /////////////////////////////// */}
                        {admin.action === "update_category" &&
                          admin.details?.categoryName && (
                            <p> Updated {admin.details?.categoryName} category</p>
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
                          admin.details?.gcashName && admin.details?.gcashStatus && (
                           <div>
                               <p> Updated {admin.details?.gcashName}</p>
                               <p> Status to {admin.details?.gcashStatus}</p>
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
      </div>
    </div>
  );
}
