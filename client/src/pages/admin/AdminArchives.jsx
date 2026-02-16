import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import ArchivedProductsTable from "../../components/admin/archives/ArchivedProductsTable";
import ArchivedCategoriesTable from "../../components/admin/archives/ArchivedCategoriesTable";
import ArchivedSuppliersTable from "../../components/admin/archives/ArchivedSuppliersTable";
import ArchivedWorkersTable from "../../components/admin/archives/ArchivedWorkersTable";
import ArchivedRidersTable from "../../components/admin/archives/ArchivedRidersTable";

export default function AdminArchives() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20 font-main">
      <AdminHeader title={"ARCHIVED ITEMS"} />

      <div className="max-w-[95%] pt-10 mx-auto px-4">
        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 border-b-2 border-black pb-4">
          {["products", "categories", "suppliers", "workers", "riders"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 uppercase font-black text-sm border border-black rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === "products" && <ArchivedProductsTable />}
          {activeTab === "categories" && <ArchivedCategoriesTable />}
          {activeTab === "suppliers" && <ArchivedSuppliersTable />}
          {activeTab === "workers" && <ArchivedWorkersTable />}
          {activeTab === "riders" && <ArchivedRidersTable />}
        </div>
      </div>
    </section>
  );
}
