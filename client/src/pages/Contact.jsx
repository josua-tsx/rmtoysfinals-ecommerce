import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FaPhone, FaFacebook, FaPaperPlane } from "react-icons/fa";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

import Buttons from "../reusable/Buttons";

export default function Contact() {
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  const { mutate: sendEmailMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/send/send-email`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Email Sent!`);
      setSenderEmail("");
      setMessage("");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendEmailMutation({ senderEmail, message });
  };

  return (
    <section className="pt-[130px] p-3 font-main h-full bg-yellow">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col pb-20 pt-20 md:pt-32 gap-10 w-full max-w-md">
            <div className="text-center flex flex-col gap-5">
              <h1 className="text-4xl md:text-5xl ">Contact Us</h1>
              <p className="text-lg md:text-xl text-gray-600">
                Send us messages for any info.
                <br />
                Call us for any emergency to this number
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <FaPhone size={20} />
                <p className="text-xl font-medium"> (+63) 09934587893</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <a
                href="https://www.facebook.com/Rmcarsandmotorbikes"
                target="_blank"
                className="text-gray-700 hover:text-blue-600"
              >
                <FaFacebook size={24} />
              </a>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-6 w-full"
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="senderEmail" className="text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  className="p-3 border border-black rounded focus:outline-primary"
                  placeholder="Your email address"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  maxLength={254}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="text-gray-600">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="p-3 border resize-none border-black rounded focus:outline-primary"
                  placeholder="Your message here..."
                  maxLength={500}
                ></textarea>
              </div>

              {/*  Honeypot (hidden from humans) */}
              <input type="text" name="website" className="hidden" />

              <Buttons
                buttonType="submit"
                isLoading={isPending}
                loadingText="Sending..."
                buttonName="Send"
                icon={<FaPaperPlane size={18} />}
                animateIcon={true}
                className="w-full py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
