import ImageSlider from "./ImageSlider/ImageSlider";
import { HiShoppingBag } from "react-icons/hi2";
import { Link } from "react-router-dom";
import CreditPointsAuto from "./CreditPointsAuto";
import RMTOYSLOGO from "../assets/RMTOYSLOGOFINAL.png";
import Buttons from "../reusable/Buttons";
export default function Hero() {
  return (
    <section className="font-main  relative overflow-hidden ">
      <div className="relative z-2 overflow-y-auto max-w-[1280px] mx-auto p-4">
        <div className="flex items-center gap-4 justify-between relative flex-col pt-28 ">
          <div className="flex items-center flex-col  ">
            <div className="w-full">
              <CreditPointsAuto className="flex justify-center" />
            </div>
            <div className="flex justify-center ">
              <img src={RMTOYSLOGO} className="w-[90px] md:w-[150px] " alt="" />
            </div>

            <div className="relative mt-4 z-10 md:w-[600px] lg:w-[850px]">
              <h1 className="font-main text-center text-xl md:text-5xl mx-auto leading-snug md:leading-tight lg:leading-snug ">
                <span className=" text-green-600  transform -rotate-1 inline-block mr-1">
                  Discover
                </span>{" "}
                a <span className="text-red-600">toy</span> that
                <span className=" text-orange-600  transform rotate-1 inline-block mx-1">
                  empowers
                </span>{" "}
                your child to <span className="text-blue-600">unleash</span>{" "}
                their imagination. Let's get{" "}
                <span className="text-violet-600 underline decoration-2 decoration-black/10">
                  creative
                </span>{" "}
                and let their{" "}
                <span className="text-secondary">imagination</span> grow!
              </h1>
            </div>

            <Link to="/shop" className="mt-8 z-10">
              <Buttons
                buttonName="Shop Here"
                icon={
                  <HiShoppingBag
                    size={22}
                    className="group-hover:rotate-12 transition-transform"
                  />
                }
                className="px-8 py-4 text-base"
              />
            </Link>
          </div>

          <div className=" w-full overflow-hidden  md:text-center  flex flex-col gap-6 ">
            <div className="items-center mx-auto">
              <ImageSlider />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
