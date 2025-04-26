import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ReviewCardTwo from "../components/ReviewCardTwo";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function FourStarReviews() {
  const {
    data: fourStarReviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["fourStarReview"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-fourStar`);
      return res.data;
    },
  });

  console.log(fourStarReviews);

  if (isPending) return <LoadingSpinner fullScreen/>;
  if (isError) return <p>Error.</p>;

  return (
    <div className="flex flex-col h-[700px]  overflow-y-auto  gap-4">
      {fourStarReviews.length > 0 ? (
        fourStarReviews?.map((four) => (
          <ReviewCardTwo key={four._id} review={four} />
        ))
      ) : (
        <p className="text-center h-[500px]">no four star review yet.</p>
      )}
    </div>
  );
}
