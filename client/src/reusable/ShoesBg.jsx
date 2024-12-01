import shoesImg from "../assets/shoesbg.png";
import car from '../assets/car.png'

export default function ShoesBg({topPosition, botPosition, leftPosition, rightPosition, rotatePosition}) {
  return (
    <>
         <img
            src={car}
            alt="Shoes background"
            className="absolute opacity-60 w-[100px] lg:w-[120px]"
            style={{top: topPosition, bottom: botPosition, left: leftPosition, right: rightPosition, rotate: rotatePosition}}
          />
    </>
  )
}
