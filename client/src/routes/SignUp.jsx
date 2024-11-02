import { Link, useNavigate } from "react-router-dom";
import ArrowLine from "../reusable/ArrowLine";
import ShoesBg from "../reusable/ShoesBg";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
// import { useUserStore } from "../stores/useUserStore";

export default function SignUp() {
  const navigate = useNavigate();

  // const {setCurrentUser} = useUserStore()

  const { mutate: signUpMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      navigate(`/sign-in`);
      toast.success("Account created Successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { username, email, password, confirmPassword } = inputs;

    signUpMutation({ username, email, password, confirmPassword });
  };
  return (
    <section className="mt-[180px] p-4 font-main text-primary">
      <div className="max-w-[600px] mx-auto overflow-hidden">
        <div className="relative px-2  mb-4 flex justify-end w-full">
          <div className="relative flex-1">
            <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"} />
          </div>
          <span className="border bg-[#313031] opacity-80 text-white border-[#313031] py-1 rounded-[5px] px-3">
            SIGN UP
          </span>
        </div>
        <form
          onSubmit={handleFormSubmit}
          className="relative border flex gap-2 bg-card flex-col border-[#313031] p-4 rounded-[5px] pt-[50px] pb-[80px] shadow-lg"
        >
          <div className="flex justify-between flex-col">
            <label htmlFor="email" className="uppercase mb-2">
              Email:{" "}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className=" outline-none p-3 bg-transparent border-[#313031] border rounded-[5px]"
            />
          </div>
          <div className="flex justify-between flex-col">
            <label htmlFor="username" className="uppercase mb-2 ">
              Username:{" "}
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className=" outline-none p-3 bg-transparent border-[#313031] border rounded-[5px]"
            />
          </div>
          <div className="flex justify-between flex-col">
            <label htmlFor="password" className="uppercase mb-2 ">
              Password:{" "}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className=" outline-none p-3 bg-transparent border-[#313031] border rounded-[5px]"
            />
          </div>
          <div className="flex justify-between flex-col">
            <label htmlFor="password2" className="uppercase mb-2 ">
              Confirm password:{" "}
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className=" outline-none p-3 bg-transparent border-[#313031] border rounded-[5px]"
            />
          </div>

          <div className="flex justify-center mt-10 gap-2">
            <button
              disabled={isPending}
              className="border p-2 px-5  bg-primary w-[100px] border-none  hover:opacity-95  uppercase font-medium text-white rounded-[5px]"
            >
              sign up
            </button>
          </div>

          <div className="absolute rounded-b-[5px] bottom-0 left-0 right-0 mx-auto bg-indigo-500 h-[40px]">
            {/* white background */}
          </div>
        </form>

        <div className="mt-4 flex justify-between">
          <div className="relative flex-1">
            <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"} />
          </div>
          <div className="text-sm uppercase flex gap-2">
            already have an account?{" "}
            <Link
              to={`/sign-in`}
              className="text-indigo-500 hover:underline text-[17px] uppercase"
            >
              {" "}
              sign in here!
            </Link>
          </div>
        </div>
      </div>
      <ShoesBg botPosition={"5px"} rotatePosition={"45deg"} />
      <ShoesBg
        topPosition={"60px"}
        rightPosition={"30px"}
        rotatePosition={"-20deg"}
      />
    </section>
  );
}
