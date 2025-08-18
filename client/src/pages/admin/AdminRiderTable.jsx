import React, { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

const TEST_DATA = [
  {
    id: 1,
    RiderName: "juswa",
    RiderStatus: "Unavailable",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 2,
    RiderName: "juswa2",
    RiderStatus: "Available",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 3,
    RiderName: "juswa3",
    RiderStatus: "Available",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 4,
    RiderName: "juswa4",
    RiderStatus: "Available",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 5,
    RiderName: "juswa5",
    RiderStatus: "Unavailable",
    RiderPhoneNum: "09128321412314",
  },
];

export default function AdminRiderTable() {
  const {
    data: getRiders = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["riders"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/rider/get-riders`);
      return res.data;
    },
  });

  if (isError) return <p>Error...</p>;

  return (
    <div className="font-main border rounded-[5px] text-sm md:text-normal border-black bg-card relative ">
      {/* <ConfirmModal
           isOpen={isModalOpen}
           title={"Confirm delete"}
           message={
             "Are you sure you want to delete this worker? This action can not be undone."
           }
           onConfirm={handleConfirm}
           onCancel={handleCancel}
         /> */}

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      {/* <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
           <h1>RIDER TABLE</h1>
           <div className="flex items-center relative">
             <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="search worker.."
               className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
             />
             <IoSearch className="absolute right-0" size={25} />
           </div>
         </div> */}
      <div className="overflow-y-auto  h-[600px] py-3">
        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr className="">
                <th className="font-normal p-2 pb-5">ID</th>
                <th className="font-normal p-2 pb-5">Rider Name</th>
                <th className="font-normal p-2 pb-5">Rider Phone Number</th>
                <th className="font-normal p-2 pb-5">Rider Status</th>
                <th className="font-normal p-2 pb-5">Sucessful Delivery</th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {getRiders?.length > 0 ? (
                getRiders?.map((rider) => (
                  <tr key={rider._id}>
                    <td className="px-4 ">{rider._id}</td>

                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                      {rider.riderName}
                    </td>

                    <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                      {rider.riderPhoneNumber}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {rider.riderStatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {rider.successDelivered}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        //    onClick={() =>
                        //      navigate(`/admin/editWorker/${worker._id}`)
                        //    }
                        // onClick={() => navigateToeditPage(product._id)}
                        className="text-green-600 hover:text-indigo-300 mr-2"
                      >
                        <CiEdit size={25} />
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-300"
                      >
                        <MdDelete size={25} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <p className="text-center p-2">no rider found!</p>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
