import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import axiosInstance from "../lib/axios";

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

  const {
    data: faqsComponent = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/faqs/get-faqs`);
      return res.data;
    },
  });

  console.log(faqsComponent);

  const handleToggleList = (id) => {
    setOpenAnswer(openAnswer === id ? null : id);
  };

  return (
    <section className=" bg-yellow p-3 font-main pt-28 md:pt-36">
      <div className="">
        <div className="flex flex-col justify-center items-center h-full ">
          <div className="text-3xl mb-5">FAQs</div>
          <div className="flex flex-col  md:w-[750px] gap-5">
            {faqsComponent && faqsComponent.length > 0
              ? faqsComponent.map((faq) => (
                  <li
                    className="border flex flex-col gap-4 list-none transition-all duration-300 bg-card  border-[#182b5b] focus:outline-primary text-lg md:text-xl p-2 rounded-[5px] relative cursor-pointer pr-10"
                    key={faq._id}
                  >
                    {faq.title}

                    {openAnswer && openAnswer === faq._id && (
                      <p className="text-gray-600">{faq.answer}</p>
                    )}

                    <button
                      onClick={() => handleToggleList(faq._id)}
                      className="absolute justify-end flex top-2 right-2 inset-0 "
                    >
                      <IoMdAdd
                        className={`${
                          openAnswer && openAnswer === faq._id
                            ? "rotate-90"
                            : "rotate-0"
                        } transition-transform duration-300`}
                      />
                    </button>
                  </li>
                ))
              : List.map((faq) => (
                  <li
                    className="border flex flex-col gap-4 list-none transition-all duration-300 bg-card  border-[#182b5b] focus:outline-primary text-lg md:text-xl p-2 rounded-[5px] relative cursor-pointer pr-10"
                    key={faq._id}
                  >
                    {faq.title}

                    {openAnswer && openAnswer === faq._id && (
                      <p className="text-gray-600">{faq.answer}</p>
                    )}

                    <button
                      onClick={() => handleToggleList(faq._id)}
                      className="absolute justify-end flex top-2 right-2 inset-0 "
                    >
                      <IoMdAdd
                        className={`${
                          openAnswer && openAnswer === faq._id
                            ? "rotate-90"
                            : "rotate-0"
                        } transition-transform duration-300`}
                      />
                    </button>
                  </li>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
