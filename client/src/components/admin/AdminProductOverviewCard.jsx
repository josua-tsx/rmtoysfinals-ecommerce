import { TbPinnedFilled } from "react-icons/tb";

export default function AdminProductOverviewCard({ singleBestSoldProduct, value1, value2, onClick }) {
  
  return (
    <div className="border w-full h-full flex-col text-sm md:text-normal flex gap-3 items-center justify-center border-black rounded-[5px] relative p-2 bg-card">
      <div className="border-black border w-[15px] bg-yellow absolute h-[15px] right-2 top-1 rounded-full">
        <div className="  w-[15px] h-[15px] rounded-full">
          <div className="absolute -top-6 right-[-65%]">
            <TbPinnedFilled size={30} />
          </div>
        </div>
      </div>
      
        <img src={singleBestSoldProduct?.productImages[0]} alt="product" className=" w-[100px]" />

        <div className="p-2 text-xs text-center flex flex-col gap-3">
           <div className="flex flex-col gap-2">
           <p className="">{value1}</p>
           <p className="flex justify-center">{value2}</p>
           </div>
            <button onClick={onClick}
            className="border border-black p-1 bg-primary text-card rounded-[5px]">SEE PRODUCT</button>
        </div>
    </div>
  );
}
