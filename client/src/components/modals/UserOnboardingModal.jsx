import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import axiosInstance from "../../lib/axios";
import { toast } from "react-hot-toast";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUserStore } from "../../stores/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listRegions,
  listProvinces,
  listMuncities,
  listBarangays,
} from "@jobuntux/psgc";
import ValidatedInput from "../../reusable/ValidatedInput";
import Buttons from "../../reusable/Buttons";

import { onboardingSchema } from "../../schemas/auth.schema";

// Zod Schema (REMOVED: Using shared schema)

export default function UserOnboardingModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  // ⚡ React Query — reactive user data
  const { data: currentUser } = useCurrentUser();
  const checkAuth = useUserStore((state) => state.checkAuth);
  const [step, setStep] = useState(1);

  // PSGC State
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Selected object states to track codes (for PSGC logic) but form stores names
  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      fullName: currentUser?.fullName || "",
      phoneNumber: currentUser?.phoneNumber || "",
      region: "",
      stateProvince: "",
      city: "",
      barangay: "",
      streetBuildingHouseNum: "",
    },
  });

  // Handlers for PSGC
  const handleRegionChange = (e) => {
    const regCode = e.target.value;
    const regionObj = listRegions().find((r) => r.regCode === regCode);

    setSelectedRegionCode(regCode);
    setValue("region", regionObj?.regionName || "");

    // Reset dependent fields
    setProvinces(listProvinces(regCode));
    setCities([]);
    setBarangays([]);
    setValue("stateProvince", "");
    setValue("city", "");
    setValue("barangay", "");
  };

  const handleProvinceChange = (e) => {
    const provCode = e.target.value;
    const provObj = provinces.find((p) => p.provCode === provCode);

    setSelectedProvinceCode(provCode);
    setValue("stateProvince", provObj?.provName || "");

    const cityList = listMuncities(provCode);
    setCities(cityList);

    // Reset dependent fields
    setBarangays([]);
    setValue("city", "");
    setValue("barangay", "");

    // Auto-select if only one city (common in NCR districts treated as provinces in some contexts, though PSGC structure varies)
    if (cityList.length === 1) {
      const city = cityList[0];
      setSelectedCityCode(city.psgcCode);
      setValue("city", city.munCityName);
      setBarangays(listBarangays(city.psgcCode));
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setValue("city", cityName);

    const selectedCityObj = cities.find((c) => c.munCityName === cityName);
    console.log("City Selected:", selectedCityObj);

    if (selectedCityObj) {
      setSelectedCityCode(selectedCityObj.psgcCode);
      const brgyList = listBarangays(selectedCityObj.psgcCode);
      console.log("Barangays found:", brgyList);
      setBarangays(brgyList);
    } else {
      setSelectedCityCode("");
      setBarangays([]);
    }
    setValue("barangay", "");
  };

  // Mutation for onboarding
  const { mutate: completeOnboarding, isPending: loading } = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/user/onboarding", {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: {
          region: data.region,
          stateProvince: data.stateProvince,
          city: data.city,
          barangay: data.barangay,
          streetBuildingHouseNum: data.streetBuildingHouseNum,
        },
      });
    },
    onSuccess: async () => {
      toast.success("Welcome aboard! Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }); // Refresh user data
      await checkAuth(); // Update local Zustand store
      onClose(); // Close modal on success
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleNext = async () => {
    const isValid = await trigger(["fullName", "phoneNumber"]);
    if (isValid) setStep(2);
  };

  const onSubmit = (data) => {
    completeOnboarding(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border-2 border-black"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white text-center">
              <h2 className="text-2xl font-black uppercase tracking-wider">
                Almost There! 🚀
              </h2>
              <p className="text-white/80 text-sm font-medium mt-1">
                Let&apos;s set up your profile for a better experience.
              </p>
            </div>

            {/* Steps Indicator */}
            <div className="flex gap-2 px-6 pt-6 mb-2">
              <div
                className={`h-2 flex-1 rounded-full transition-all ${
                  step >= 1 ? "bg-violet-600" : "bg-gray-200"
                }`}
              />
              <div
                className={`h-2 flex-1 rounded-full transition-all ${
                  step >= 2 ? "bg-violet-600" : "bg-gray-200"
                }`}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-2">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold text-gray-800">
                      Step 1: Personal Details
                    </h3>

                    {/* Full Name */}
                    <div>
                      <ValidatedInput
                        label="Full Name"
                        id="fullName"
                        placeholder="e.g. Juan Dela Cruz"
                        {...register("fullName")}
                        error={errors.fullName}
                        isValid={!errors.fullName && dirtyFields.fullName}
                        maxLength={100}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <ValidatedInput
                        label="Phone Number"
                        id="phoneNumber"
                        placeholder="e.g. 09171234567"
                        {...register("phoneNumber")}
                        error={errors.phoneNumber}
                        isValid={!errors.phoneNumber && dirtyFields.phoneNumber}
                        maxLength={13}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold text-gray-800">
                      Step 2: Shipping Address
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Region */}
                      <div className="col-span-2">
                        <select
                          onChange={handleRegionChange}
                          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium text-sm"
                        >
                          <option value="">Select Region</option>
                          {listRegions().map((region) => (
                            <option key={region.regCode} value={region.regCode}>
                              {region.regionName}
                            </option>
                          ))}
                        </select>
                        <input type="hidden" {...register("region")} />
                        {errors.region && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.region.message}
                          </p>
                        )}
                      </div>

                      {/* Province */}
                      <div>
                        <select
                          onChange={handleProvinceChange}
                          disabled={!selectedRegionCode}
                          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium text-sm disabled:opacity-50"
                        >
                          <option value="">Select Province</option>
                          {provinces.map((province) => (
                            <option
                              key={province.provCode}
                              value={province.provCode}
                            >
                              {province.provName}
                            </option>
                          ))}
                        </select>
                        <input type="hidden" {...register("stateProvince")} />
                        {errors.stateProvince && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.stateProvince.message}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <select
                          onChange={handleCityChange}
                          disabled={!selectedProvinceCode}
                          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium text-sm disabled:opacity-50"
                        >
                          <option value="">Select City</option>
                          {cities.map((city) => (
                            <option
                              key={city.psgcCode}
                              value={city.munCityName}
                            >
                              {city.munCityName}
                            </option>
                          ))}
                        </select>
                        <input type="hidden" {...register("city")} />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      {/* Barangay */}
                      <div className="col-span-2">
                        {barangays.length > 0 ? (
                          <select
                            {...register("barangay")}
                            disabled={!selectedCityCode}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium text-sm disabled:opacity-50"
                          >
                            <option value="">Select Barangay</option>
                            {barangays.map((brgy) => (
                              <option key={brgy.psgcCode} value={brgy.brgyName}>
                                {brgy.brgyName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            {...register("barangay")}
                            disabled={!selectedCityCode}
                            placeholder={
                              selectedCityCode
                                ? "Enter Barangay manually"
                                : "Select City first"
                            }
                            maxLength={100}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium text-sm disabled:opacity-50"
                          />
                        )}
                        {errors.barangay && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.barangay.message}
                          </p>
                        )}
                      </div>

                      {/* Street */}
                      <div className="col-span-2">
                        <ValidatedInput
                          id="streetBuildingHouseNum"
                          placeholder="Street / Building / House No."
                          {...register("streetBuildingHouseNum")}
                          error={errors.streetBuildingHouseNum}
                          isValid={
                            !errors.streetBuildingHouseNum &&
                            dirtyFields.streetBuildingHouseNum
                          }
                          maxLength={200}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-md font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  Update Later
                </button>

                {step === 1 ? (
                  <div className="flex-[2]">
                    <Buttons
                      type="button"
                      onClick={handleNext}
                      buttonName="Next Step"
                      className="w-full py-3 bg-[#22c55e]  border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    />
                  </div>
                ) : (
                  <div className="flex-[2] flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-md font-bold bg-white text-black border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      Back
                    </button>
                    <div className="flex-1">
                      <Buttons
                        buttonType="submit"
                        isLoading={loading}
                        loadingText="Saving..."
                        buttonName="Continue"
                        className="w-full py-3 bg-indigo-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
