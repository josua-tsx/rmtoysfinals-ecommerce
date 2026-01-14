import Buttons from "../reusable/Buttons";
import { Link, useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useState } from "react";
import { handleInputChange } from "../reusable/helperFunctions/onChangeInput";
import { FaUserPlus } from "react-icons/fa";
import PasswordInput from "../reusable/PasswordInput";
import ValidatedInput from "../reusable/ValidatedInput";
import { signupSchema } from "../schemas/auth.schema";
import { emailSchema, usernameSchema } from "../schemas/common.schema";

export default function SignUp() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: signUpMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate(`/sign-in`);
      toast.success("Account created Successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = { username, email, password, confirmPassword };
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    signUpMutation(result.data);
  };

  return (
    <section className="h-screen pt-28 bg-yellow p-4 font-main">
      <div className="max-w-[600px] h-full flex flex-col justify-center   mx-auto ">
        <form
          onSubmit={handleFormSubmit}
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
            name="email"
            value={email}
            onChange={handleInputChange(setEmail)}
            schema={emailSchema}
            placeholder="Ex: example@domain.com"
            required
          />

          <ValidatedInput
            label="Username:"
            name="username"
            value={username}
            onChange={handleInputChange(setUsername)}
            schema={usernameSchema}
            placeholder="Ex: johndoe123"
            required
            errorText="(3-30 chars, no special characters)"
          />

          <PasswordInput
            label="Password:"
            name="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            errorText="(At least 8 chars, 1 uppercase, symbol, and number)"
          />

          <PasswordInput
            label="Confirm password:"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword)}
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
