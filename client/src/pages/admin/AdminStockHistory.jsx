import React from 'react'
import AdminHeader from '../../reusable/Admin/AdminHeader'
import AdminOrderStockHistoryTable from './AdminOrderStockHistoryTable'

export default function AdminStockHistory() {
  return (
        <section className="bg-yellow h-screen">
          <AdminHeader title={"Order / Reorder Stock History"} />
          <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-10 flex-col">
            {/* main */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
              <AdminStatCard title={"TOTAL EXPENSES"} value={`2000 PHP`} />
            </div> */}
    
            <AdminOrderStockHistoryTable />
          </div>
        </section>
  )
}
