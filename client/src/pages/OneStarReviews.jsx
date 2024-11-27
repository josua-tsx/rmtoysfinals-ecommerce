import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../lib/axios'
import ReviewCardTwo from '../components/ReviewCardTwo'

export default function OneStarReviews() {


    const {data: oneStarReviews = [], isPending, isError} = useQuery({
        queryKey: ['oneStarReview'],
        queryFn: async () => {
            const res = await axiosInstance.get(`/review/get-oneStar`)
            return res.data
        }
    })

    console.log(oneStarReviews)

    if (isPending) return <p>Loading...</p>
    if (isError) return <p>Error.</p>

  return (
    <div className="flex flex-col gap-4">

        {
            oneStarReviews.length > 0 ? (
                oneStarReviews?.map((one) => (
                    <ReviewCardTwo key={one._id} review={one}  />
                )) 
            ) :  <p className='text-center'>no one star review yet.</p>
        }

    </div>
  )
}
