import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

export default function AdminAddFaqs() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");

  const { mutate: addFaqsMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/faqs/add-faqs`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added Succesfully!");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setTitle("");
      setAnswer("");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handdleSubmit = (e) => {
    e.preventDefault();

    try {
      addFaqsMutation({ title, answer });
    } catch (error) {
      console.log(error);
    }
  };

  const clearButton = () => {
    setTitle("");
    setAnswer("");
  };

  return (
    <form
      onSubmit={handdleSubmit}
      className="border font-main border-black w-full relative rounded-[5px] bg-card p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-10"
    >
      <div className="absolute -top-6 -left-4 bg-primary border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs transform -rotate-1">
        Add New FAQ
      </div>

      <div className="flex gap-4 p-2 flex-col">
        <div className="flex gap-3 flex-col">
          <label
            htmlFor="title"
            className="font-black uppercase text-[10px] tracking-widest text-gray-500"
          >
            Faqs Title:{" "}
          </label>
          <input
            name="title"
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Enter the question/title..."
            className="border border-black w-full rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors"
            required
          />
        </div>
        <div className="flex gap-3 flex-col mt-2">
          <label
            htmlFor="answer"
            className="font-black uppercase text-[10px] tracking-widest text-gray-500"
          >
            Faqs Answer:{" "}
          </label>
          <textarea
            name="answer"
            id="answer"
            value={answer}
            maxLength={500}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter the answer/description..."
            className="border border-black w-full rounded-[5px] p-3 h-[150px] outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
            required
          ></textarea>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-2 mt-2">
        <button className="border flex-1 border-black py-3 rounded-[5px] bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95">
          ADD FAQ
        </button>
        <button
          type="button"
          onClick={() => clearButton()}
          className="bg-red-600 text-white md:w-[25%] border border-black rounded-[5px] py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
