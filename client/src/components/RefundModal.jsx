import { IoIosClose } from "react-icons/io"


export default function RefundModal({order, onClose}) {

  return (
    <section className="inset-0 z-50 fixed overflow-y-auto md:overflow-y-hidden backdrop-blur-sm  p-3">
        <div className="h-screen relative flex flex-col justify-center items-center">
            <div className="border border-black w-full md:w-[550px] relative bg-card rounded-[5px]">

                     {/* close button */}
             <button onClick={onClose} className="absolute border  border-black  text-card bg-primary rounded-[5px] px-5 right-0 -top-8">
              <IoIosClose size={25}/>
            </button>

                <div className="p-2">

                    <div className="flex flex-col gap-2">
                        <p>How to refund?</p>

                        <div className="text-sm flex flex-col gap-1">
                            <div className="flex gap-2">
                                <p>Step 1:</p>
                                <p className="">Copy the order information below.</p>
                            </div>
                            <div className="flex gap-2">
                                <p>Step 2:</p>
                                <p className="">Click the link here: <a className="underline text-indigo-700" href="https://www.facebook.com/Rmcarsandmotorbikes">facebook page link here!</a> </p>
                            </div>
                            <div className="flex gap-2">
                                <p>Step 3:</p>
                                <p className="">Paste the order information you previously copied and state your reason for refund.</p>
                            </div>
                        </div>


                        <div className="flex flex-col gap-2">
                            <p>Copy information below!</p>

                            <div className="text-sm flex flex-col gap-1">
                                <div className="flex gap-2">
                                    <p>Order ID: </p>
                                    <p className="text-indigo-700">{order._id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <p>Email: </p>
                                    <p className="text-indigo-700">{order.userId?.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <p>Full name: </p>
                                    <p className="text-indigo-700">{order.userId?.fullName}</p>
                                </div>
                                <div className="flex gap-2">
                                    <p>Phone Number: </p>
                                    <p className="text-indigo-700">{order.userId?.phoneNumber}</p>
                                </div>
                            </div>

                        </div>
                    </div>



                </div>

  

            </div>
        </div>
    </section>
  )
}
