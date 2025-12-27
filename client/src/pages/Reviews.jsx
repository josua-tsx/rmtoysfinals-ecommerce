import { useState } from "react";
import OneStarReviews from "./OneStarReviews";
import TwoStarReviews from "./TwoStarReviews";
import ThreeStarReviews from "./ThreeStarReviews";
import FourStarReviews from "./FourStarReviews";
import FiveStarReviews from "./FiveStarReviews";
import CreditPointsAuto from "../components/CreditPointsAuto";

export default function Reviews() {
  const [selectedComponent, setSelectedComponent] = useState("fiveStar");

  const handleChangeComponent = (e) => {
    const newSelectedComponent = e.target.value;
    setSelectedComponent(newSelectedComponent);
  };

  return (
    <section className="pt-[130px] text-sm md:text-normal bg-yellow h-full p-3 font-main">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex w-full mb-5">
          <h1 className="text-3xl">Reviews</h1>
        </div>

        <CreditPointsAuto />

        <div className="flex gap-10 bg-yellow flex-col md:flex-row mt-8">
          <div className="text-center md:text-start shrink-0">
            <div className="relative group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-1">
                Filter by Rating
              </label>
              <select
                value={selectedComponent}
                onChange={handleChangeComponent}
                className="appearance-none border border-black w-[280px] text-center rounded-[5px] outline-none bg-white p-3 font-black uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                <option value="oneStar">1 Star Reviews</option>
                <option value="twoStar">2 Star Reviews</option>
                <option value="threeStar">3 Star Reviews</option>
                <option value="fourStar">4 Star Reviews</option>
                <option value="fiveStar">5 Star Reviews</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-6 pr-4 text-black">
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* REVIEWS CONTAINER HERE */}
          <div className="flex-1 gap-10 flex flex-col">
            {selectedComponent === "oneStar" && <OneStarReviews />}
            {selectedComponent === "twoStar" && <TwoStarReviews />}
            {selectedComponent === "threeStar" && <ThreeStarReviews />}
            {selectedComponent === "fourStar" && <FourStarReviews />}
            {selectedComponent === "fiveStar" && <FiveStarReviews />}
          </div>
        </div>
      </div>
    </section>
  );
}
