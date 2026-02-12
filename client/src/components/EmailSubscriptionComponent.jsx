import columnOnePic from "../assets/column1.png";
import { IoMdSend } from "react-icons/io";
import { IoIosNotifications } from "react-icons/io";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function EmailSubscriptionComponent() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isSubscribed = currentUser?.isSubscribed ?? false;

  const { mutate: toggleSubscription, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch(`/subscribe/toggle`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(data.message);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  return (
    <section className="bg-yellow p-3 font-main pt-28">
      <div className="max-w-[1280px] mx-auto p-4 relative">
        <div className="absolute -top-4 -left-2 bg-[#22c55e] text-white border border-black px-8 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest ">
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
              Be the first to know when we add new toys. Subscribe now and
              receive email updates straight to your inbox — no spam, just fun!
            </p>

            {currentUser && (
              <div className="w-full flex flex-col gap-2 relative">
                <input
                  type="text"
                  className={`border ${
                    isSubscribed ? "opacity-30" : "opacity-100"
                  } outline-none border-black w-full rounded-[5px] p-3  text-sm shadow-inner`}
                  placeholder="Input your email to subscribe!"
                  value={currentUser.email}
                  disabled
                />
                {isSubscribed ? (
                  <button
                    onClick={() => toggleSubscription()}
                    disabled={isPending}
                    className="border bg-red-500 text-white rounded-[5px] border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all  font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Unsubscribing..." : "Unsubscribe"}
                  </button>
                ) : (
                  <button
                    onClick={() => toggleSubscription()}
                    disabled={isPending}
                    className="md:absolute flex justify-center items-center md:rounded-l-none p-2 md:p-0 md:rounded-r-[5px] bg-[#22c55e] hover:bg-primary group right-0 rounded-[5px] top-0 bottom-0 border border-black px-[10%] md:px-[8%] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span className="hidden md:block  font-black text-white uppercase tracking-widest">
                        {isPending ? "Joining..." : "Join"}
                      </span>
                      <IoMdSend
                        size={24}
                        className="text-white group-hover:text-black"
                      />
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
