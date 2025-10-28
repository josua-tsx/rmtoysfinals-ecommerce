import { Fragment, useEffect, useState } from "react";
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
    (state) => state.setCurrentTrackOrder
  );
  const currentTrackOrder = useTrackOrderStore(
    (state) => state.currentTrackOrder
  );
  const clearTrackOrder = useTrackOrderStore((state) => state.clearTrackOrder);
  const currentUser = useUserStore((state) => state.currentUser);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");

  const [singleOrder, setSingleOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const currentStepIndex = happyPathStatuses.indexOf(currentStatus);
  const showProgressBar = currentStepIndex > -1;

  console.log(singleOrder);

  const { mutate: trackMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/order/search-order", {
        phoneNumber: data,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentTrackOrder(data?.allOrders);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message);
    },
  });

  const { mutate: trackSingleOrder } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.post(`/order/track-order/${orderId}`);
      return res.data;
    },
    onSuccess: (data) => {
      setSingleOrder(data);
    },
    onError: (err) => {
      console.log(err?.response?.data?.message);
    },
  });

  const { mutate: updateTrackStatus, isPending: isTrackPending } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(
        `/order/update-track-status/${orderId}`
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      handleSubmit();
      console.log(data);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message);
    },
  });

  useEffect(() => {
    if (singleOrder) {
      console.log(singleOrder?.status);
      setCurrentStatus(singleOrder?.status);
    }
  }, [singleOrder, trackSingleOrder]);

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const handleSubmit = () => {
    trackMutation(searchTerm);
  };

  return (
    <section className="w-full max-w-4xl font-main pt-[130px] mx-auto p-3 space-y-8">
      {openModal && singleOrder && (
        <SingleOrderList
          order={singleOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <CreditPointsAuto />
      <div className="flex flex-col md:flex-row justify-between items-center relative  gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Track order status by phone number"
            value={searchTerm}
            max={11}
            maxLength={11}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border w-full  md:w-[300px] outline-none rounded-[5px] border-black p-2"
          />

          <button
            onClick={() => handleSubmit()}
            disabled={isPending}
            className="flex border  rounded-[5px] bg-primary hover:opacity-95 text-white border-black p-2"
          >
            {isPending ? "Tracking..." : "Track My Order Status"}
          </button>
        </div>
      </div>

      {/* --- Top Card: Order Tracker --- */}
      <div className="bg-card border border-black rounded-[5px] shadow-md p-6 md:p-8">
        {/* Header */}

        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <h1 className="text-2xl font-bold  mb-2 md:mb-0">
            Order ID: <span className="text-blue-500">{singleOrder?._id}</span>
          </h1>
        </div>

        {/* Progress Bar */}
        {/* --- Conditional Progress Bar --- */}
        {showProgressBar && (
          <>
            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex items-center">
                {steps.map((step, index) => {
                  // Use currentStepIndex for logic
                  const isActive = index <= currentStepIndex;
                  const isComplete = index < currentStepIndex;

                  return (
                    <Fragment key={step.name}>
                      {/* Circle and Icon */}
                      <div
                        className={`relative z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full ${
                          isActive ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                      >
                        {isComplete ? (
                          <BsCheck2 className="h-6 w-6 text-white" />
                        ) : (
                          <step.icon
                            className={`h-5 w-5 md:h-6 md:w-6 ${
                              isActive ? "text-white" : "text-gray-500"
                            }`}
                          />
                        )}
                      </div>

                      {/* Connecting Line (not after the last step) */}
                      {index < steps.length - 1 && (
                        <div
                          className={`h-1.5 flex-1 ${
                            isActive ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-center">
              {steps.map((step, index) => (
                <div key={step.name} className="flex-1 px-1">
                  <div className="flex flex-col items-center">
                    {/* Icon for labels */}
                    <div className="mb-2 text-gray-700">
                      <step.icon className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    {/* Text label */}
                    <p
                      className={`text-xs md:text-sm font-semibold ${
                        index <= currentStepIndex
                          ? "text-gray-900"
                          : "text-gray-500" // Use currentStepIndex
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step Labels */}
      </div>

      {/* --- Bottom Card: Status Log --- */}
      <div className="bg-card border border-black rounded-[5px] p-6 md:p-8">
        <div className="space-y-4 h-full max-h-[240px] overflow-y-auto">
          {currentTrackOrder && currentTrackOrder.length > 0 ? (
            currentTrackOrder.map((track) => (
              <div
                key={track?._id}
                className="flex justify-between gap-4 items-center"
              >
                <div className="flex gap-2 items-center w-[450px] overflow-x-auto  md:gap-4 ">
                  <div className="flex-col gap-2 md:flex-row flex">
                    <div className="flex items-center gap-2">
                      <p>Id:</p>
                      <span className="text-blue-500">{track?._id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p>Price: </p>
                      <span className="text-blue-500">
                        {formatPrice(track?.totalPrice)} PHP
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p>Total items: </p>
                    <span className="text-blue-500">
                      {track?.totalItemsOrdered ? track?.totalItemsOrdered : ""}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-col md:flex-row items-center">
                  <button
                    onClick={() => handleOpenSingleOrder(track._id)}
                    className="bg-green-500 text-white p-1 border border-black rounded-[5px] px-5"
                  >
                    View
                  </button>
                  {!currentUser && currentStatus === "Delivered" && (
                    <button
                      disabled={isTrackPending}
                      onClick={() => updateTrackStatus(track._id)}
                      className="bg-green-500 text-white p-1 border border-black rounded-[5px] px-5"
                    >
                      Confirm
                    </button>
                  )}

                  <button
                    onClick={() => trackSingleOrder(track?._id)}
                    className={` ${
                      track?._id === singleOrder?._id
                        ? "bg-black text-white"
                        : "bg-blue-500"
                    } text-white p-1 border border-black rounded-[5px] px-5`}
                  >
                    Track
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">No order to track</div>
          )}
        </div>
      </div>
    </section>
  );
}
