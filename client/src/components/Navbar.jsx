import { Link, useLocation } from "react-router-dom";
import { CiMenuFries as CiMenuIco } from "react-icons/ci";
import { useState } from "react";
import ArrowLine from "../reusable/ArrowLine";
import Cart from "./Cart";
import Profile from "./Profile";
import Settings from "./Settings/Settings";
import SettingsMobile from "./Settings/SettingsMobile";
import { useUserStore } from "../stores/useUserStore";
import CreditsPoints from "./CreditsPoints";
import GuestCart from "./Guestt/GuestCart";
import CustomerOrder from "./CustomerOrder";

// LOGO
import RMTOYSLOGO from "../assets/RMTOYSLOGOFINAL.png";

import {
  MdContactPhone,
  MdOutlineReviews,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { FaFire } from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";

export default function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customerOrderOpen, setCustomerOrderOpen] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const location = useLocation();
  const currentPath = location.pathname;

  const handleOpenCustomerOrder = () => {
    if (openSetting === true) {
      setOpenSetting(false);
    }
    setCustomerOrderOpen((prev) => !prev);
  };

  const handleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleOpenSetting = () => {
    if (customerOrderOpen === true) {
      setCustomerOrderOpen(false);
    }
    setOpenSetting((prev) => !prev);
  };

  const navItems = [
    { name: "Shop", path: "/shop", icon: MdProductionQuantityLimits },
    { name: "Popular", path: "/popular", icon: FaFire },
    { name: "Contacts", path: "/contact", icon: MdContactPhone },
    { name: "Reviews", path: "/reviews", icon: MdOutlineReviews },
    { name: "Tracker", path: "/tracker" },
    { name: "Support", path: "/my-tickets", icon: RiRobot2Fill },
  ];

  return (
    <header className=" bg-yellow fixed p-4 py-4 top-0 left-0 right-0 z-40">
      <nav className="flex justify-between max-w-[1280px] mx-auto relative">
        {/* MOBILE NAVBAR */}
        <div
          className={` fixed flex flex-col h-screen w-[80%] transition-all duration-500 ease-in-out ${
            isExpanded
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-[-100%] pointer-events-none"
          } left-0 top-0 shadow-gray-500 bg-[#fffdf6] shadow-xl backdrop-blur-sm z-50`}
        >
          <div>
            {!currentUser && (
              <Link to={`/sign-in`}>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="font-main text-2xl pl-[10px] py-[20px]"
                >
                  Sign In
                </button>
              </Link>
            )}
          </div>

          {currentUser && (
            <div className="flex-1 flex border-t-gray-400 border justify-start py-2 mb-[20px] px-1 bg-card">
              <Profile />
            </div>
          )}

          <ul className=" p-3 font-main lg:flex relative  gap-7 h-screen flex flex-col  justify-start text-xl shadow-lg">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link to={`${item.path}`}>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className={`w-full px-4 py-1 flex justify-between items-center  transition-all duration-200 border-2 border-transparent rounded-[4px] ${
                      currentPath === item.path
                        ? "bg-primary text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        : "hover:bg-primary/10 text-black px-4 "
                    }`}
                  >
                    <span className="text-lg">{item.name}</span>
                    {item.icon && <item.icon size={22} />}
                  </button>
                </Link>
              </li>
            ))}

            <div className="border-t border-gray-400"></div>

            {currentUser && (
              <SettingsMobile toggle={() => setIsExpanded(false)} />
            )}
          </ul>
        </div>

        {/* DESKTOP NAVBAR */}
        <div className="flex items-center justify-center lg:justify-between w-full z-49">
          <div className="w-full lg:w-[200px]  flex justify-between lg:justify-start items-center relative">
            <div className="lg:hidden">
              <button className="" onClick={handleExpanded}>
                <CiMenuIco size={20} />
              </button>
            </div>

            <Link to="/">
              <img
                src={RMTOYSLOGO}
                className="w-[100px] md:w-[120px] "
                alt="logo"
              />
            </Link>

            {currentUser ? (
              <div className="flex gap-2 relative">
                <div className="absolute -left-10  lg:hidden">
                  <Cart />
                </div>

                <div className="lg:hidden">
                  <CustomerOrder
                    toggle={handleOpenCustomerOrder}
                    openCustomer={customerOrderOpen}
                  />
                </div>
              </div>
            ) : isExpanded ? (
              <div></div>
            ) : (
              <div className="flex gap-4">
                <div className="pr-6">
                  <GuestCart />
                </div>
              </div>
            )}
          </div>

          <ul className="hidden font-main lg:flex gap-5 z-50 flex-row">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link to={`${item.path}`}>
                  <button
                    className={`px-2 py-1.5 text-base  transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] duration-200 rounded-[4px] border-2 border-transparent ${
                      currentPath === item.path
                        ? "bg-primary text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        : "hover:bg-primary hover:text-white hover:-translate-y-0.5"
                    }`}
                  >
                    {item.name}
                  </button>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center w-full gap-4">
                  <CreditsPoints />
                  <Cart />

                  <CustomerOrder
                    toggle={handleOpenCustomerOrder}
                    openCustomer={customerOrderOpen}
                  />
                </div>
                <Settings
                  toggle={handleOpenSetting}
                  openSetting={openSetting}
                />
              </div>
            ) : (
              <div className="flex gap-8 items-center">
                <GuestCart />
                <Link to={`/sign-in`}>
                  <button className="font-main text-xl">Sign in</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ARROW LINES */}
        <ArrowLine arrowWidth={"80%"} arrowLeft={"10%"} bottomNeg={"-12px"} />
        <ArrowLine arrowWidth={"30%"} arrowRight={"15%"} bottomNeg={"-25px"} />

        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500 ease-in-out z-40 ${
            isExpanded
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsExpanded(false)}
        />
      </nav>
    </header>
  );
}
