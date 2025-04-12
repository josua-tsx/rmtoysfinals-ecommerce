import ArrowLine from "../reusable/ArrowLine";
import { Link, useNavigate } from "react-router-dom";


import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import { useState } from "react";
import { handleInputChange } from "../reusable/helperFunctions/onChangeInput";

export default function SignIn() {

  const navigate = useNavigate()

  const {setCurrentUser} = useUserStore()

    // State to manage password visibility
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    // Toggle the password visibility
    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

  const {mutate: loginMutation, isPending} = useMutation({
    mutationFn: async (userData) => {
      const res = await axiosInstance.post(`/auth/signin`, userData)
      return res.data
    },
    onSuccess: (userData) => {
      setCurrentUser(userData)
      setEmail("")
      setPassword("")
      navigate(`/`)

    },
    onError: (err) => {
      toast.error(err.response.data.message)
    }
  })



  const handleFormSubmit = (e) => {
    e.preventDefault()

   try {
    loginMutation({email, password})
   } catch (error) {
    console.log(error)
   }

  }

  return (
    <section className="pt-[180px] p-4 font-main ">
      <div className="max-w-[600px] bg-yellow h-screen mx-auto overflow-hidden">

      <div className="relative px-2  mb-4 flex justify-end w-full">
         <div className="relative flex-1">
          <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"}/>
          </div>
          <span className="border bg-[#313031] opacity-80 text-white  py-1 rounded-[5px] px-3">SIGN IN</span>
        </div>


        {/* FORM */}
        <form 
        onSubmit={handleFormSubmit}
         className="relative border flex gap-2 bg-card flex-col border-black p-4 rounded-[5px] pt-[50px] pb-[80px] shadow-lg">
         
          <div className="flex justify-between flex-col">
            <label htmlFor="email" className="uppercase mb-2">Email: </label>
            <input type="text" name="email" id="email" value={email} onChange={handleInputChange(setEmail)} className="outline-none p-3 bg-transparent border-black border rounded-[5px]" />
          </div>
          <div className="flex justify-between flex-col">
            <label htmlFor="password" className="uppercase mb-2">Password: </label>
            <div className="flex relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                className=" outline-none p-3 bg-transparent w-full border-[#313031] border rounded-[5px]"
              />
              <label
                htmlFor=""
                className="absolute right-2 top-4 flex items-center gap-2"
              >
                <p className="text-xs">SHOW PASSWORD</p>
                <input
                  type="checkbox"
                  onChange={togglePassword}
                  checked={showPassword}
                  className="border  size-[20px]  border-black"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button disabled={isPending} className="border w-[100px] p-2 px-5 mt-10  bg-primary border-black hover:opacity-95  uppercase font-medium text-white rounded-[5px]">
              {
                isPending ? "Loading.." : "sign in"
              }
            </button>
          </div>


          <div className="absolute rounded-b-[5px] bottom-0 left-0 right-0 mx-auto bg-indigo-500 h-[40px]">
            {/* white background */}
          </div>
        </form>

        

        <div className="mt-4 flex justify-between">
          <div className="relative flex-1">
          <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"}/>
          </div>
          <div className="text-sm uppercase flex gap-2">
            no account yet? {" "} <Link to={`/sign-up`} className="text-indigo-500 hover:underline uppercase text-[17px]"> sign up here!</Link>
          </div>
        </div>
      </div>


    </section>
  );
}
