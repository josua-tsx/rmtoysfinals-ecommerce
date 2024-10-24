import AdminHeader from '../../reusable/Admin/AdminHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminUserTable from '../../components/admin/AdminUserTable'
// import AdminWorkersTable from './AdminWorkersTable'

export default function AdminUser() {
  return (
    <section className="bg-yellow h-screen">
    <AdminHeader title={"Stocks"}/>
    <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-10 flex-col">

      {/* main */}
      <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
       
         <AdminStatCard title={"TOTAL PRODUCTS"} value={98}/>
          <AdminStatCard title={"TOTAL CATEGORIES"} value={5}/>
          <AdminStatCard title={"STOCKS"} value={98}/>
          <AdminStatCard title={"SUPPLIERS"} value={5}/>
      </div>


        {/* <AdminWorkersTable/> */}
        <AdminUserTable/>
     
    </div>
  </section>
  )
}
