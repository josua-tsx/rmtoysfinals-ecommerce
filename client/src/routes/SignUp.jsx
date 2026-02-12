import Buttons from "../reusable/Buttons";
import { Link, useNavigate } from "react-router-dom";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { FaUserPlus } from "react-icons/fa";
import PasswordInput from "../reusable/PasswordInput";
import ValidatedInput from "../reusable/ValidatedInput";
import { signupSchema } from "../schemas/auth.schema";
import { useUserStore } from "../stores/useUserStore";

/* replace-imports-start */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
/* replace-imports-end */

export default function SignUp() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { checkAuth } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: signUpMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: async () => {
      await checkAuth(); // Updates the user store immediately
      // Clear any snoozed state from previous sessions
      sessionStorage.removeItem("snoozeOnboarding");
      navigate(`/`);
      toast.success("Account created Successfully");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    signUpMutation(data);
  };

  return (
    <section className="h-screen pt-28 bg-yellow p-4 font-main">
      <div className="max-w-[600px] h-full flex flex-col justify-center   mx-auto ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative border flex gap-2 bg-card flex-col border-[#313031] p-4 rounded-[5px] pt-[40px] pb-[70px] shadow-lg mt-8"
        >
          {/* Sticker Header */}
          <div className="absolute -top-5 -left-4 bg-[#22c55e] text-white border border-black px-6 py-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-30">
            <h1 className="font-black uppercase tracking-widest text-sm italic">
              SIGN UP
            </h1>
          </div>

          <ValidatedInput
            label="Email:"
            id="email"
            placeholder="Ex: example@domain.com"
            {...register("email")}
            error={errors.email}
            required
          />

          <ValidatedInput
            label="Username:"
            id="username"
            placeholder="Ex: johndoe123"
            {...register("username")}
            error={errors.username}
            required
            errorText="(3-30 chars, no special characters)"
          />

          <PasswordInput
            label="Password:"
            id="password"
            {...register("password")}
            errorText={
              errors.password
                ? errors.password.message
                : "(At least 8 chars, 1 uppercase, symbol, and number)"
            }
            className={errors.password ? "border-red-500" : ""}
          />

          <PasswordInput
            label="Confirm password:"
            id="confirmPassword"
            {...register("confirmPassword")}
            errorText={errors.confirmPassword?.message}
            className={errors.confirmPassword ? "border-red-500" : ""}
          />

          <div className="flex justify-center mt-4 gap-2">
            <Buttons
              buttonType="submit"
              isLoading={isPending}
              loadingText="Signing Up..."
              buttonName="Sign Up"
              icon={<FaUserPlus size={20} />}
              animateIcon={true}
              className=" py-4 "
            />
          </div>

          <div className="absolute rounded-b-[5px] bottom-0 left-0 right-0 mx-auto bg-indigo-500 h-[40px]">
            {/* blue accent */}
          </div>
        </form>

        <div className="mt-8 flex justify-end">
          <div className="text-sm flex gap-2">
            Already have an account?{" "}
            <Link
              to={`/sign-in`}
              className="text-indigo-500 hover:underline text-[18px] "
            >
              {" "}
              Sign in here!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
