import React, { useState } from "react";

const TEST_DATA = [
  {
    id: 1,
    RiderName: "juswa",
    RiderStatus: "Unavailable",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 2,
    RiderName: "juswa2",
    RiderStatus: "Available",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 3,
    RiderName: "juswa3",
    RiderStatus: "Available",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 4,
    RiderName: "juswa4",
    RiderStatus: "Available",
    RiderPhoneNum: "09128321412314",
  },
  {
    id: 5,
    RiderName: "juswa5",
    RiderStatus: "Unavailable",
    RiderPhoneNum: "09128321412314",
  },
];

export default function ToShipModal({ onConfirm, onCancel }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectRider = (id) => {
    setSelectedId(id);
  };

  return (
    <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-sm px-5 z-50">
      <div className="border border-black flex flex-col gap-4 bg-card text-black rounded-[5px] p-5 w-[650px]">
        {/* HEADER */}
        <div>
          <h1 className="text-lg">Select rider for this deliver</h1>
        </div>

        {/* BODU */}
        <div className="flex flex-col gap-2 ">
          {TEST_DATA.map((rider) => (
            <div
              key={rider.id}
              className={`flex justify-between border ${
                selectedId === rider.id ? "bg-blue-200" : ""
              } border-black p-2 rounded-[5px] items-center`}
            >
              <div className="flex gap-2">
                <p>Rider Name: </p>
                <p>{rider.RiderName}</p>
              </div>

              <div className="flex gap-2">
                <p>Rider Status: </p>
                <p>{rider.RiderStatus}</p>
              </div>
              <div className="flex gap-2">
                <p>Rider Phone#:</p>
                <p>{rider.RiderPhoneNum}</p>
              </div>
              <div>
                <button
                  onClick={() => handleSelectRider(rider.id)}
                  className="border border-black rounded-[5px] p-2 bg-primary text-white"
                >
                  Select This Rider
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BUTTONS */}

        <div className="flex gap-2 pt-4 justify-center">
          <button
            onClick={onConfirm}
            className="border rounded-[5px] px-4 border-black bg-primary p-2 text-white"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="border rounded-[5px] px-4 border-black bg-red-600 p-2 text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
