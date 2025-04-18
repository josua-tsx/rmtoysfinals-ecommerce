import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import axiosInstance from "../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function ReduceQuantityModal({singleStock, onClose}) {
    const queryClient = useQueryClient()
    
    const [quantity, setQuantity] = useState()

    useEffect(() => {
        if (singleStock) {
            setQuantity(singleStock?.quantity)
        }
    }, [singleStock])


    const {mutate: updateQuantityMutation} = useMutation({
        mutationFn: async (data) => {
          const res = await axiosInstance.put(`/stocks/update-quantity/${singleStock._id}`, data)
          return res.data
        },
        onSuccess: () => {
            toast.success("Updated Succesfully!")
            queryClient.invalidateQueries({queryKey:["stocks"]})
            onClose()
        }, 
        onError: (err) => {
          toast.error(err.response.data.message || "something went wrong!")
        }
      })


      const handleFormSubmit = (e) => {
        e.preventDefault()

        updateQuantityMutation({quantity})
      }
    

  return (
    <section className="fixed inset-0 z-50 backdrop-blur-sm p-3">
      <div className="h-screen flex flex-col justify-center items-center mx-auto">
        <form
          onSubmit={handleFormSubmit}
          className="border flex flex-col gap-5 relative border-black bg-card rounded-[5px] w-full  md:w-[500px]"
        >
          <div className="absolute -top-10 bg-red-700 border border-black left-0 rounded-[5px] text-card px-5 py-1">
            <h1>Reduce Stock</h1>
          </div>

          <button
            type="button"
            className="absolute border border-black text-card bg-red-700 rounded-[5px] px-5 right-0 -top-8"
            onClick={onClose}
          >
            <IoIosClose size={25} />
          </button>

          <div className="p-4">
            <label htmlFor="reduceQuantity">Reduce Quantity: </label>
            <input type="number" min={0} max={singleStock?.quantity} id="reduceQuantity" name="reduceQuantity" value={quantity} onChange={(e) => setQuantity(e.target.value)}
            className="border px-2 border-black w-full  rounded-[5px]"
            />
          </div>

   
        <button type="submit" className="bg-primary py-2 w-full rounded-br-[5px] rounded-bl-[5px] text-white">Reduce</button>
   
       
        </form>
      </div>
    </section>
  );
}
