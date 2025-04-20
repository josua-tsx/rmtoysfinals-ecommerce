import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FaArrowTurnDown } from 'react-icons/fa6'
import { IoIosClose } from 'react-icons/io'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'
import { FaPaperPlane } from 'react-icons/fa'

export default function EditReviewComponent({ singleReview ,onClose}) {

    const queryClient = useQueryClient()

    const [newCommentReview, setNewCommentReview] = useState("")
    const [newRating, setNewRating] = useState(1)

    useEffect(() => {
        if (singleReview) {
            setNewCommentReview(singleReview.commentReview)
            setNewRating(singleReview.rating)
        }

    }, [singleReview])

    const {mutate: updateSingleReviewMutation, isPending: isSubmitting} = useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.put(`/review/edit/${singleReview?._id}`, data)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']})
            queryClient.invalidateQueries({queryKey: ['reviews']})
            queryClient.invalidateQueries({queryKey: ['singleReview']})
            onClose()
            toast.success("Succesfully updated!")
        }, 
        onError: (err) => {
            toast.error(err.response.data.message || "something went wrong!")
        }
    })

    const handleUpdateSubmit = (e) => {
        e.preventDefault()

        updateSingleReviewMutation({commentReview: newCommentReview, rating: newRating})
    }


  return (
       <div className='inset-0 fixed flex flex-col p-5 justify-center items-center backdrop-blur-sm z-50'
     >
        <form onSubmit={handleUpdateSubmit}
        className='bg-card border flex flex-col gap-4 w-full md:w-[500px]  relative border-black p-5 rounded-[5px]'>
        <button
            onClick={onClose}
            className="absolute border  border-black  text-card bg-primary rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>
        <button
            className="absolute border  border-black  text-card bg-primary rounded-[5px] px-5 left-0 py-1 -top-10"
          >
            EDITING REVIEW
          </button>
       <div className="flex gap-2 flex-col  ">
         <h1>HOW MANY STAR WOULD YOU GIVE?</h1>
         <input
           type="number"
            value={newRating}
           min={1}
           max={5}
           className="outline-none border p-1 text-center border-black rounded-[5px]"
           onChange={(e) => {
             const value = Math.max(
               1,
               Math.min(5, Number(e.target.value))
             ); // Ensures rating is between 1 and 5
             setNewRating(value);
           }}
         />
       </div>
        <div className=" flex flex-col gap-2 ">
                       <h1>Add your comment here</h1>
                       <div className="flex flex-col items-center gap-2">
                         <textarea
                           name="review"
                           id="review"
                           value={newCommentReview}
                           onChange={(e) => setNewCommentReview(e.target.value)}
                           className="border h-[150px] p-2 border-black rounded-[5px] w-full resize-none outline-none"
                         ></textarea>
                         <div className="w-full">
                         <button
                       type="submit"
                       disabled={isSubmitting}
                       className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary border border-black py-2 font-medium text-white transition  disabled:opacity-70"
                     >
                       {isSubmitting ? (
                         "Submitting..."
                       ) : (
                         <>
                           <FaPaperPlane />
                           Submit Review
                         </>
                       )}
                       </button>
                         </div>
                       </div>
                     </div>
        </form>
     </div>
  )
}
