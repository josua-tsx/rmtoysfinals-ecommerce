import React from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export default function AdminEditFaq() {
  const params = useParams();

  const {
    data: singleFaq,
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

  console.log(singleFaq);

  return (
    <section className="bg-yellow font-main h-screen">
      <AdminHeader title={"EDIT FAQ"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form className="border font-main border-black w-full p-4 relative rounded-[5px] bg-card">
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
      </div>
    </section>
  );
}
