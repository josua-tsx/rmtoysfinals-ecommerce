import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import axiosInstance from "../lib/axios";
import FaqSkeleton from "./skeleton/FaqSkeleton";

const List = [
  {
    _id: 1,
    title: "What is credit points system and how to use them?",
    answer: `The credit points system rewards you with points every time you complete a successful purchase. Each product includes a certain number of credit points. These points are automatically added to your account after checkout.
You can use your collected points as a discount to reduce the total price of your next order. The more you shop, the more points you earn — helping you save on future purchases!`,
  },
  {
    _id: 2,
    title: "What if i forget my password? How to recover it?",
    answer: `If you forget your password, don’t worry—it’s easy to recover it. Just go to the Sign In page and click on the “Forgot Password?” link. You’ll be asked to enter the email address associated with your account. After submitting your email, please wait for an email from our store with instructions on how to reset your password. Follow the steps in the email to create a new password and regain access to your account.`,
  },
  {
    _id: 3,
    title: "Where is your physical store located?",
    answer: `13St. p6b Lower Bicutan Taguig City`,
  },
  {
    _id: 4,
    title: "Do you guys do refund?",
    answer: `Yes`,
  },
  {
    _id: 5,
    title: "Do you offer international delivery?",
    answer: `No`,
  },
];

export default function Faq() {
  const [openAnswer, setOpenAnswer] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/faqs/get-all-faqs`);
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const handleToggleList = (id) => {
    setOpenAnswer(openAnswer === id ? null : id);
  };

  const faqs = data?.faqs || [];

  return (
    <section className=" bg-yellow p-3 font-main pt-28 ">
      <div className="max-w-[800px] mx-auto relative">
        <div className="flex flex-col justify-center items-center h-full relative">
          <div className="absolute -top-10 -left-2 bg-[#22c55e] text-white border border-black px-8 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform rotate-1 z-20">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest ">
              FAQs
            </h1>
          </div>
          <div className="h-10"></div> {/* Spacer for the sticker */}
          <div className="flex flex-col w-full md:w-[750px] gap-5">
            {isLoading ? (
              <FaqSkeleton />
            ) : faqs && faqs.length > 0 ? (
              faqs.map((faq) => (
                <li
                  className="border flex flex-col w-full list-none transition-all duration-300 bg-card border-black focus:outline-primary p-4 rounded-[5px] relative cursor-pointer pr-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  key={faq._id}
                  onClick={() => handleToggleList(faq._id)}
                >
                  <h3 className=" text-normal tracking-tight pr-4">
                    {faq.title}
                  </h3>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      openAnswer && openAnswer === faq._id
                        ? "grid-rows-[1fr] opacity-100 mt-4"
                        : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden border-t-2 border-black/5 pt-4">
                      <p className="text-gray-700 leading-relaxed font-main">
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-4 top-5">
                    <IoMdAdd
                      size={24}
                      className={`${
                        openAnswer && openAnswer === faq._id
                          ? "rotate-45 text-red-600"
                          : "rotate-0 text-black"
                      } transition-all duration-300 transform scale-125`}
                    />
                  </div>
                </li>
              ))
            ) : (
              List.map((faq) => (
                <>
                  <li
                    className="border flex flex-col w-full list-none transition-all duration-300 bg-card border-black focus:outline-primary p-4 rounded-[5px] relative cursor-pointer pr-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    key={faq._id}
                    onClick={() => handleToggleList(faq._id)}
                  >
                    <h3 className="text-normal md:text-lg  tracking-tight pr-4">
                      {faq.title}
                    </h3>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        openAnswer && openAnswer === faq._id
                          ? "grid-rows-[1fr] opacity-100 mt-4"
                          : "grid-rows-[0fr] opacity-0 mt-0  pointer-events-none"
                      }`}
                    >
                      <div className="overflow-hidden border-t-2 border-black/5 pt-4">
                        <p className="text-gray-700 leading-relaxed font-main">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    <div className="absolute right-4 top-5">
                      <IoMdAdd
                        size={24}
                        className={`${
                          openAnswer && openAnswer === faq._id
                            ? "rotate-45 text-red-600"
                            : "rotate-0 text-black"
                        } transition-all duration-300 transform scale-125`}
                      />
                    </div>
                  </li>
                </>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
