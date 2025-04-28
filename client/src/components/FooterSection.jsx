import RMTOYSLOGO from "../assets/RMTOYSLOGOFINAL.png";
import { IoLocationSharp } from "react-icons/io5";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaFacebook } from "react-icons/fa";

export default function FooterSection() {
  return (
    <div className="max-w-[1280px] mx-auto text-sm md:text-normal pt-[155px] ">
      <div className="flex justify-between flex-col px-4 gap-10 md:gap-0 md:flex-row items-center py-20 border-t-gray-200  border border-r-0 border-b-0 border-l-0">
        <div className="flex flex-col gap-4 items-center md:items-start flex-1">
          <img src={RMTOYSLOGO} className="w-[90px] " alt="" />

          <div className="w-[300px]">
            A seamless and intuitive online toy store that brings joy and
            endless fun to your doorstep. Browse, shop, and explore the latest
            toys and games for kids of all ages, all from the comfort of your
            home.
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10 flex-1">
          <div className="flex flex-col gap-5 flex-1">
            <div className="flex gap-2">
              <IoLocationSharp size={25} />
              <p>13St. p6b Lower bicutan Taguig City</p>
            </div>
            <div className="flex gap-2">
              <BsFillTelephoneFill size={25} />
              <p>(+63) 09934587893</p>
            </div>
            <div className="flex gap-2">
              <MdEmail size={25} />
              <p>rmtoys28@gmail.com</p>
            </div>
          </div>

          <div className="flex  gap-4 flex-1">
            <a
              href="https://www.facebook.com/Rmcarsandmotorbikes"
              target="_blank"
              className="text-gray-700 hover:text-blue-600"
            >
              <FaFacebook size={24} />
              
            </a>
            <span>RM Toys page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
