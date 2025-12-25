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

            {currentUser && (
              <form
                onSubmit={subscribeMutation}
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
                {isSubscribe ? (
                  <button
                    // onClick={() => openModal()}
                    // type="button"
                    onClick={unsubscribeMutation}
                    className="border bg-red-500 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Unsubscribe
                  </button>
                ) : (
                  <button
                    className={`md:absolute flex justify-center ${
                      isSubscribe
                        ? "w-full rounded-l-[5px]"
                        : " md:rounded-l-none p-1 md:p-0 md:rounded-r-[5px]"
                    } items-center bg-blue-500 hover:bg-primary group right-0 rounded-[5px]  top-0 bottom-0 border border-black px-[10%] md:px-[5%] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
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
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
