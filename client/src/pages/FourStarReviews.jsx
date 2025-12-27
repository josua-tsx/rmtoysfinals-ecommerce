import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ReviewList from "../components/ReviewList";

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

  return (
    <ReviewList
      reviews={fourStarReviews}
      isPending={isPending}
      isError={isError}
      emptyMessage="no four star review yet."
    />
  );
}
