import { Link, useNavigate } from "react-router-dom"


export default function PurchaseCancelPage() {


    const navigate = useNavigate()

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
		
				<div className='p-6 sm:p-8 flex flex-col items-center'>
					
					<h1 className='text-2xl sm:text-3xl text-center text-red-500 mb-6'>Purchase Cancelled</h1>
					<p className=' text-center mb-6'>
						Your order has been cancelled. No charges have been made.
					</p>
					<div className='    mb-6'>
						<p className=''>
							If you encountered any issues during the checkout process, please don&apos;t hesitate to
							contact our support team.
						</p>
					</div>
					<div className='space-y-4'>
						<Link to={"/"} className="border border-black p-2 rounded-[5px] bg-primary text-card">
                            Return to shop
                        </Link>
					</div>
				</div>
		</div>
  )
}
