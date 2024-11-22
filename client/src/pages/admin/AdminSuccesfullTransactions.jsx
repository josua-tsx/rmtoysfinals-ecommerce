import React from 'react'

export default function AdminSuccesfullTransactions() {
  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>SUCCESFULL TRANSACTIONS</h1>
        {/* <div className="flex items-center relative">
          <input
            type="text"
            placeholder="search products.."
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div> */}
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="">
              <th className="font-normal p-2 pb-5">ORDER ID</th>
              <th className="font-normal p-2 pb-5">CUSTOMER EMAIL</th>
              <th className="font-normal p-2 pb-5">ORDER DATE</th>
              <th className="font-normal p-2 pb-5">TOTAL AMOUNT</th>
              <th className="font-normal p-2 pb-5">GCASH NUMBER</th>
              <th className="font-normal p-2 pb-5">TOTAL ITEMS BOUGHT</th>
              <th className="font-normal p-2 pb-5">PAYMENT METHOD</th>
              <th className="font-normal p-2 pb-5">PAYMENT STATUS</th>
              <th className="font-normal p-2 pb-5">ADDRESS</th>
              <th className="font-normal p-2 pb-5">MINUS STOCKS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
           
                <tr >
                  <td className="px-4 "></td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                 
            
                  </td>

                  <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
      
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
            
                  </td>

                  <td className="px-6 py-4 uppercase whitespace-nowrap text-center text-sm">
            
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
      
                  </td>

                  {/* <td className="px-4 py-4 whitespace-nowrap text-cener text-sm">
                  {product.stocks}
                </td> */}
                  
                </tr>
      
          </tbody>
        </table>
      </div>
    </div>
  )
}
