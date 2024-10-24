import { FaCartPlus } from "react-icons/fa";
import { IoHeart } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import StarsRating from "./StarsRating";

export default function ShopProductCards({product}) {


  return (
    <div className="w-80 md:w-full h-[350px] border mx-auto font-main items-center flex flex-col justify-center group rounded-[5px] bg-card border-black shadow-md relative ">
      <div className="border p-1 text-sm z-10 bg-primary uppercase text-card font-medium absolute top-[-10px] right-[-10px] border-black rounded-[5px]">
        {
          product.category.categoryName
        }
      </div>
      <div className="w-full flex justify-center relative overflow-hidden group-hover:bg-primary rounded-t-[5px]">
        <img src={product.productImages} className="w-60 h-auto" />
        <div className="w-full absolute bottom-[-100%] border border-t-black transition-all group-hover:bottom-0 text-black bg-card">
          <ul className="p-2 flex flex-col gap-2">
            <li  className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <button>ADD TO CART</button>
              <FaCartPlus size={20} />  
            </li>
            <li className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <button>ADD TO WISHLIST</button>
              <IoHeart size={20} />
            </li>
            <li className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <Link to={`/product`}>VIEW DETAILS</Link>
              <FaEye size={20} />
            </li>
          </ul>
        </div>
      </div>

      <div className="p-2 flex flex-col justify-between bg-card border-t-gray-300 border rounded-b-[5px] flex-1 w-full relative">
        <div className="flex w-full justify-between">
          <p>{product.productName}</p>
          <p className="uppercase">PHP{product.price}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className="w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: "blue" }}
            ></span>
            <p>BLUE</p>
          </div>

          <StarsRating rating={3}/>
        </div>
      </div>
    </div>
  );
}
