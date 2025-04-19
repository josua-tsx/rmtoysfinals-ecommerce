import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import ReviewCardTwo from '../components/ReviewCardTwo';
import LoadingSpinner from '../reusable/LoadingSpinner';

export default function ThreeStarReviews() {

    const {
        data: threeStarReviews = [],
        isPending,
        isError,
      } = useQuery({
        queryKey: ["threeStarReview"],
        queryFn: async () => {
          const res = await axiosInstance.get(`/review/get-threeStar`);
          return res.data;
        },
      });
    
      if (isPending) return <LoadingSpinner fullScreen/>;
      if (isError) return <p>Error.</p>;

  return (
    <div className="flex flex-col gap-4">
    {threeStarReviews.length > 0 ? (
      threeStarReviews?.map((three) => <ReviewCardTwo key={three._id} review={three} />)
    ) : (
      <p className='text-center'>no three star review yet.</p>
    )}
  </div>
  )
}
