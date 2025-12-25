import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useUserStore } from "../stores/useUserStore";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../reusable/LoadingSpinner";

import { RiVerifiedBadgeFill } from "react-icons/ri";

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">
          View your personal information and active shipping address
        </p>
      </div>

      <div className="p-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
            <img
              src={currentUser.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentUser.fullName || "No Name Set"}
            </h2>
            <p className="text-gray-500">{currentUser.username}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-primary pl-3">
              Personal Information
            </h2>
            <button
              onClick={() => setActiveComponent("changeinformation")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Edit Information
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-6 border border-black">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{currentUser.email}</p>
                {currentUser.isEmailVerified ? (
                  <RiVerifiedBadgeFill
                    className="text-blue-500"
                    size={16}
                    title="Verified"
                  />
                ) : (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Phone Number
              </label>
              <p className="font-medium text-gray-900">
                {currentUser.phoneNumber || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Username
              </label>
              <p className="font-medium text-gray-900">
                {currentUser.username}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Full Name
              </label>
              <p className="font-medium text-gray-900">
                {currentUser.fullName || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-6 pt-6 ">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-primary pl-3">
              Current Shipping Address
            </h2>
            <button
              onClick={() => setActiveComponent("shippingaddress")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Manage Addresses
            </button>
          </div>

          <div className="space-y-4">
            {isCurrentUserAddressPending ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : currentUserAddress.length > 0 ? (
              <div className="grid gap-4">
                {currentUserAddress.map((add) => (
                  <div
                    key={add._id}
                    onClick={() => handleUpdateCurrentAddress(add._id)}
                    className={`relative cursor-pointer group rounded-lg border p-5 transition-all duration-200 ${
                      add._id === activeAddressId
                        ? "bg-primary/5 border-primary ring-1 ring-primary"
                        : "bg-white border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            add._id === activeAddressId
                              ? "border-primary bg-primary"
                              : "border-gray-300 group-hover:border-primary"
                          }`}
                        >
                          {add._id === activeAddressId && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm leading-relaxed ${
                            add._id === activeAddressId
                              ? "text-gray-900 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {add.fullAddress}
                        </p>
                        {add._id === activeAddressId && (
                          <span className="inline-block mt-2 text-xs font-medium text-primary bg-white px-2 py-1 rounded border border-primary/20">
                            Active Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">
                  No shipping addresses saved
                </p>
                <button
                  onClick={() => setActiveComponent("shippingaddress")}
                  className="text-primary font-medium hover:underline"
                >
                  Add an address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
