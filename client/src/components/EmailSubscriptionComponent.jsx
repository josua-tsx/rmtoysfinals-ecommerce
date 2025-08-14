import React from "react";
import columnOnePic from "../assets/column1.png";
import { IoMdSend } from "react-icons/io";
import { IoIosNotifications } from "react-icons/io";
import { useUserStore } from "../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";
import { FaCheck } from "react-icons/fa6";

export default function EmailSubscriptionComponent() {
  const currentUser = useUserStore((state) => state.currentUser);
  const [userEmail, setUserEmail] = useState("");
  const [isSubscribe, setIsSubscribe] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserEmail(currentUser?.email);
      setIsSubscribe(currentUser.isSubscribed);
    }
  }, [currentUser]);

  const { mutate: subscribeMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/subscribe/subscribe-email`, data);
      return res.data;
    },
    onMutate: async () => {
      setIsSubscribe(true);
    },
    onSuccess: (data) => {
      toast.success("Subscribed Succesfully!");
      console.log(data);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
      setIsSubscribe(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    subscribeMutation({ subscribedEmail: userEmail });
  };

  return (
    <section className="bg-yellow p-3 font-main pt-28 md:pt-36">
      <div className="max-w-[1280px] mx-auto p-4">
        <h1 className="text-center text-3xl mb-5">Subscribe</h1>
        <div className="flex flex-col gap-8 md:flex-row border border-black bg-card p-4 rounded-[5px] ">
          <div className="md:flex-1  flex justify-center">
            <img
              src={columnOnePic}
              alt="column 1 picture"
              className=" h-auto w-[570px]"
            />
          </div>

          <div className="flex flex-col md:flex-1 gap-4  w-full text-center items-center justify-center">
            <h2 className="flex items-center gap-2">
              Updates
              <IoIosNotifications size={30} />
            </h2>

            <h1 className="text-lg md:text-2xl">
              Subscribe for updates to get the latest toy updates!
            </h1>

            <p className="text-gray-600">
              {/* Be the first to know when we add new toys, restock favorites, or
              drop exciting exclusive offers. Subscribe now and receive email
              updates straight to your inbox — no spam, just fun! */}
              Be the first to know when we add new toys. Subscribe now and
              receive email updates straight to your inbox — no spam, just fun!
            </p>

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-2 relative"
            >
              <input
                type="text"
                className={`border ${
                  isSubscribe ? "opacity-0 hidden md:flex" : "opacity-1"
                } outline-none border-black w-full rounded-[5px] p-2`}
                placeholder="Input your email to subscribe!"
                value={userEmail}
                disabled
              />
              <button
                disabled={isSubscribe === true}
                className={`md:absolute flex justify-center ${
                  isSubscribe
                    ? "w-full rounded-l-[5px]"
                    : " md:rounded-l-none p-1 md:p-0 md:rounded-r-[5px]"
                } items-center bg-blue-500 hover:bg-primary group right-0 rounded-[5px]  top-0 bottom-0 border border-black px-[10%] md:px-[5%]`}
              >
                {!isSubscribe ? (
                  <IoMdSend
                    size={30}
                    className="text-white   group-hover:text-black"
                  />
                ) : (
                  <FaCheck
                    size={30}
                    className="text-white   group-hover:text-black"
                  />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
