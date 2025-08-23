import { useState } from "react";
import PlayGameModal from "./PlayGameModal";
import { useUserStore } from "../stores/useUserStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function FreeCredits() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);

  const { data: singleUser = {} } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/user/get-user/${currentUser._id}`);
      return res.data;
    },
  });

  console.log(singleUser.playLock);

  const { mutate: resetPlayLockMutation, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/random/reset`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.unlocked) {
        toast.success("Play lock reset! You can play now.");
        // Optionally refetch user data
        queryClient.invalidateQueries({ queryKey: ["user"] });
      } else {
        toast.info(`Come back at ${data.lockedUntil} to play again`);
      }
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div className="fixed font-main -left-10 top-[55%]  z-50">
      <div className="relative">
        <button
          onClick={() => {
            setOpenModal(true);
          }}
          className="border border-black p-2 bg-card rotate-90 "
        >
          Claim Free Credits
        </button>

        <div className="fixed text-md md:text-lg font-main inset-0 backdrop-blur-sm flex flex-col justify-center items-center">
          <div className="border flex flex-col relative border-black w-[90%] mx-auto md:w-[600px] pb-12 bg-card rounded-[5px]">
            <div className="  flex flex-col justify-center items-center">
              <h1 className="text-2xl w-full text-white text-center p-4 mb-5 bg-primary rounded-t-[5px]">
                🎮 Rock-Paper-Scissors Game Rules
              </h1>
              <div>
                <p className="text-black w-[80%] mx-auto  text-center">
                  {" "}
                  Win 3 consecutive games to earn free credits! Each win streak
                  rewards you with random credits between 0-20.
                </p>
              </div>
            </div>

            <div className="flex flex-col p-4 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="">⚔️ How to Play</label>
                <ul className="flex flex-col">
                  <li>Choose Rock, Paper, or Scissors</li>
                  <li>Beat the computer's choice to win</li>
                  <li>Win 3 times in a row to claim your reward</li>
                  <li>Come back after 24 hours to play again</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="">🏆 Winning Streak System</label>
                <ul>
                  <li>1st Win: +1 to your streak counte</li>
                  <li>2nd Win: +1 to your streak counter</li>
                  <li>3rd Win: 🎉 Congratulations! You earn random credits!</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="">💰 Reward Tiers</label>
                <ul>
                  <li>✅ You receive your credit reward</li>
                  <li>🔒 Your account gets a 24-hour play lock</li>
                  <li>⏳ You must wait 24 hours to play again</li>
                  <li>🔄 Your win streak resets to 0</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="">☹️ Losing Consequences</label>
                <ul>
                  <li>
                    If you lose at any point, your current win streak decreases
                    by 1
                  </li>
                  <li>Your streak cannot go below 0</li>
                  <li>
                    Losing doesn't trigger the 24-hour lock - only winning 3
                    times does
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => resetPlayLockMutation()}
              className="absolute bottom-0 flex justify-center w-full p-2 bg-primary text-white"
            >
              Play
            </button>
          </div>
        </div>

        {openModal && (
          <PlayGameModal user={singleUser} closeModal={handleCloseModal} />
        )}
      </div>
    </div>
  );
}
