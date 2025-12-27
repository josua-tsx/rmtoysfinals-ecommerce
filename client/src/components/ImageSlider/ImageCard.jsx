import { useNavigate } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { TbPinnedFilled } from "react-icons/tb";
import Buttons from "../../reusable/Buttons";

export default function ImageCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="w-[200px] md:w-[250px] flex flex-col justify-between text-sm md:text-normal gap-1 relative mx-auto group">
      {/* Category Sticker */}
      <div className="absolute -top-2 -left-2 bg-blue-600 text-[10px] text-white border border-black px-2 py-0.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-sm transform -rotate-3 z-30">
        <span className="uppercase  tracking-widest">Recommended</span>
      </div>

      {/* Retro Pin */}
      <div className="absolute top-2 right-2 z-10 text-black transform rotate-45 transition-transform group-hover:rotate-[60deg]">
        <TbPinnedFilled size={24} />
      </div>

      <div className="flex h-[190px] md:h-[230px] flex-col gap-2 bg-white border border-black rounded-t-[5px] p-4 relative overflow-hidden transition-all duration-300 group-hover:bg-primary/5 ">
        <img
          src={product?.productImages[0]}
          className="w-full h-full transition-all duration-300 object-contain mx-auto group-hover:scale-110 group-hover:-rotate-2"
          alt={product?.productName}
        />
      </div>

      <Buttons
        onClick={() => navigate(`/product/details/${product._id}`)}
        buttonName={
          <span className="truncate flex-1 text-left mr-2">
            {product?.productName}
          </span>
        }
        icon={<FaArrowRightLong className="text-white" size={18} />}
        animateIcon={true}
        className="bg-[#22c55e] text-xs !text-white w-full !rounded-[0px] !rounded-b-[5px] !justify-between !px-3  py-1.5 z-20"
      />
    </div>
  );
}
