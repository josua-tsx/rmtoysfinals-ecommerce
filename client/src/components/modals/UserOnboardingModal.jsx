import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosInstance from "../../lib/axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "../../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import {
  listRegions,
  listProvinces,
  listMuncities,
  listBarangays,
} from "@jobuntux/psgc";

// Zod Schema for validation (matching API schema)
const onboardingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  region: z.string().min(1, "Region is required"),
  stateProvince: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  barangay: z.string().min(1, "Barangay is required"),
  streetBuildingHouseNum: z.string().min(1, "Street address is required"),
});

export default function UserOnboardingModal({ isOpen, onClose }) {
  const { checkAuth, currentUser } = useUserStore();
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
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
      await checkAuth(); // Refresh user data
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
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Full Name
                      </label>
                      <input
                        {...register("fullName")}
                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium"
                        placeholder="e.g. Juan Dela Cruz"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Phone Number
                      </label>
                      <input
                        {...register("phoneNumber")}
                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium"
                        placeholder="e.g. 09171234567"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.phoneNumber.message}
                        </p>
                      )}
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
                        <input
                          {...register("streetBuildingHouseNum")}
                          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-0 transition-all font-medium text-sm"
                          placeholder="Street / Building / House No."
                        />
                        {errors.streetBuildingHouseNum && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.streetBuildingHouseNum.message}
                          </p>
                        )}
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
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Update Later
                </button>

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-[2] py-3 rounded-xl font-bold bg-black text-white hover:opacity-80 transition-opacity"
                  >
                    Next Step
                  </button>
                ) : (
                  <div className="flex-[2] flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 rounded-xl font-bold bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Complete Setup 🎉"}
                    </button>
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
