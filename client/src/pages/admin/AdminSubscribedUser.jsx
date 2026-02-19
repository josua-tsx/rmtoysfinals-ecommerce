import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminSubscribedUsersTable from "./AdminSubscribedUsersTable";

export default function AdminSubscribedUser() {
  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"SUBSCRIBED USERS"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area (Information Only for now) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <p className="text-gray-400 text-xs italic pl-1">
              Viewing all users currently subscribed to the newsletter.
            </p>
          </div>
        </div>

        <AdminSubscribedUsersTable />
      </div>
    </section>
  );
}
