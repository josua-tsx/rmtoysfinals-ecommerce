import React, { useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminAddRider() {
  const [riderName, setRiderName] = useState("");
  const [riderPhoneNum, setRiderPhoneNum] = useState(0);

  return (
    <form className="border flex flex-col gap-5 relative rounded-[5px] border-black bg-card">
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

      <div className="flex gap-2 p-2 flex-col w-full">
        <div className="flex flex-col gap-2 w-full justify-between">
          <label htmlFor="">Rider Name: </label>
          <input
            type="text"
            placeholder="Ex: Brendon Mae"
            value={riderName}
            onChange={handleInputChange(setRiderName)}
            className="border border-black p-1 outline-none  rounded-[5px]"
          />
        </div>
        <div className="flex flex-col gap-2 w-full justify-between">
          <label htmlFor="">Rider Phone Number: </label>
          <input
            type="number"
            value={riderPhoneNum}
            onChange={(e) => setRiderPhoneNum(e.target.value)}
            placeholder="Ex: 09*******83"
            className="border border-black p-1  outline-none rounded-[5px]"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row p-2 gap-2">
        <button className="border outline-none flex-1 bg-primary text-card rounded-[5px] border-black p-2">
          ADD RIDER
        </button>
        <button
          //   onClick={handleClear}
          type="button"
          className="bg-red-600 w-full p-2 md:w-[20%] border border-black rounded-[5px] text-card "
        >
          Clear
        </button>
      </div>
    </form>
  );
}
