import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaHandRock } from "react-icons/fa";
import { FaHandPaper } from "react-icons/fa";
import { FaHandScissors } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

import gameLoading from "../assets/gameLoading.gif";

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
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [renderResult, setRenderResult] = useState(null);
  const [renderWinCount, setRenderWinCount] = useState(0);

  const { mutate: playGameMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/random/play`, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "user"] });
      console.log(data);
      setComputerChoice(data.computerChoice);
      setRenderResult(data.result);
      setRenderWinCount(data.winCount);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
      handleResetGame();
    },
  });

  const returnComponent = () => {
    if (!userChoice) return null;

    const findComponent = choices.find(
      (data) => data.name === userChoice
    ).icon2;
    return findComponent;
  };

  const returnComputerComponent = () => {
    if (!computerChoice) return null;

    const findComponent = choices.find(
      (data) => data.name === computerChoice
    ).icon2;
    return findComponent;
  };

  const handlePlayGame = () => {
    playGameMutation({ userChoice });
  };

  const handleResetGame = () => {
    setComputerChoice(null);
    setRenderResult(null);
    setUserChoice(null);
  };

  console.log(userChoice);

  return (
    <div className="fixed font-main -left-10 top-[55%]  z-50">
      <div className="relative">
        <button
          onClick={() => {
            setOpenModal(true);
            handleResetGame();
          }}
          className="border border-black p-2 bg-card rotate-90 "
        >
          Claim Free Credits
        </button>

        {openModal && (
          <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-sm px-5 z-50">
            <div className="bg-card relative w-[800px] border flex flex-col gap-5 border-black    rounded-[5px]">
              <button
                onClick={() => setOpenModal((prev) => !prev)}
                className="absolute border  border-black  text-card bg-red-500 rounded-[5px] px-5 right-0 -top-8"
              >
                <IoIosClose size={25} />
              </button>

              <div>
                <h1 className="text-2xl text-center p-4 bg-blue-500 text-white">
                  Free Credits Arena 🏆
                </h1>
                <h1 className="text-center text-xl p-4">
                  {renderResult
                    ? renderResult
                    : "Fight for free credits! Good luck."}
                </h1>
              </div>

              <div className="flex  p-4">
                <div className="flex flex-col  flex-1 gap-4">
                  {/* <p className="">Win Count: {renderWinCount}</p> */}
                  <div className="flex flex-col justify-center  items-center h-[200px]  rounded-[5px] p-2  w-full">
                    <div>
                      {" "}
                      {isPending ? (
                        <img
                          src={gameLoading}
                          alt="Loading animation"
                          className="h-auto w-[5  00px]"
                        />
                      ) : (
                        returnComponent() || (
                          <p className="text-xl text-gray-500">
                            Wating for your move.
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className=" flex flex-col justify-center items-center">
                  <h1 className="text-6xl">VS</h1>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                  <div className=" flex flex-col justify-center items-center h-[200px]  rounded-[5px] p-2  w-full">
                    {isPending ? (
                      <img
                        src={gameLoading}
                        alt="Loading animation"
                        className="h-auto w-[5  00px]"
                      />
                    ) : (
                      returnComputerComponent() || (
                        <p className="text-xl text-gray-500">
                          Wating for your move.
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col p-4 items-center border border-black justify-center gap-2">
                <h1>Choose Your Move: </h1>
                <div className="flex gap-2">
                  {choices.map((choice) => (
                    <button
                      key={choice.name}
                      onClick={() => setUserChoice(choice.name)}
                      className=" p-1rounded-[5px]"
                    >
                      {choice.icon}
                    </button>
                  ))}
                </div>
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
