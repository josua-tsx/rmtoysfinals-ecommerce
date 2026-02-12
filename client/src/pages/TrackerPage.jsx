import { useEffect, useState, useRef, useCallback } from "react";
import { BsCheck2, BsFileText, BsSend, BsTruck } from "react-icons/bs";
import { CgHome } from "react-icons/cg";
import { CiMonitor } from "react-icons/ci";
import CreditPointsAuto from "../components/CreditPointsAuto";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import useTrackOrderStore from "../stores/usesTrackStore";
import formatPrice from "../reusable/formatPrice";
import { useUserStore } from "../stores/useUserStore";
import SingleOrderList from "../components/SingleOrderList";
import { phMobileSchema } from "../schemas/common.schema";

const steps = [
  { name: "Pending", icon: BsFileText },
  { name: "Processing", icon: CiMonitor },
  { name: "Shipped", icon: BsSend },
  { name: "Out for Delivery", icon: BsTruck },
  { name: "Delivered", icon: CgHome },
];

const happyPathStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function TrackerPage() {
  const setCurrentTrackOrder = useTrackOrderStore(
    (state) => state.setCurrentTrackOrder,
  );
  const currentTrackOrder = useTrackOrderStore(
    (state) => state.currentTrackOrder,
  );

  const currentUser = useUserStore((state) => state.currentUser);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");

  const [singleOrder, setSingleOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  console.log(singleOrder);

  const currentStepIndex = happyPathStatuses.indexOf(currentStatus);
  const showProgressBar = currentStepIndex > -1;

  // ── OTP State ──
  const [otpToken, setOtpToken] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const cooldownRef = useRef(null);
  const expiryRef = useRef(null);

  // ── Timer Callbacks (Define BEFORE Mutations) ──
  const startCooldown = useCallback(() => {
    setOtpCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startExpiry = useCallback(() => {
    setOtpExpiry(300);
    if (expiryRef.current) clearInterval(expiryRef.current);
    expiryRef.current = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(expiryRef.current);
          setOtpSent(false);
          toast.error("OTP expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Mutations (Define BEFORE Effects) ──

  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: async (phoneNumber) => {
      const res = await axiosInstance.post("/otp/send", {
        identifier: phoneNumber,
        channel: "sms",
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("OTP sent to your phone!");
      setOtpSent(true);
      startCooldown();
      startExpiry();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to send OTP.");
    },
  });

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: async ({ phoneNumber, otp }) => {
      const res = await axiosInstance.post("/otp/verify", {
        identifier: phoneNumber,
        otp,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Phone verified! Tracking orders...");
      setOtpToken(data.otpToken);
      setIsPhoneVerified(true);
      setOtpSent(false);
      setOtpCode("");
      if (expiryRef.current) clearInterval(expiryRef.current);

      // Auto-trigger search after verification
      trackMutation({ phoneNumber: searchTerm, otpToken: data.otpToken });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Invalid OTP.");
    },
  });

  const { mutate: trackMutation, isPending: isTracking } = useMutation({
    mutationFn: async ({ phoneNumber, otpToken }) => {
      const res = await axiosInstance.post("/order/search-order", {
        phoneNumber,
        otpToken,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentTrackOrder(data?.allOrders || []);
      if (data?.allOrders?.length === 0) {
        toast("No active orders found for this number.", { icon: "ℹ️" });
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to fetch orders");
    },
  });

  const { mutate: trackSingleOrder } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.post(`/order/track-order/${orderId}`);
      return res.data;
    },
    onSuccess: (data) => {
      setSingleOrder(data);
      setCurrentStatus(data?.status);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to track order");
    },
  });

  const { mutate: updateTrackStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationFn: async (orderId) => {
        const res = await axiosInstance.put(
          `/order/update-track-status/${orderId}`,
        );
        return res.data;
      },
      onSuccess: (data) => {
        toast.success(data.message);
        // Refresh list
        handleSubmit();
        // Refresh single order view if open
        if (singleOrder) trackSingleOrder(singleOrder._id);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message);
      },
    });

  // ── Effects (Run AFTER Mutations are defined) ──

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (expiryRef.current) clearInterval(expiryRef.current);
    };
  }, []);

  // Auto-verify and track for logged-in users
  useEffect(() => {
    if (currentUser?.phoneNumber) {
      setSearchTerm(currentUser.phoneNumber);
      setIsPhoneVerified(true);
      // Auto-fetch orders
      trackMutation({ phoneNumber: currentUser.phoneNumber });
    } else {
      setIsPhoneVerified(false);
    }
  }, [currentUser, trackMutation]);

  // ── Handlers ──

  const handleOpenSingleOrder = (order) => {
    setSingleOrder(order); // Pre-fill with available data
    setOpenModal(true);
  };

  const handleSubmit = () => {
    // Validate Phone
    const validation = phMobileSchema.safeParse(searchTerm);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    // Check if verified
    if (!isPhoneVerified) {
      // Trigger OTP flow
      sendOtp(searchTerm);
    } else {
      // Already verified, just search
      trackMutation({ phoneNumber: searchTerm, otpToken });
    }
  };

  const handleVerify = () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }
    verifyOtp({ phoneNumber: searchTerm, otp: otpCode });
  };

  return (
    <section className="w-full max-w-4xl font-main pt-[130px] mx-auto p-3 space-y-8 min-h-[80vh]">
      {openModal && singleOrder && (
        <SingleOrderList
          order={singleOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      {currentUser && <CreditPointsAuto />}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Track Your Orders</h1>
          <p className="text-gray-500">
            Enter your phone number to verify and track your orders.
          </p>
        </div>

        {/* ── Search / Verification Input ── */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full md:max-w-md space-y-3">
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Ex: 09xxxxxxxxx"
                value={searchTerm}
                maxLength={11}
                disabled={isPhoneVerified}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setSearchTerm(val);

                  // If matches logged-in user, auto-verify. Else require OTP.
                  if (
                    currentUser?.phoneNumber &&
                    val === currentUser.phoneNumber
                  ) {
                    setIsPhoneVerified(true);
                  } else {
                    setIsPhoneVerified(false);
                  }
                }}
                className={`flex-1 border text-lg p-3 rounded-[5px] border-black outline-none ${isPhoneVerified ? "bg-green-50 border-green-500 text-green-700 font-semibold" : ""}`}
              />
              {!isPhoneVerified && (
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSendingOtp || otpCooldown > 0 || searchTerm.length < 11
                  }
                  className="bg-primary text-white px-6 rounded-[5px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSendingOtp
                    ? "Sending..."
                    : otpCooldown > 0
                      ? `Wait ${otpCooldown}s`
                      : "Send OTP"}
                </button>
              )}
              {isPhoneVerified && (
                <button
                  onClick={handleSubmit}
                  disabled={isTracking}
                  className="bg-black text-white px-6 rounded-[5px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all whitespace-nowrap"
                >
                  {isTracking ? "Refreshing..." : "Refresh"}
                </button>
              )}
            </div>

            {/* OTP Input Section */}
            {!isPhoneVerified && otpSent && (
              <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-400 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-700">
                      Enter Verification Code
                    </span>
                    <span className="text-orange-600 font-medium">
                      Expires in {Math.floor(otpExpiry / 60)}:
                      {String(otpExpiry % 60).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      maxLength={6}
                      placeholder="6-digit code"
                      className="flex-1 border border-gray-300 rounded-[5px] p-2 text-center tracking-[0.5em] font-mono text-lg"
                    />
                    <button
                      onClick={handleVerify}
                      disabled={isVerifyingOtp || otpCode.length < 6}
                      className="bg-green-600 text-white px-4 rounded-[5px] font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isVerifyingOtp ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tracker Content (Gated) ── */}
      {isPhoneVerified && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* --- Top Card: Order Tracker Details --- */}
          {singleOrder && (
            <div className="bg-card border border-black rounded-[5px] shadow-md p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
                <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">
                  Order ID:{" "}
                  <span className="text-blue-600 font-mono">
                    {singleOrder._id}
                  </span>
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold border border-black ${
                    singleOrder.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {singleOrder.status}
                </span>
              </div>

              {/* Progress Bar */}
              {showProgressBar && (
                <>
                  <div className="mb-12 relative">
                    {/* Line Background */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-0" />

                    <div className="flex justify-between items-center relative z-10 w-full">
                      {steps.map((step, index) => {
                        const isActive = index <= currentStepIndex;
                        const isComplete = index < currentStepIndex;

                        return (
                          <div
                            key={step.name}
                            className="flex flex-col items-center flex-1"
                          >
                            <div
                              className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isActive
                                  ? "bg-indigo-600 border-indigo-600 shadow-lg scale-110"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {isComplete ? (
                                <BsCheck2 className="h-6 w-6 text-white" />
                              ) : (
                                <step.icon
                                  className={`h-5 w-5 md:h-6 md:w-6 ${
                                    isActive ? "text-white" : "text-gray-400"
                                  }`}
                                />
                              )}
                            </div>
                            <p
                              className={`mt-3 text-xs md:text-sm font-semibold text-center ${
                                isActive ? "text-indigo-900" : "text-gray-400"
                              }`}
                            >
                              {step.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* --- Bottom Card: Order List --- */}
          <div className="bg-card border border-black rounded-[5px] p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">Your Information</h2>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Verified Phone Number</p>
              <p className="text-lg font-bold text-gray-900 font-mono tracking-wider">
                {searchTerm}
              </p>
            </div>

            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-3 h-full max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {currentTrackOrder && currentTrackOrder.length > 0 ? (
                currentTrackOrder.map((track) => (
                  <div
                    key={track._id}
                    className={`flex flex-col md:flex-row justify-between gap-4 items-center p-4 rounded-lg border transition-all ${
                      singleOrder?._id === track._id
                        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                        : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase font-bold">
                            Order ID
                          </span>
                          <span className="font-mono text-sm font-medium">
                            {track._id}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase font-bold">
                            Total
                          </span>
                          <span className="font-mono text-sm font-medium text-green-700">
                            {formatPrice(track.totalPrice)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase font-bold">
                            Items
                          </span>
                          <span className="font-mono text-sm font-medium">
                            {track.totalItemsOrdered || 0}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase font-bold">
                            Status
                          </span>
                          <span
                            className={`text-sm font-bold ${track.status === "Delivered" ? "text-green-600" : "text-orange-600"}`}
                          >
                            {track.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <button
                        onClick={() => handleOpenSingleOrder(track)}
                        className="flex-1 bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>

                      {/* Only show Confirm if status is Delivered AND not yet confirmed? 
                          Wait, existing logic checks currentStatus. 
                          Ideally we check track.status directly. 
                      */}
                      {!currentUser && track.status === "Delivered" && (
                        <button
                          disabled={isUpdatingStatus}
                          onClick={() => updateTrackStatus(track._id)}
                          className="bg-green-600 text-white px-4 py-2 border border-green-700 rounded hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                        >
                          Confirm Receipt
                        </button>
                      )}

                      <button
                        onClick={() => trackSingleOrder(track._id)}
                        className={`${
                          track._id === singleOrder?._id
                            ? "bg-indigo-700 border-indigo-900"
                            : "bg-black border-black"
                        } text-white px-4 py-2 border rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-sm font-bold tracking-wide`}
                      >
                        {track._id === singleOrder?._id ? "Viewing" : "Track"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">
                    No pending orders found for this number.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
