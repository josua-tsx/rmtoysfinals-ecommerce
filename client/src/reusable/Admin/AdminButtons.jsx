import { FaCheckCircle } from "react-icons/fa";

export default function AdminButtons({ buttonName1, icon }) {
  return (
    <>
      <button
        type="button"
        className="flex hover:opacity-95 uppercase justify-between items-center border w-[100px] md:w-[200px] border-black p-2 rounded-[5px] bg-primary text-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        {buttonName1}
        {icon}
      </button>
      <button
        type="button"
        className="border hover:opacity-95 uppercase flex flex-1 justify-between items-center  border-black p-2 rounded-[5px] bg-primary text-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        Add this Product
        <FaCheckCircle className="text-green-600" />
      </button>
    </>
  );
}
