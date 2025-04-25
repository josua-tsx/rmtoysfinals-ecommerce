import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Buttons from "../reusable/Buttons";
import { useUserStore } from "../stores/useUserStore";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../reusable/LoadingSpinner";
import { ConfirmModal } from "../reusable/ConfirmModal";
import { useState } from "react";

export default function ProfileComponent({ setActiveComponent }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const queryClient = useQueryClient();

  const {
    data: currentUserAddress = [],
    isLoading: isCurrentUserAddressPending,
    isError: isCurrentUserAddressError,
  } = useQuery({
    queryKey: ["address", currentUser._id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/address/user/${currentUser._id}/address`
      );
      return res.data;
    },
  });

  const { mutate: updateIsActive } = useMutation({
    mutationFn: async (addressId) => {
      const res = await axiosInstance.patch(
        `/address/update-currentAddress`,
        addressId
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
      toast.success("Sucessfully Updated the address!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleUpdateCurrentAddress = (addressId) => {
    updateIsActive({ addressId });
  };

  const activeAddressId = currentUserAddress.find((addr) => addr.isActive)?._id;

  if (isCurrentUserAddressError) return <p>loading...</p>;

  return (
    <div className="">
      <h1 className="text-xl">Profile</h1>
      <div className="my-5 flex flex-col gap-10  max-h-[666px] overflow-y-auto">
        <div className="flex flex-col items-center gap-4 justify-center">
          <p>AVATAR</p>

          <img
            src={currentUser.avatar}
            alt="avatar.img"
            className="w-[150px] h-[150px] rounded-full border border-black object-cover"
          />
        </div>

        <div className="flex flex-col gap-5 w-[90%] md:w-[80%] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center my-2 justify-between text-md md:text-lg ">
            <h1 className="my-5">Personal Information</h1>
            <div onClick={() => setActiveComponent("changeinformation")}>
              <Buttons buttonName={"Edit Information"} />
            </div>
          </div>
          <div className="flex justify-between flex-col gap-4 border border-black p-2 rounded-[5px] bg-card">
            <div className="flex flex-col  justify-between gap-4">
              <div className="flex-1 flex gap-2">
                <label htmlFor="email">Email:</label>
                <p>{currentUser?.email}</p>
              </div>
              <div className="flex-1 flex gap-2">
                <label htmlFor="username">Username: </label>
                <p>{currentUser?.username}</p>
              </div>
            </div>

            <div className="flex flex-col  justify-between gap-4">
              <div className="flex-1 flex gap-2">
                <label htmlFor="number">Phone number:</label>
                <p className={`${!currentUser.phoneNumber ? "text-red-700" : ""}`}>{currentUser?.phoneNumber ? currentUser?.phoneNumber : "You need to update it."}</p>
              </div>
              <div className="flex-1 flex gap-2">
                <label htmlFor="username">Full name: </label>
                <p className={`${!currentUser.fullName ? "text-red-700" : ""}`}>{currentUser?.fullName ? currentUser?.fullName : "You need to update it."}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-[90%] md:w-[80%] mx-auto ">
          <div className="flex flex-col justify-between text-md md:text-lg md:flex-row md:items-center my-2 ">
            <h1 className="my-5">Current Shipping Address</h1>
            <div onClick={() => setActiveComponent("shippingaddress")}>
              <Buttons buttonName={"Edit shipping address"} />
            </div>
          </div>

          {/* ADDRESSES */}
          <div className="flex flex-col justify-between gap-5">
            <div className="flex flex-col lowercase gap-5">
              {isCurrentUserAddressPending ? (
                <div className="flex justify-center items-center">
                  <LoadingSpinner />
                </div>
              ) : currentUserAddress.length > 0 ? (
                currentUserAddress.map((add) => (
                  <div
                    key={add._id}
                    className="flex items-center justify-between"
                  >
                    <label
                      className="bg-gray-200  p-2 border border-black rounded-[5px] w-[95%]"
                      htmlFor={`address-${add._id}`}
                    >
                      {add.fullAddress}
                    </label>
                    <input
                      className="size-5"
                      type="radio"
                      id={`address-${add._id}`}
                      name="address"
                      checked={add._id === activeAddressId}
                      onClick={() => handleUpdateCurrentAddress(add._id)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm lowercase">(You have no saved address)</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
