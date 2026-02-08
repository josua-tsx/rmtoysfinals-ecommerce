import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdRestore } from "react-icons/md";
import axiosInstance from "../../../lib/axios";
import LoadingSpinner from "../../../reusable/LoadingSpinner";
import toast from "react-hot-toast";

export default function ArchivedWorkersTable() {
  const queryClient = useQueryClient();

  const { data: workers = [], isPending } = useQuery({
    queryKey: ["archivedWorkers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/get-archived-workers");
      return res.data;
    },
  });

  const { mutate: restoreWorker } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/user/restore-worker/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedWorkers"] });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring worker"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this worker?")) {
      restoreWorker(id);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b-2 border-black">
          <th className="p-4 font-black uppercase">Name</th>
          <th className="p-4 font-black uppercase">Phone Number</th>
          <th className="p-4 font-black uppercase text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-black">
        {workers.length > 0 ? (
          workers.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="p-4 font-bold">
                <div className="flex flex-col">
                  <span>{item.fullName || item.username}</span>
                  <span className="text-xs text-gray-500 font-normal">
                    {item.email}
                  </span>
                  <span className="text-xs text-indigo-500 font-black uppercase">
                    {item.role}
                  </span>
                </div>
              </td>
              <td className="p-4 font-mono">{item.phoneNumber || "N/A"}</td>
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
              colSpan="3"
              className="p-8 text-center text-gray-500 uppercase tracking-widest font-bold"
            >
              No archived workers found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
