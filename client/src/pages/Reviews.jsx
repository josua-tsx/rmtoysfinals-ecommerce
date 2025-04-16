import { useState } from "react";
import OneStarReviews from "./OneStarReviews";
import TwoStarReviews from "./TwoStarReviews";
import ThreeStarReviews from "./ThreeStarReviews";
import FourStarReviews from "./FourStarReviews";
import FiveStarReviews from "./FiveStarReviews";

export default function Reviews() {
  const [selectedComponent, setSelectedComponent] = useState("fiveStar");


  const handleChangeComponent = (e) => {
    const newSelectedComponent = e.target.value;
    setSelectedComponent(newSelectedComponent);
  };

  return (
    <section className="pt-[130px] text-sm md:text-normal h-screen p-3 font-main">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="text-3xl mb-5">REVIEWS</h1>

        <div className="flex gap-10  flex-col md:flex-row">
          <div className="text-center md:text-start">
            <select
              value={selectedComponent}
              onChange={handleChangeComponent}
              className="border w-[300px] text-center rounded-[5px] outline-none border-black p-1"
            >
              <option value="oneStar">1 STAR REVIEWS</option>
              <option value="twoStar">2 STAR REVIEWS</option>
              <option value="threeStar">3 STAR REVIEWS</option>
              <option value="fourStar">4 STAR REVIEWS</option>
              <option value="fiveStar">5 STAR REVIEWS</option>
            </select>
          </div>

          {/* REVIEWS CONTAINER HERE */}
          <div className="flex-1 gap-10 flex flex-col">
            {selectedComponent === "oneStar" && <OneStarReviews  />}
            {selectedComponent === "twoStar" && <TwoStarReviews  />}
            {selectedComponent === "threeStar" && <ThreeStarReviews  />}
            {selectedComponent === "fourStar" && <FourStarReviews  />}
            {selectedComponent === "fiveStar" && <FiveStarReviews  />}
          </div>
        </div>
      </div>
    </section>
  );
}
