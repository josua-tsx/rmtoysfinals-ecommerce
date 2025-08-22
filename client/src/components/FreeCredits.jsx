import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FaHandRock } from "react-icons/fa";
import { FaHandPaper } from "react-icons/fa";
import { FaHandScissors } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const choices = [
  {
    name: "rock",
    icon: <FaHandRock size={40} className="text-secondary" />,
    icon2: <FaHandRock size={200} className="text-secondary" />,
  },
  {
    name: "paper",
    icon: <FaHandPaper size={40} className="text-blue-500" />,
    icon2: <FaHandPaper size={200} className="text-blue-500" />,
  },
  {
    name: "scissors",
    icon: <FaHandScissors size={40} className="text-red-500" />,
    icon2: <FaHandScissors size={200} className="text-red-500" />,
  },
];

export default function FreeCredits() {
  const [openModal, setOpenModal] = useState(false);
  const [userChoice, setUserChoice] = useState(null);

  const { mutate: playGameMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/random/play`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("success");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handlePlayGame = () => {
    playGameMutation({ userChoice });
  };

  console.log(userChoice);

  return (
    <div className="fixed font-main -left-10 top-[55%]  z-50">
      <div className="relative">
        <button
          onClick={() => setOpenModal(true)}
          className="border border-black p-2 bg-card rotate-90 "
        >
          Claim Free Credits
        </button>

        {openModal && (
          <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-sm px-5 z-50">
            <div className="bg-card relative w-[800px] border flex flex-col gap-4 border-black  p-4 rounded-[5px]">
              <button
                onClick={() => setOpenModal((prev) => !prev)}
                className="absolute border  border-black  text-card bg-red-500 rounded-[5px] px-5 right-0 -top-8"
              >
                <IoIosClose size={25} />
              </button>
              <div className="text-center  mb-5 flex flex-col gap-2 justify-center items-center">
                <h1 className="text-xl">
                  You want free credits? Sure! but you have to fight for it.
                </h1>
                <p className="text-sm w-[400px]">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Voluptatibus, eum aliquid! Modi vero earum quis, sit, numquam.
                </p>
                <p className="my-10 text-2xl">
                  {/* {result ? result : "Fight for Credits! Good luck."} */}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col  flex-1 gap-4">
                  <p className="">Win Count: 12</p>
                  <div className="flex flex-col justify-center  items-center h-[200px]  rounded-[5px] p-2  w-full">
                    <div>
                      {userChoice ? userChoice.icon2 : "Choose your choice"}
                    </div>
                  </div>
                </div>

                <div className=" flex flex-col justify-center items-center">
                  <h1 className="text-6xl">VS</h1>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                  <div className=" flex flex-col justify-center items-center h-[200px]  rounded-[5px] p-2  w-full">
                    {/* {isPending ? (
                      <p className="animate-pulse text-3xl text-gray-500">
                        🤔 Thinking...
                      </p>
                    ) : computerChoice ? (
                      computerChoice.icon2
                    ) : (
                      <p>Waiting...</p>
                    )} */}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                {choices.map((choice) => (
                  <button
                    key={choice.name}
                    onClick={() => setUserChoice(choice.name)}
                    className="border border-black p-1 hover:bg-gray-200 rounded-[5px]"
                  >
                    {choice.icon}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePlayGame()}
                disabled={isPending}
                className="border bg-blue-500 text-white rounded-[5px]  border-black w-full p-1"
              >
                {isPending ? "Fighting..." : "Fight"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
