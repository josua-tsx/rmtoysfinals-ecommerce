import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaGamepad,
  FaCoins,
  FaHeadset,
  FaRobot,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaStar,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountBenefitsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const benefits = [
    {
      icon: <FaGamepad size={60} />,
      title: "Play & Earn",
      subtitle: "Win Free Credits!",
      description:
        "Challenge our bot to Rock-Paper-Scissors every day. Win streaks earn you real store credits!",
      color: "bg-[#A78BFA]", // Purple
      textColor: "text-purple-900",
      accentColor: "bg-purple-200",
      pattern:
        "radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 20%)",
    },
    {
      icon: <FaCoins size={60} />,
      title: "Shop & Earn",
      subtitle: "Reward Points",
      description:
        "Get reward points for every successful order! Accumulate them to unlock massive discounts on your next purchase.",
      color: "bg-[#FCD34D]", // Yellow
      textColor: "text-yellow-900",
      accentColor: "bg-yellow-200",
      pattern:
        "radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.4) 0%, transparent 20%)",
    },
    {
      icon: <FaRobot size={60} />,
      title: "Smart Help",
      subtitle: "AI Assistant",
      description:
        "Meet Jaloy! Create an account for UNLIMITED 24/7 access to our smart AI assistant. (Guests limited to 3 chats/day).",
      color: "bg-[#60A5FA]", // Blue
      textColor: "text-blue-900",
      accentColor: "bg-blue-200",
      pattern:
        "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 40%)",
    },
    {
      icon: <FaHeadset size={60} />,
      title: "VIP Support",
      subtitle: "Priority Tickets",
      description:
        "Get front-of-the-line access to our support team. We resolve member issues faster!",
      color: "bg-[#F87171]", // Red
      textColor: "text-red-900",
      accentColor: "bg-red-200",
      pattern:
        "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.4) 0%, transparent 20%)",
    },
  ];

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenBenefitsModal");
    if (!hasSeenModal) {
      const timer = setTimeout(() => setIsOpen(true), 1500); // Slightly longer delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenBenefitsModal", "true");
  };

  const nextSlide = () => {
    if (currentSlide < benefits.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-main">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotate: 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm md:max-w-md bg-white rounded-[20px] border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative"
      >
        {/* Dynamic Background */}
        <motion.div
          className="absolute inset-0 z-0 transition-colors duration-500"
          style={{
            backgroundColor: benefits[currentSlide].color
              .replace("bg-[", "")
              .replace("]", ""), // Fallback if tailwind class
            background: benefits[currentSlide].pattern
              ? `${benefits[currentSlide].color.replace("bg-[", "").replace("]", "")}, ${benefits[currentSlide].pattern}`
              : "",
          }}
          animate={{
            backgroundColor:
              benefits[currentSlide].color === "bg-[#A78BFA]"
                ? "#A78BFA"
                : benefits[currentSlide].color === "bg-[#FCD34D]"
                  ? "#FCD34D"
                  : benefits[currentSlide].color === "bg-[#60A5FA]"
                    ? "#60A5FA"
                    : "#F87171",
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-white/50 hover:bg-white text-black rounded-full p-2 border border-black transition-all z-20 hover:scale-110"
        >
          <FaTimes size={16} />
        </button>

        <div className="relative z-10 flex flex-col h-[520px] ">
          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                {/* Icon Container */}
                <div
                  className={`w-32 h-32 rounded-full border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white ${benefits[currentSlide].textColor} relative`}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    {benefits[currentSlide].icon}
                  </motion.div>
                  {/* Decorative Stars */}
                  <FaStar className="absolute -top-2 -right-2 text-yellow-400 drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-2xl animate-bounce" />
                  <FaStar className="absolute bottom-0 -left-2 text-yellow-400 drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-lg animate-pulse" />
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-[15px] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                  <h3
                    className={`text-sm font-bold uppercase tracking-widest mb-1 ${benefits[currentSlide].textColor}`}
                  >
                    {benefits[currentSlide].subtitle}
                  </h3>
                  <h2 className="text-3xl font-black uppercase mb-3 leading-none text-black">
                    {benefits[currentSlide].title}
                  </h2>
                  <p className="text-black text-base">
                    {benefits[currentSlide].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="bg-white/95 border-t-[3px] border-black p-6 rounded-t-[20px]">
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-4">
              {benefits.map((_, index) => (
                <div
                  key={index}
                  className={`h-2.5 rounded-full border border-black transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`p-3 rounded-xl border border-black bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 transition-colors ${currentSlide === 0 ? "invisible" : ""}`}
              >
                <FaArrowLeft />
              </button>

              {currentSlide === benefits.length - 1 ? (
                <Link
                  to="/sign-up"
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Join the Fun! <FaArrowRight />
                </Link>
              ) : (
                <button
                  onClick={nextSlide}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  Next Awesome Thing <FaArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
