import { Link } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { useState } from "react";
import ArrowLine from "../reusable/ArrowLine";
import Cart from "./Cart";
import Profile from "./Profile";
import Settings from "./Settings/Settings";
import WishList from "./WishList";

import { navItems } from "../const/const";
import { useUserStore } from "../stores/useUserStore";

// LOGO

import RMTOYSLOGO from "../assets/RMTOYSLOGOFINAL.png";
import CreditsPoints from "./CreditsPoints";

export default function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <header className=" bg-yellow fixed p-4 py-4 top-0 left-0 right-0 z-40">
      <nav className="flex justify-between max-w-[1280px] mx-auto relative">
        {/* MOBILE NAVBAR */}
        <div
          className={` absolute flex flex-col h-screen w-44 transition-all ${
            isExpanded
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-[-900px]"
          } left-[-15px] top-[-15px] backdrop-blur-sm z-50`}
        >
          <div>
            {!currentUser ? (
              <Link to={`/sign-in`}>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="font-main text-2xl pl-[10px] py-[20px]"
                >
                  Sign In
                </button>
              </Link>
            ) : (
              ""
            )}
          </div>

          {/* RENDER NAVBAR LIST ITEMS */}
          <ul className=" p-3 font-main lg:flex  gap-7 h-screen flex flex-col  justify-start text-xl shadow-lg">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link to={`${item.path}`}>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hover:bg-primary hover:text-white p-1 "
                  >
                    {item.name}
                  </button>
                </Link>
              </li>
            ))}
          </ul>

          {currentUser ? (
            <div className="flex-1 flex border-t-gray-400 border justify-between items-center py-2 px-1 bg-card">
              <Profile />
              <Settings />
            </div>
          ) : (
            ""
          )}
        </div>
        {/* DESKTOP NAVBAR */}
        <div className="flex items-center justify-center lg:justify-between w-full z-40">
          <div className="w-full lg:w-[200px]  flex justify-between lg:justify-start items-center relative">
            <div className="lg:hidden">
              <button className="" onClick={() => setIsExpanded(!isExpanded)}>
                <CiMenuFries size={20} />
              </button>
            </div>

            <Link>
              <img src={RMTOYSLOGO} className="w-[90px] " alt="" />
            </Link>

            {currentUser ? (
              <div className="flex gap-3 relative">
                <div className="absolute -left-10  lg:hidden">
                  <Cart />
                </div>
                <div className="lg:hidden">
                  <WishList />
                </div>
              </div>
            ) : isExpanded ? (
              <div></div>
            ) : (
              <div>
                <Link className="md:hidden text-lg" to={`/sign-in`}>Sign In</Link>
              </div>
            )}
          </div>

          <ul className="hidden font-main lg:flex gap-5 z-50 flex-row">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link to={`${item.path}`}>
                  <button className="hover:bg-primary hover:text-white  text-lg ">
                    {item.name}
                  </button>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-5">
                  <CreditsPoints />
                  <Cart />
                  <WishList />
                </div>
                <Settings />
              </div>
            ) : (
              <Link to={`/sign-in`}>
                <button className="font-main text-xl">Sign in</button>
              </Link>
            )}
          </div>
        </div>
        {/* ARROW LINES */}
        <ArrowLine
          arrowWidth={"80%"}
          arrowLeft={"10%"}
          bottomNeg={"-12px"}
        />{" "}
        {/* Reduced z-index */}
        <ArrowLine
          arrowWidth={"30%"}
          arrowRight={"15%"}
          bottomNeg={"-25px"}
        />{" "}
        {/* Reduced z-index */}
        {isExpanded && (
          <div className="fixed inset-0" onClick={() => setIsExpanded(false)} />
        )}
      </nav>
    </header>
  );
}
