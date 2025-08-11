import React from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminEditFaq() {
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const {
    data: singleFaq = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["singleFaq", params.faqSingleId],
    queryFn: async () => {
      const { faqSingleId } = params;
      const res = await axiosInstance.get(`/faqs/get-faq/${faqSingleId}`);
      return res.data;
    },
    enabled: !!params.faqSingleId,
  });

  useEffect(() => {
    if (singleFaq?.singleFaq) {
      setNewTitle(singleFaq?.singleFaq.title);
      setNewAnswer(singleFaq?.singleFaq.answer);
    }
  }, [singleFaq.singleFaq]);

  const { mutate: updateFaqMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/faqs/update-faq/${singleFaq?.singleFaq._id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["singleFaq", "faqs"] });
      toast.success("Updated Succesfully!");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    updateFaqMutation({ title: newTitle, answer: newAnswer });
  };

  return (
    <section className="bg-yellow font-main h-screen">
      <AdminHeader title={"EDIT FAQ"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form
          onSubmit={handleFormSubmit}
          className="border font-main border-black w-full p-4 relative rounded-[5px] bg-card"
        >
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
          <div className="flex gap-2 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label htmlFor="">Faqs Title: </label>
              <input
                name="title"
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
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
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="border border-black w-full rounded-[5px] p-1 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 p-2">
            <button
              disabled={isPending}
              className="border flex-1 border-black p-2 rounded-[5px] bg-primary text-white"
            >
              {isPending ? "Updatingg..." : "Update Faq"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/faqs")}
              className="border w-full  border-black p-2 rounded-[5px] md:w-[20%] bg-red-600 text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
