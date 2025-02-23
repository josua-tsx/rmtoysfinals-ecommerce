import { TbPinnedFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

export default function ImageCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="w-[200px] flex flex-col justify-between relative min-h-[200px] md:min-h-[290px] md:w-[300px] mx-auto rounded-[10px] p-2 group border border-black bg-card">
      <div className="absolute top-2 right-0">
        <TbPinnedFilled size={25} />
      </div>
      <div className="flex flex-col gap-2">
        <img
          src={product?.productImages[0]}
          className="w-[230px] h-[190px] md:h-[260px] transition-all  mx-auto group-hover:-translate-y-2"
        />
        <p className="py-1  text-sm md:text-lg text-center">{product?.productName}</p>
      </div>
      <button
        onClick={() => navigate(`/product/${product._id}`)}
        className="bg-primary border border-black w-full text-card rounded-[2.5px] py-2"
      >
        SEE THIS PRODUCT
      </button>
    </div>
  );
}
