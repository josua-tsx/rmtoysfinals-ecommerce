import ImageCard from "./ImageCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import ImageCardSkeleton from "../skeleton/ImageCardSkeleton";

export default function ImageSlider() {
  const {
    data: bestProducts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["bestProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-bestProducts`);
      return res.data;
    },
  });

  if (isError) return <p>Error.</p>;

  return (
    <div className="w-full relative py-10 overflow-hidden group bg-transparent">
      {isPending ? (
        <div className="flex w-max gap-5 pl-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <ImageCardSkeleton />
            </div>
          ))}
        </div>
      ) : bestProducts.length > 0 ? (
        <div className="flex w-max gap-5  pl-6 animate-scroll group-hover:[animation-play-state:paused]">
          {/* Loop multiple times to ensure enough width for smooth scrolling */}
          {[...Array(4)].map((_, i) =>
            bestProducts.map((product) => (
              <div key={`${i}-${product._id}`}>
                <ImageCard product={product} />
              </div>
            )),
          )}
        </div>
      ) : (
        <p>No slider products yet.</p>
      )}
    </div>
  );
}
