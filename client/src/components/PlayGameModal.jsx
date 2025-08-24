import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import gameLoading from "../assets/gameLoading.gif";
import { FaHandPaper, FaHandRock, FaHandScissors } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { formatLockedUntil } from "../lib/utils";

const choices = [
  {
    name: "rock",
    icon: (
      <FaHandRock className="text-secondary size-[40px] hover:text-primary" />
    ),
    icon2: (
      <FaHandRock className="text-secondary size-[90px] md:size-[200px]" />
    ),
  },
  {
    name: "paper",
    icon: (
      <FaHandPaper className="text-blue-500 size-[40px] hover:text-primary" />
    ),
    icon2: (
      <FaHandPaper className="text-blue-500 size-[90px] md:size-[200px]" />
    ),
  },
  {
    name: "scissors",
    icon: (
      <FaHandScissors className="text-red-500 size-[40px] hover:text-primary" />
    ),
    icon2: (
      <FaHandScissors className="text-red-500 size-[90px] md:size-[200px]" />
    ),
  },
];

export default function PlayGameModal({ user, closeModal }) {
  const queryClient = useQueryClient();

  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [renderResult, setRenderResult] = useState(null);
  const [renderWinCount, setRenderWinCount] = useState(0);
  const [renderCredits, setRenderCredits] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  console.log(lockedUntil);

  useEffect(() => {
    if (user) {
      setRenderWinCount(user.winCount);
      setRenderCredits(user.credits);
    }
  }, [user.winCount]);

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
      setRenderCredits(data.credits);
      setLockedUntil(formatLockedUntil(data.lockedUntil));
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

  return (
    <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-sm px-5 z-50">
      {lockedUntil ? (
        <div className="bg-card relative justify-between w-[800px] border flex flex-col gap-5 border-black    rounded-[5px]">
          <button
            onClick={() => {
              closeModal();
              handleResetGame();
            }}
            className="absolute border  border-black  text-card bg-red-500 rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>

          <div>
            <h1 className="text-center bg-primary text-white p-4 text-2xl">
              Congratulations! 🎉
            </h1>
          </div>

          <div className="my-10 flex justify-center text-center">
            <div className="flex flex-col gap-2 justify-center items-center">
              <h2 className="text-xl md:text-3xl">{renderResult}</h2>
              <p className="text-lg">
                Comeback tommorow at {lockedUntil} to play again!
              </p>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                closeModal();
                handleResetGame();
              }}
              className="bg-primary border border-black rounded-[5px] w-full text-white p-2"
            >
              Okay
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card relative w-[95%] md:w-[800px] border flex flex-col gap-5  border-black rounded-[5px]">
          <button
            onClick={() => {
              closeModal();
              handleResetGame();
            }}
            className="absolute border  border-black  text-card bg-red-500 rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>

          <div className="">
            <div className="bg-primary rounded-t-[5px] text-white">
              <h1 className="text-2xl text-center p-4  ">
                Free Credits Arena 🏆
              </h1>
            </div>
            <div className=" flex justify-center">
              <h1 className="text-center   md:text-xl p-4">
                {renderResult
                  ? renderResult
                  : "Fight for free credits! Good luck. 🍀"}
              </h1>
            </div>
            <div className="flex justify-center">
              <div>
                <div className="border flex p-1 rounded-[5px] justify-between border-black w-[200px] h-[30px] md:h-[40px]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-full w-[32%] ${
                        index < renderWinCount ? "bg-primary" : "bg-gray-500"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex  p-4 md:py-10">
            <div className="flex flex-col  flex-1 gap-4">
              {/* <p className="">Win Count: {renderWinCount}</p> */}
              <div className="flex flex-col justify-center  items-center   rounded-[5px] p-2  w-full">
                <div>
                  {" "}
                  {isPending ? (
                    <img
                      src={gameLoading}
                      alt="Loading animation"
                      className="h-auto w-[400px]"
                    />
                  ) : (
                    returnComponent() || (
                      <FaHandRock className="text-secondary size-[90px] md:size-[200px]" />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className=" flex flex-col justify-center items-center">
              <h1 className="text-4xl md:text-6xl">VS</h1>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <div className=" flex flex-col justify-center items-center   rounded-[5px] p-2  w-full">
                {isPending ? (
                  <img
                    src={gameLoading}
                    alt="Loading animation"
                    className="h-auto w-[400px]"
                  />
                ) : (
                  returnComputerComponent() || (
                    <FaHandRock className="text-secondary size-[90px] md:size-[200px]" />
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-4 items-center gap-10">
            <div className=" w-full   flex flex-col md:flex-row text-center md:text-start gap-2 items-center justify-between">
              <div className="flex-1">
                <p className="flex items-center gap-2">
                  Win Count: <p className="text-blue-500">{renderWinCount}</p>
                </p>
                <p className="flex items-center gap-2">
                  Your Credits: <span className="text-blue-500">{renderCredits}</span>
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-4 items-center">
                <h1 className="text-black text-center md:text-xl">
                  Choose Your Move:
                </h1>
                <div className="flex gap-2">
                  {choices.map((choice) => (
                    <button
                      key={choice.name}
                      onClick={() => setUserChoice(choice.name)}
                      className="  "
                    >
                      {choice.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1"></div>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={() => handlePlayGame()}
              disabled={isPending}
              className="  p-2  w-full bg-primary rounded-[5px] border border-black text-white  "
            >
              {isPending ? "Fighting..." : "Fight"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
