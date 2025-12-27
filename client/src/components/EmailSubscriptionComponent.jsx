import columnOnePic from "../assets/column1.png";
import { IoMdSend } from "react-icons/io";
import { IoIosNotifications } from "react-icons/io";
import { useUserStore } from "../stores/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";
import { FaCheck } from "react-icons/fa6";
// import { ConfirmModal } from "../reusable/ConfirmModal";

export default function EmailSubscriptionComponent() {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((state) => state.currentUser);
  const [userEmail, setUserEmail] = useState("");
  const [isSubscribe, setIsSubscribe] = useState(false);
  // const [openConfirmModal, setOpenConfirmModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserEmail(currentUser?.email);
      setIsSubscribe(currentUser.isSubscribed);
    }
  }, [currentUser]);

  const { mutate: subscribeMutation } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/subscribe/subscribe-email`);
      return res.data;
    },
    onMutate: async () => {
      setIsSubscribe(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user", "users"] });
      toast.success("Subscribed Succesfully!");
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
      setIsSubscribe(false);
      toast.error(err.response.data.message);
    },
  });

  const { mutate: unsubscribeMutation } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete(`/subscribe/unsubscribe`);
      return res.data;
    },
    onMutate: async () => {
      setIsSubscribe(false);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user", "users"] });
      console.log(data);
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  // const openModal = () => {
  //   setOpenConfirmModal(true);
  // };

  // const cancelModal = () => {
  //   setOpenConfirmModal(false);
  // };

  return (
    <section className="bg-yellow p-3 font-main pt-28">
      {/* <ConfirmModal
        isOpen={openConfirmModal}
        title={"Confirm Unsubscribe"}
        message={"Are you sure you want to unsubscribe?"}
        onCancel={cancelModal}
        onConfirm={confirmModal}
      /> */}

      <div className="max-w-[1280px] mx-auto p-4 relative">
        <div className="absolute -top-4 -left-2 bg-[#22c55e] text-white border border-black px-8 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest ">
            Subscribe
          </h1>
        </div>
        <div className="flex flex-col gap-8 md:flex-row border border-black bg-card p-6 md:p-8 rounded-[5px] relative overflow-hidden">
          <div className="md:flex-1  flex justify-center">
            <img
              src={columnOnePic}
              alt="column 1 picture"
              className=" h-auto w-[570px]"
            />
          </div>

          <div className="flex flex-col md:flex-1 gap-4  w-full text-center items-center justify-center">
            <h2 className="flex items-center gap-2 bg-white border border-black px-4 py-1 rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]  font-black uppercase tracking-widest text-sm">
              Updates
              <IoIosNotifications size={24} className="text-primary" />
            </h2>

            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight">
              Get the latest toy updates!
            </h1>

            <p className="text-gray-600">
              {/* Be the first to know when we add new toys, restock favorites, or
              drop exciting exclusive offers. Subscribe now and receive email
              updates straight to your inbox — no spam, just fun! */}
              Be the first to know when we add new toys. Subscribe now and
              receive email updates straight to your inbox — no spam, just fun!
            </p>

            {currentUser && (
              <form
                onSubmit={subscribeMutation}
                className="w-full flex flex-col gap-2 relative"
              >
                <input
                  type="text"
                  className={`border ${
                    isSubscribe ? "opacity-30" : "opacity-100"
                  } outline-none border-black w-full rounded-[5px] p-3  text-sm shadow-inner`}
                  placeholder="Input your email to subscribe!"
                  value={userEmail}
                  disabled
                />
                {isSubscribe ? (
                  <button
                    onClick={unsubscribeMutation}
                    className="border bg-red-500 text-white rounded-[5px] border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all  font-black uppercase tracking-widest active:scale-95"
                  >
                    Unsubscribe
                  </button>
                ) : (
                  <button
                    className={`md:absolute flex justify-center ${
                      isSubscribe
                        ? "w-full rounded-l-[5px]"
                        : " md:rounded-l-none p-2 md:p-0 md:rounded-r-[5px]"
                    } items-center bg-[#22c55e] hover:bg-primary group right-0 rounded-[5px] top-0 bottom-0 border border-black px-[10%] md:px-[8%] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all active:scale-95`}
                  >
                    {!isSubscribe ? (
                      <div className="flex items-center gap-2">
                        <span className="hidden md:block  font-black text-white uppercase tracking-widest">
                          Join
                        </span>
                        <IoMdSend
                          size={24}
                          className="text-white group-hover:text-black"
                        />
                      </div>
                    ) : (
                      <FaCheck
                        size={30}
                        className="text-white group-hover:text-black"
                      />
                    )}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
