import ImageSlider from "./ImageSlider/ImageSlider";
import ArrowLine from "../reusable/ArrowLine";
import { HiShoppingBag } from "react-icons/hi2";
import { Link } from "react-router-dom";
import CreditPointsAuto from "./CreditPointsAuto";
import RMTOYSLOGO from "../assets/RMTOYSLOGOFINAL.png";
export default function Hero() {
  return (
    <section className="font-main  relative overflow-hidden ">
      <div className="relative z-2 overflow-y-auto max-w-[1280px] mx-auto p-4">
        <div className="flex items-center   justify-between relative flex-col pt-28 ">
          <div className="flex items-center flex-col gap-4 ">
            <div className="w-full">
              <CreditPointsAuto className="flex justify-center" />
            </div>
            <div className="flex justify-center ">
              <img src={RMTOYSLOGO} className="w-[90px] md:w-[100px] " alt="" />
            </div>

            <div className="relative z-10  md:w-[700px] lg:w-[750px]">
              <h1 className="font-main text-center text-3xl mx-auto leading-tight md:leading-tight lg:leading-tight  md:text-5xl   ">
                <span className="text-green-600">Discover</span> a{" "}
                <span className="text-red-600">toy</span> that{" "}
                <span className="text-orange-600">empowers</span> your child to{" "}
                <span className="text-blue-600">unleash</span> their
                imagination. Let's get{" "}
                <span className="text-violet-600">creative</span> and let their{" "}
                <span className="text-secondary">imagination</span> grow!
              </h1>
            </div>

            <Link
              to={`/shop`}
              className="z-10 font-main text-normal md:text-lg w-[300px] md:mx-auto lg:mx-0 flex items-center pl-[120px] hover:underline text-indigo-600 relative gap-2"
            >
              SHOP HERE
              <HiShoppingBag size={25} className="text-primary" />
              <ArrowLine
                arrowWidth={"100px"}
                bottomNeg={"50%"}
                arrowLeft={"0px"}
              />
            </Link>
          </div>

          <div className=" w-full overflow-hidden  md:text-center  flex flex-col gap-6 ">
            <div className="   items-center mx-auto">
              <ImageSlider />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
