import { TbPinnedFilled } from "react-icons/tb";

export default function AdminProductOverviewCard({
  singleBestSoldProduct,
  value1,
  value2,
  onClick,
}) {
  return (
    <div className="border border-black w-full h-full flex flex-col text-sm md:text-normal gap-3 items-center justify-center rounded-[5px] relative p-4 bg-white hover:translate-x-[2px] hover:translate-y-[2px] ">
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-white border border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform rotate-1 z-20">
        <p className="font-black uppercase tracking-widest text-[10px] leading-none">
          {value1}
        </p>
      </div>

      {/* Pushpin decoration */}
      <div className="border border-black w-[20px] h-[20px] bg-yellow-400 absolute right-3 top-3 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute -top-5 -right-3 rotate-45 text-black">
          <TbPinnedFilled size={24} />
        </div>
      </div>

      {/* Product Image */}
      <div className="border-2 border-black p-2 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
        <img
          src={singleBestSoldProduct?.productImages?.[0]}
          alt="product"
          className="w-[100px] h-[100px] object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="p-2 text-xs text-center flex flex-col gap-3 w-full">
        <div className="flex justify-center font-bold text-lg mt-2">
          {value2}
        </div>
        <button
          onClick={onClick}
          className="w-full border border-black py-2 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          SEE PRODUCT
        </button>
      </div>
    </div>
  );
}
