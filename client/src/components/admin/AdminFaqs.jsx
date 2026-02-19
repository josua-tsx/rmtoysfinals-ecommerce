import AdminHeader from "../../reusable/Admin/AdminHeader";
import { MdDelete } from "react-icons/md";
import AdminFaqsTable from "./AdminFaqsTable";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ValidatedInput from "../../reusable/ValidatedInput";

// FAQ Schema
const faqSchema = z.object({
  title: z
    .string({ required_error: "Question is required" })
    .min(5, "Question must be at least 5 characters")
    .max(100, "Question cannot exceed 100 characters"),
  answer: z
    .string({ required_error: "Answer is required" })
    .min(10, "Answer must be at least 10 characters")
    .max(500, "Answer cannot exceed 500 characters"),
});

export default function AdminFaqs() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      title: "",
      answer: "",
    },
  });

  const { mutate: addFaqsMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/faqs/add-new-faqs`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added Succesfully!");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      reset();
      setShowAdd(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const onSubmit = (data) => {
    addFaqsMutation(data);
  };

  const toggleShowAdd = () => {
    setShowAdd((prev) => !prev);
    if (!showAdd) reset();
  };

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"Knowledge Base & FAQs"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <div className="flex gap-4">
              <button
                onClick={toggleShowAdd}
                className="flex items-center gap-3 bg-indigo-600 text-white border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group"
              >
                {showAdd ? "CANCEL ADD" : "ADD NEW FAQ"}
                <IoMdAdd
                  className={`text-xl transition-transform ${
                    showAdd ? "rotate-45" : "group-hover:scale-125"
                  }`}
                />
              </button>

              <button
                onClick={() => setEnableMultiDel(!enableMultiDel)}
                className={`flex items-center gap-3 border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group ${
                  enableMultiDel
                    ? "bg-red-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                {enableMultiDel ? "STOP DELETE" : "BATCH DELETE"}
                <MdDelete
                  className={`text-xl ${enableMultiDel ? "" : "text-red-600"}`}
                />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-amber-50 border border-amber-200 p-4 rounded-[5px] border-dashed">
            <div className="size-10 bg-amber-400 border border-black flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-xl">
              ?
            </div>
            <div>
              <p className="font-black uppercase text-[10px] text-amber-800">
                Quick Tip
              </p>
              <p className="text-[10px] font-bold text-amber-600 max-w-[200px]">
                Keep answers concise and informative for the best user
                experience.
              </p>
            </div>
          </div>
        </div>

        <FormModal
          isOpen={showAdd}
          title="Create New FAQ Entry"
          onClose={() => setShowAdd(false)}
          onSubmit={handleSubmit(onSubmit)}
          submitLabel="PUBLISH FAQ"
          isSubmitting={isPending || isSubmitting}
        >
          <div className="flex gap-6 p-4 flex-col bg-gray-50/50">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="title"
                className="font-black uppercase text-xs tracking-widest text-gray-500"
              >
                FAQ Question
              </label>
              <ValidatedInput
                id="title"
                type="text"
                placeholder="e.g., How do I track my order?"
                {...register("title")}
                error={errors.title}
                required
                maxLength={100}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="answer"
                className="font-black uppercase text-xs tracking-widest text-gray-500"
              >
                Detailed Answer
              </label>
              <textarea
                id="answer"
                rows={4}
                placeholder="Provide a clear, helpful response..."
                {...register("answer")}
                className={`border ${errors.answer ? "border-red-500" : "border-black"} w-full rounded-[5px] p-3 font-bold text-sm bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none`}
                required
                maxLength={500}
              ></textarea>
              {errors.answer && (
                <p className="text-red-500 text-xs font-bold">
                  {errors.answer.message}
                </p>
              )}
            </div>
          </div>
        </FormModal>

        <div className="transition-all duration-300">
          <AdminFaqsTable enableMultiDel={enableMultiDel} />
        </div>
      </div>
    </section>
  );
}
