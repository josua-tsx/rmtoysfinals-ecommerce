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

  const getResultColor = () => {
    if (renderResult === "YOU WIN!") return "text-green-600";
    if (renderResult === "YOU LOSE!") return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <div className="fixed font-mono inset-0 flex items-center justify-center backdrop-blur-sm px-5 z-50">
      {lockedUntil ? (
        <div className="bg-white relative justify-between w-full max-w-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300">
          <div className="bg-primary p-6 text-center border-b-4 border-black">
            <h1 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              Cooldown Active
            </h1>
          </div>

          <div className="p-8 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <span className="text-4xl filter grayscale">⏳</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-black uppercase">
                {lockedUntil}
              </h2>
              <p className="text-gray-600 font-bold uppercase text-sm">
                Come back later to fight again!
              </p>
            </div>

            <button
              onClick={() => {
                closeModal();
                handleResetGame();
              }}
              className="w-full bg-gray-800 text-white font-bold py-3 px-6 hover:bg-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase"
            >
              Close Arena
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white relative w-full max-w-4xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={() => {
              closeModal();
              handleResetGame();
            }}
            className="absolute z-10 top-4 right-4 bg-red-500 text-white p-1 hover:bg-red-600 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <IoIosClose size={24} />
          </button>

          {/* Game Header */}
          <div className="bg-primary border-b-4 border-black p-4 text-center">
            <h1 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-widest drop-shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              Free Credits Arena <span className="not-italic">🏆</span>
            </h1>
          </div>

          {/* Main Battle Arena */}
          <div className="flex flex-col md:flex-row h-full">
            {/* Player Side */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center bg-blue-50 border-b-4 md:border-b-0 md:border-r-4 border-black relative min-h-[300px]">
              <span className="absolute top-4 left-4 bg-blue-500 text-white text-sm font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                YOU
              </span>
              <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                {isPending ? (
                  <div className="animate-pulse">
                    <FaHandRock className="text-gray-300 size-24 md:size-40 rotate-90" />
                  </div>
                ) : (
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    {returnComponent() || (
                      <div className="opacity-20">
                        <FaHandRock className="text-gray-400 size-24 md:size-40 rotate-90" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* VS Badge Center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
              <div className="bg-white border-4 border-black w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-0 transition-transform">
                <span className="font-black text-3xl italic drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">
                  VS
                </span>
              </div>
            </div>

            {/* Computer Side */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center bg-red-50 relative min-h-[300px]">
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                CPU
              </span>
              <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                {isPending ? (
                  <img
                    src={gameLoading}
                    alt="Loading..."
                    className="w-24 h-24 md:w-32 md:h-32 object-contain filter contrast-125"
                  />
                ) : (
                  <div className="transform scale-x-[-1]">
                    {returnComputerComponent() || (
                      <div className="opacity-20">
                        <FaHandRock className="text-gray-400 size-24 md:size-40 rotate-90" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Overlay Banner */}
          {renderResult && (
            <div className="bg-black text-white py-4 text-center border-y-4 border-black animate-in slide-in-from-top-2">
              <h2
                className={`text-3xl font-black uppercase tracking-widest ${getResultColor()} drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]`}
              >
                {renderResult}
              </h2>
            </div>
          )}

          {/* Controls & Stats HUD */}
          <div className="bg-gray-100 border-t-4 border-black p-6 space-y-6">
            {/* Stats Row */}
            <div className="flex justify-between items-center bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col items-center w-1/3 border-r-2 border-dashed border-gray-300">
                <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-wider">
                  Credits
                </span>
                <span className="text-xl md:text-2xl font-black text-primary drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                  {renderCredits}
                </span>
              </div>

              <div className="flex flex-col items-center w-1/3">
                <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-wider">
                  Streak
                </span>
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 border-2 border-black ${
                        index < renderWinCount ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center w-1/3 border-l-2 border-dashed border-gray-300">
                <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-wider">
                  Win Rate
                </span>
                <span className="text-xl md:text-2xl font-black text-gray-800">
                  -
                </span>
              </div>
            </div>

            {/* Action Area */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-center gap-4">
                {choices.map((choice) => (
                  <button
                    key={choice.name}
                    onClick={() => setUserChoice(choice.name)}
                    className={`group relative p-4 border-2 transition-all duration-100 flex flex-col items-center gap-2 w-24 md:w-32
                      ${
                        userChoice === choice.name
                          ? "bg-primary text-white border-black shadow-none translate-x-[2px] translate-y-[2px]"
                          : "bg-white border-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      }
                    `}
                  >
                    <div
                      className={`transition-transform duration-200 ${
                        userChoice === choice.name
                          ? "scale-110"
                          : "group-hover:scale-110"
                      }`}
                    >
                      {choice.icon}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest mt-2 ${
                        userChoice === choice.name ? "text-white" : "text-black"
                      }`}
                    >
                      {choice.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* The "Fight" button styled to match AdminAddProducts "Add This Product" button but with extra pixel game flair */}
              <button
                onClick={() => handlePlayGame()}
                disabled={isPending || !userChoice}
                className={`
                  w-full p-4 flex justify-between items-center rounded-[5px] px-8 
                  border border-black 
                  text-xl font-bold uppercase tracking-widest
                  transition-all duration-100
                  ${
                    isPending || !userChoice
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none border-gray-500"
                      : "bg-primary text-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                  }
                `}
              >
                <span>{isPending ? "Fighting..." : "FIGHT!"}</span>
                <FaHandRock
                  className={`text-2xl ${isPending ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
