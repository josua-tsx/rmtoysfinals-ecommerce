import RMTOYSLOGO from "../assets/RMTOYSLOGOFINAL.png";
import { IoLocationSharp } from "react-icons/io5";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaFacebook } from "react-icons/fa";

export default function FooterSection() {
  return (
    <div className="max-w-[1280px] mx-auto text-sm md:text-normal mt-[200px]">
      <div className="flex justify-between flex-col px-6 gap-10 md:gap-0 md:flex-row items-center py-16 border-t border-[#bfbeb8]">
        <div className="flex flex-col gap-6 items-center md:items-start flex-1">
          <div className="bg-white border border-black p-4 rounded-[5px] transform -rotate-1">
            <img src={RMTOYSLOGO} className="w-[100px] mb-4" alt="" />
            <div className=" leading-relaxed">
              A seamless and intuitive online toy store that brings joy and
              endless fun to your doorstep. Browse, shop, and explore the latest
              toys and games.
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 flex-1 w-full justify-end">
          <div className="flex flex-col gap-4 ">
            <div className="flex items-center gap-3 bg-white border border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px]">
              <div className="bg-green-600 text-white p-1.5 border border-black rounded-sm">
                <IoLocationSharp size={20} />
              </div>
              <p className="text-xs uppercase font-black">
                13St. p6b Lower bicutan Taguig City
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px]">
              <div className="bg-orange-600 text-white p-1.5 border border-black rounded-sm">
                <BsFillTelephoneFill size={20} />
              </div>
              <p className="text-xs font-black">(+63) 09934587893</p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px]">
              <div className="bg-blue-600 text-white p-1.5 border border-black rounded-sm">
                <MdEmail size={20} />
              </div>
              <p className="text-xs font-black">rmtoys28@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start">
            <a
              href="https://www.facebook.com/Rmcarsandmotorbikes"
              target="_blank"
              className="group bg-[#1877F2] text-white border border-black px-6 py-3 rounded-[5px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-3  font-black uppercase tracking-widest text-sm"
            >
              <FaFacebook
                size={24}
                className="group-hover:rotate-12 transition-transform"
              />
              <span>RM Toys Official</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
