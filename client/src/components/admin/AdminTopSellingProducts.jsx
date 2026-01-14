import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { TbTrophyFilled } from "react-icons/tb";

export default function AdminTopSellingProducts() {
  const {
    data: topProducts = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["topSellingProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/best-sold-product`);
      return res.data;
    },
  });

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-yellow-400",
          text: "text-yellow-900",
          border: "border-yellow-600",
          label: "1st",
          iconColor: "text-yellow-700",
        };
      case 1:
        return {
          bg: "bg-gray-300",
          text: "text-gray-800",
          border: "border-gray-500",
          label: "2nd",
          iconColor: "text-gray-600",
        };
      case 2:
        return {
          bg: "bg-orange-300",
          text: "text-orange-900",
          border: "border-orange-600",
          label: "3rd",
          iconColor: "text-orange-800",
        };
      default:
        return {
          bg: "bg-white",
          text: "text-black",
          border: "border-black",
          label: `${index + 1}th`,
          iconColor: "text-gray-400",
        };
    }
  };

  if (isError) return <p>Error loading top products.</p>;

  return (
    <div className="relative mt-12 w-full">
      <div className="absolute -top-4 -left-3 bg-[#facc15] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
          <TbTrophyFilled className="text-black" size={18} />
          Top Selling Products
        </h2>
      </div>

      <div className="bg-card border border-black rounded-[5px] p-8 pt-10 min-h-[300px]">
        {isPending ? (
          <div className="flex justify-center items-center h-[200px]">
            <LoadingSpinner />
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[200px] text-gray-500">
            <p>No sales data yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topProducts.map((product, index) => {
              const style = getRankStyle(index);
              return (
                <div
                  key={product._id}
                  className={`relative flex flex-col items-center border rounded-lg p-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white ${
                    index < 3 ? "border-black" : "border-gray-200"
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center rounded-full font-black border-2 shadow-sm ${style.bg} ${style.border} ${style.text}`}
                  >
                    {style.label}
                  </div>

                  {/* Product Image */}
                  <div className="w-full aspect-square mb-3 overflow-hidden rounded-md border border-gray-100">
                    <img
                      src={product.productImages[0]}
                      alt={product.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="text-center w-full">
                    <h3 className="font-bold text-sm line-clamp-2 h-10 mb-1 leading-tight">
                      {product.productName}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono bg-gray-100 rounded-full py-1 px-3 w-fit mx-auto mt-2 border border-gray-300">
                      <span className="font-bold text-black text-sm">
                        {product.sold}
                      </span>
                      <span className="text-gray-500 uppercase tracking-wide">
                        Sold
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
