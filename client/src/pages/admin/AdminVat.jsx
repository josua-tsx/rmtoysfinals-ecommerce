import AdminHeader from '../../reusable/Admin/AdminHeader'
import AdminVatTable from './AdminVatTable'


export default function AdminVat() {
  return (
    <section className="bg-yellow h-screen">
         <AdminHeader title={"VAT"} />
         <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-10 flex-col">
           {/* main */}
           {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
             <AdminStatCard title={"TOTAL EXPENSES"} value={`2000 PHP`} />
           </div> */}

            <AdminVatTable/>
     
         </div>
       </section>
  )
}
