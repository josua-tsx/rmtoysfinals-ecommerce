import React from "react";

export default function AdminHighStock({stock}) {

   

  return (
    <div className="border border-black flex flex-col justify-center  p-2 px-10 text-center  relative  bg-card rounded-[5px]">
      <div className="border border-black absolute rounded-full bg-green-400 top-2 right-2 size-[20px]"></div>

        <div className="flex flex-col md:flex-row items-center md:gap-2">
             <h1 className="text-sm">HIGH STOCKS</h1>
             <p>PRODUCTS</p>
             <p>{stock ? stock?.length : 0}</p>
        </div>
    
    </div>
  );
}
