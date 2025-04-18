import { TbPinnedFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";


export default function ImageCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="w-[200px] flex flex-col justify-between text-sm md:text-normal gap-1 relative min-h-[200px] md:min-h-[290px] md:w-[300px] mx-auto rounded-[10px] group  ">
      <div className="absolute top-2 right-0">
        <TbPinnedFilled size={25} />
      </div>
      <div className="flex flex-col gap-2 bg-card group-hover:bg-primary border border-black rounded-br-none rounded-bl-none p-2 rounded-[5px]">
        <img
          src={product?.productImages[0]}
          className="w-[230px] h-[190px] md:h-[260px] transition-all object-cover mx-auto group-hover:-translate-y-2"
        />
        <p className="py-1  text-sm md:text-lg group-hover:text-white text-center">{product?.productName}</p>
      </div>
      <button
        onClick={() => navigate(`/product/${product._id}`)}
        className="bg-primary flex items-center justify-between  border border-black w-full text-card rounded-[5px] p-2"
      >
        See This Product
        <FaArrowRightLong className="group-hover:text-black" size={20} />
      </button>
    </div>
  );
}
