import { IoIosClose } from "react-icons/io";
import { FaArrowTurnDown } from "react-icons/fa6";
import { FaImages } from "react-icons/fa";
import StarsRating from "../components/StarsRating.jsx";
import { useState } from "react";
import ReviewCard from "./ReviewCard.jsx";
import noAvatar from '../assets/noavatar.jpg'
import AdminImagePlaceholder from "../reusable/Admin/AdminImagePlaceholder.jsx";


export default function ReviewModal({ closeModal }) {
  const [showReview, setShowReview] = useState(false)

  return (
    <section className=" pt-[105px] md:pt-[130px] inset-0 fixed z-50 backdrop-blur-sm p-3">
      <div className="md:max-w-[90%] lg:max-w-[80%] h-screen  mx-auto">
        <form className="flex flex-col md:flex-row-reverse gap-2 relative">

             {/* close button */}
             <button onClick={closeModal} className="absolute border  border-black  text-card bg-primary rounded-[5px] px-5 right-0 -top-8">
              <IoIosClose size={25}/>
            </button>
        
          <div className="md:w-[28%] flex flex-col gap-2">
            <div className="flex bg-card border rounded-[5px] p-3 border-black flex-col text-center gap-2">
              <h1 className="text-normal">ADD REVIEW HERE</h1>
              <button
                onClick={() => setShowReview(!showReview)}
                type="button"
                className="border border-black bg-primary text-card p-1 w-full rounded-[5px]"
              >
                {
                  showReview ? "HIDE REVIEW" : "ADD REVIEW"
                }
              </button>
            </div>

            {/* add review goes here */}
            <div  className={`${showReview ? "flex" : "hidden"} flex-col gap-5 bg-card border rounded-[5px] p-3  border-black`} >
              <div className="flex gap-2 flex-col ">
                  <h1>HOW MANY STAR WOULD YOU GIVE?</h1>
                
                    <StarsRating rating={3}/>

                </div>
              <div className=" flex flex-col gap-2 ">
                <h1>ADD YOUR COMMENT HERE</h1>
                <div className="flex items-center gap-2">
                  <textarea
                    name="review"
                    id="review"
                    className="border flex-1 border-black rounded-[5px] resize-none"
                  ></textarea>
                  <div className="flex gap-1">
                    <button type="button" className="border border-black bg-primary text-card rounded-[5px] p-2">
                      <FaArrowTurnDown size={20} />
                    </button>
                 
                  </div>
                </div>
                
              </div>


              
            </div>
          </div>
          <div className="bg-card h-[655px] overflow-y-auto  py-5 flex flex-col gap-5 border-black border rounded-[5px]">
            
                {/* REVIEW CARD GOES HERE */}
                <ReviewCard/>
                <ReviewCard/>
                <ReviewCard/>
                <ReviewCard/>
              

          </div>
        </form>
      </div>
    </section>
  );
}
