import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

const List = [
  {
    id: 1,
    question: "How do I borrow books from the library web system?",
    answer: `Simply create an account, log in, and browse our digital catalog. 
    When you find a book you want to borrow, click the "Borrow" button. 
    The book will be added to your account, and you can start reading instantly on any device.`,
  },
  {
    id: 2,
    question: "Can I access the library from multiple devices?",
    answer: `Yes! Our library web system is compatible with smartphones, tablets, 
    and desktop computers. You can seamlessly switch between devices and continue reading your borrowed books without any interruptions.`,
  },
  {
    id: 3,
    question: "How long can I borrow a book for?",
    answer: `Borrowed books are typically available for up to 14 days. You’ll be notified when your borrowing period is close to ending, 
    and you can return the book early or renew it if no one else has requested it.`,
  },
  {
    id: 4,
    question: "Is there a limit to how many books I can borrow at once?",
    answer: `You can borrow up to 5 books at a time. If you reach this limit, simply return one book before borrowing a new one.`,
  },
  {
    id: 5,
    question:
      " What happens if I accidentally lose my borrowed book or can’t return it on time?",
    answer: `No worries! Since all books are digital, there's no physical damage or late fees. However, it’s important to return your book on time so others can borrow it. If you need more time, you can request an extension if no one else has the book on hold.`,
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
                className="border flex flex-col gap-4 list-none transition-all duration-300 bg-card  border-[#182b5b] focus:outline-primary text-xl p-2 rounded-[5px] relative cursor-pointer pr-10"
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
