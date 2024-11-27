import axiosInstance from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
import ReviewCardTwo from "../components/ReviewCardTwo";

export default function TwoStarReviews() {
  const {
    data: twoStarReviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["twoStarReview"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-twoStar`);
      return res.data;
    },
  });

  console.log(twoStarReviews);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error.</p>;

  return (
    <div className="flex flex-col gap-4">
      {twoStarReviews.length > 0 ? (
        twoStarReviews?.map((two) => <ReviewCardTwo key={two._id} review={two} />)
      ) : (
        <p className='text-center'>no two star review yet.</p>
      )}
    </div>
  );
}
