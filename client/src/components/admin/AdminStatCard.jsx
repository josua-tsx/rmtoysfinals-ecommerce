export default function AdminStatCard({title, value, value2}) {
  return (
    <div className='bg-card border-black border rounded-[5px] '>
        <div className='px-4 py-3 md:py-5 flex flex-col gap-2'>
				<span className=' text-sm  md:text-xl'>
					{title}
				</span>
				<div className="flex flex-row md:flex-col gap-2 justify-between  ">
        <p className='text-2xl md:text-3xl'>{value}</p>
				<p className='text-sm flex justify-end'>{value2}</p>
        </div>
			</div>
    </div>
  )
}
