import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdRestore } from "react-icons/md";
import axiosInstance from "../../../lib/axios";
import AdminTableSkeleton from "../../skeleton/AdminTableSkeleton";
import toast from "react-hot-toast";

export default function ArchivedRidersTable() {
  const queryClient = useQueryClient();

  const { data: riders = [], isPending } = useQuery({
    queryKey: ["archivedRiders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/rider/get-archived-riders");
      return res.data;
    },
  });

  const { mutate: restoreRider } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/rider/restore-rider/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedRiders"] });
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Rider restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring rider"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this rider?")) {
      restoreRider(id);
    }
  };

  if (isPending) {
    return (
      <div className="p-4">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b-2 border-black">
          <th className="p-4 font-black uppercase">Name</th>
          <th className="p-4 font-black uppercase">Phone Number</th>
          <th className="p-4 font-black uppercase">Status</th>
          <th className="p-4 font-black uppercase text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-black">
        {riders.length > 0 ? (
          riders.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="p-4 font-bold">{item.riderName}</td>
              <td className="p-4 font-mono">{item.riderPhoneNumber}</td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded text-xs border border-black uppercase font-bold ${
                    item.riderStatus === "available"
                      ? "bg-green-200"
                      : "bg-red-200"
                  }`}
                >
                  {item.riderStatus}
                </span>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleRestore(item._id)}
                  className="bg-green-500 text-white p-2 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                  title="Restore"
                >
                  <MdRestore size={20} />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="4"
              className="p-8 text-center text-gray-500 uppercase tracking-widest font-bold"
            >
              No archived riders found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
