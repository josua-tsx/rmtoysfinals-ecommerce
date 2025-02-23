

export default function AdminHeader({title}) {
  return (
    <header className='bg-card p-3 px-7 uppercase flex justify-between items-center mx-auto w-full border-b-gray-500  border'>
         <h1 className=" font-main text-2xl">{title}</h1>
     
    </header>
  )
}
