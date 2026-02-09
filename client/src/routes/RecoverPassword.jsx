import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import Buttons from "../reusable/Buttons";
import { FaPaperPlane } from "react-icons/fa";
import ValidatedInput from "../reusable/ValidatedInput";
import { forgetPasswordSchema } from "../schemas/auth.schema";

/* replace-imports-start */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
/* replace-imports-end */

export default function RecoverPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: forgetPasswordMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/auth/forget-password`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Sent! Please check your email");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "something went wrong!");
    },
  });

  const onSubmit = (data) => {
    forgetPasswordMutation(data);
  };

  return (
    <section className="h-screen bg-yellow p-4 font-main ">
      <div className="max-w-[600px] h-full flex flex-col justify-center   mx-auto ">
        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative border flex gap-4 bg-card flex-col border-black p-4 rounded-[5px] pt-[40px] pb-[80px] md:pb-[70px] shadow-lg mt-8"
        >
          {/* Sticker Header */}
          <div className="absolute -top-5 -left-4 bg-[#22c55e] text-white border border-black px-6 py-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-30">
            <h1 className="font-black uppercase tracking-widest text-sm italic">
              FORGET PASSWORD
            </h1>
          </div>

          <div className="bg-yellow-50 border-l-4 text-red-700 mb-2 text-sm border-red-700 p-4 ">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex flex-col gap-2">
                <p className="text-md ">
                  <strong>Important:</strong> Your email must be valid—this is
                  where we&apos;ll send your password reset instructions.
                </p>
              </div>
            </div>
          </div>

          <ValidatedInput
            label="Email Address"
            id="email"
            placeholder="Ex: example@domain.com"
            {...register("email")}
            error={errors.email}
            required
          />

          <div className="flex justify-center w-full">
            <Buttons
              buttonType="submit"
              isLoading={isPending}
              loadingText="Sending..."
              buttonName="Send Code"
              icon={<FaPaperPlane size={18} />}
              animateIcon={true}
              className="py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="absolute rounded-b-[5px] bottom-0 left-0 right-0 mx-auto bg-indigo-500 h-[40px]">
            {/* blue accent */}
          </div>
        </form>

        <div className="mt-8 flex justify-end">
          <div className="text-sm flex items-center gap-2">
            Already have an account?{" "}
            <Link
              to={`/sign-in`}
              className="text-indigo-500 hover:underline  text-[18px]"
            >
              {" "}
              Sign In Here!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
