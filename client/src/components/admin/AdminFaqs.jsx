import AdminHeader from "../../reusable/Admin/AdminHeader";
import { MdDelete } from "react-icons/md";
import AdminFaqsTable from "./AdminFaqsTable";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminFaqs() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);
  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");

  const { mutate: addFaqsMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/faqs/add-faqs`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added Succesfully!");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setTitle("");
      setAnswer("");
      setShowAdd(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addFaqsMutation({ title, answer });
  };

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"FAQS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* CARD */}
        </div>

        <div className="w-full  flex gap-2">
          <button
            onClick={() => setShowAdd((prev) => !prev)}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {showAdd ? "Cancel" : "Add Faq"}
            <IoMdAdd />
          </button>

          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {enableMultiDel ? "Cancel Delete" : "Multiple Delete"}
            <MdDelete />
          </button>
        </div>

        <FormModal
          isOpen={showAdd}
          title="Add FAQ"
          onClose={() => setShowAdd(false)}
          onSubmit={handleSubmit}
          submitLabel="Add FAQ"
          isSubmitting={isPending}
        >
          <div className="flex gap-2 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label htmlFor="title">Faqs Title: </label>
              <input
                name="title"
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="border border-black w-full rounded-[5px] p-1 outline-none"
                required
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="answer">Faqs Answer: </label>
              <input
                name="answer"
                id="answer"
                type="text"
                value={answer}
                maxLength={500}
                onChange={(e) => setAnswer(e.target.value)}
                className="border border-black w-full rounded-[5px] p-1 outline-none"
                required
              />
            </div>
          </div>
        </FormModal>

        <AdminFaqsTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
