import { useMutation } from "@tanstack/react-query";
import React from "react";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminAddFaqs() {
  const { mutate: addFaqsMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/faqs/add-faqs`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added Succesfully!");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handdleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { title, answer } = inputs;

    try {
      addFaqsMutation({ title, answer });

      e.target.reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handdleSubmit}
      className="border font-main border-black w-full p-4 relative rounded-[5px] bg-card"
    >
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className="flex gap-2 p-2 flex-col">
        <div className="flex gap-2 flex-col">
          <label htmlFor="">Faqs Title: </label>
          <input
            name="title"
            id="title"
            type="text"
            className="border border-black w-full rounded-[5px] p-1 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-col">
          <label htmlFor="">Faqs Answer: </label>
          <input
            name="answer"
            id="answer"
            type="text"
            className="border border-black w-full rounded-[5px] p-1 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 p-2">
        <button className="border flex-1 border-black p-2 rounded-[5px] bg-primary text-white">
          Add Faqs
        </button>
        <button className="border w-full  border-black p-2 rounded-[5px] md:w-[20%] bg-red-600 text-white">
          Add Faqs
        </button>
      </div>
    </form>
  );
}
