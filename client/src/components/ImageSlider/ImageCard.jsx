import { useNavigate } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { TbPinnedFilled } from "react-icons/tb";

export default function ImageCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="w-[200px] md:w-[250px] flex flex-col justify-between text-sm md:text-normal gap-1 relative  mx-auto rounded-[10px] group  ">
      <div className="absolute top-2 right-0">
        <TbPinnedFilled size={25} />
      </div>
      <div className="flex  h-[190px] md:h-[260px]  flex-col gap-2 bg-card group-hover:bg-primary border border-black rounded-br-none rounded-bl-none p-2 rounded-[5px]">
        <img
          src={product?.productImages[0]}
          className="w-full h-full transition-all object-contain mx-auto group-hover:-translate-y-2"
        />
      </div>

      <button
        onClick={() => navigate(`/product/details/${product._id}`)}
        className="bg-primary flex items-center justify-between  border border-black w-full text-card rounded-[5px] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <p className=" group-hover:text-white">{product?.productName}</p>
        <FaArrowRightLong className="group-hover:text-black" size={20} />
      </button>
    </div>
  );
}
