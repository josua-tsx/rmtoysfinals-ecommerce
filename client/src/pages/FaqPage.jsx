import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

const List = [
  {
    id: 1,
    question: "What is credit points system and how to use them?",
    answer: `The credit points system rewards you with points every time you complete a successful purchase. Each product includes a certain number of credit points. These points are automatically added to your account after checkout.
You can use your collected points as a discount to reduce the total price of your next order. The more you shop, the more points you earn — helping you save on future purchases!`,
  },
  {
    id: 2,
    question: "What if i forget my password? How to recover it?",
    answer: `The credit points system rewards you with points every time you complete a successful purchase. Each product includes a certain number of credit points. These points are automatically added to your account after checkout.
You can use your collected points as a discount to reduce the total price of your next order. The more you shop, the more points you earn — helping you save on future purchases!`,
  },
  {
    id: 3,
    question: "Where is your physical store located?",
    answer: `The credit points system rewards you with points every time you complete a successful purchase. Each product includes a certain number of credit points. These points are automatically added to your account after checkout.
You can use your collected points as a discount to reduce the total price of your next order. The more you shop, the more points you earn — helping you save on future purchases!`,
  },
  {
    id: 4,
    question: "Do you guys have refund?",
    answer: `The credit points system rewards you with points every time you complete a successful purchase. Each product includes a certain number of credit points. These points are automatically added to your account after checkout.
You can use your collected points as a discount to reduce the total price of your next order. The more you shop, the more points you earn — helping you save on future purchases!`,
  },
  {
    id: 5,
    question: "What is credit points system and how to use them?",
    answer: `The credit points system rewards you with points every time you complete a successful purchase. Each product includes a certain number of credit points. These points are automatically added to your account after checkout.
You can use your collected points as a discount to reduce the total price of your next order. The more you shop, the more points you earn — helping you save on future purchases!`,
  },
];

export default function FaqPage() {
  const [openAnswer, setOpenAnswer] = useState(null);

  const handleToggleList = (id) => {
    setOpenAnswer(openAnswer === id ? null : id);
  };

  return (
    <section className="pt-[130px] bg-yellow h-screen p-3 font-main">
      <div className="max-w-[1280px] h-full mx-auto">
        <div className="flex flex-col justify-center items-center h-full ">
          <div className="text-4xl mb-5">FAQs</div>
          <div className="flex flex-col  md:max-w-[700px] gap-4">
            {List.map((faq) => (
              <li
                className="border flex flex-col gap-4 list-none transition-all duration-300 bg-card  border-[#182b5b] focus:outline-primary text-lg md:text-xl p-2 rounded-[5px] relative cursor-pointer pr-10"
                key={faq.id}
              >
                {faq.question}

                {openAnswer && openAnswer === faq.id && (
                  <p className="text-gray-600">{faq.answer}</p>
                )}

                <button
                  onClick={() => handleToggleList(faq.id)}
                  className="absolute justify-end flex top-2 right-2 inset-0 "
                >
                  <IoMdAdd
                    className={`${
                      openAnswer && openAnswer === faq.id
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
