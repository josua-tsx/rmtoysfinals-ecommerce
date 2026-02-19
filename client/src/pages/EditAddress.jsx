import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import AddressSection from "../hooks/AddressSection";
import {
  listRegions,
  listProvinces,
  listMuncities,
  listBarangays,
} from "@jobuntux/psgc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Address Schema
const addressSchema = z.object({
  country: z.string().default("Philippines"),
  region: z.string().min(1, "Region is required"),
  stateProvince: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  barangay: z.string().min(1, "Barangay is required"),
  streetBuildingHouseNum: z
    .string()
    .min(1, "Street / Building / House No. is required"),
});

const EditAddress = ({ address, onClose }) => {
  const queryClient = useQueryClient();

  // PSGC Lists State
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // PSGC Code Tracking (hook-form stores Names, we track Codes for logic)
  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "Philippines",
      region: address?.region || "",
      stateProvince: address?.stateProvince || "",
      city: address?.city || "",
      barangay: address?.barangay || "",
      streetBuildingHouseNum: address?.streetBuildingHouseNum || "",
    },
  });

  // Watch values for debugging/verification if needed
  // const watchedRegion = watch("region");

  // Initialize data from address prop
  useEffect(() => {
    if (address) {
      // 1. Find Region & set code
      const region = listRegions().find((r) => r.regionName === address.region);
      if (region) {
        setSelectedRegionCode(region.regCode);
        const provs = listProvinces(region.regCode);
        setProvinces(provs);

        // 2. Find Province & set code
        const province = provs.find(
          (p) => p.provName === address.stateProvince,
        );
        if (province) {
          setSelectedProvinceCode(province.provCode);
          const muns = listMuncities(province.provCode);
          setCities(muns);

          // 3. Find City & set code
          const city = muns.find(
            (c) => c.munCityName.toLowerCase() === address.city.toLowerCase(),
          );
          if (city) {
            setSelectedCityCode(city.psgcCode);
            setBarangays(listBarangays(city.psgcCode));
          } else {
            // If city exists in address but not found in PSGC (unlikely but safe fallback)
            // or if it's a district-level city issue
            // We'll trust the stored values and let the user re-select if needed
          }
        }
      }
    }
  }, [address]);

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
    setSelectedProvinceCode("");
    setSelectedCityCode("");

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
    setSelectedCityCode("");
    setValue("city", "");
    setValue("barangay", "");

    // Auto-select if only one city (common for NCR districts)
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

    if (selectedCityObj) {
      setSelectedCityCode(selectedCityObj.psgcCode);
      const brgyList = listBarangays(selectedCityObj.psgcCode);
      setBarangays(brgyList);
    } else {
      setSelectedCityCode("");
      setBarangays([]);
    }
    setValue("barangay", "");
  };

  const { mutate: updateAddressMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/address/edit-address/${address._id}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
      onClose();
      toast.success(`Successfully Updated Address`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    // Ensure city is stored in lowercase to match previous logic if necessary,
    // though usually standardizing casing on display or backend is better.
    // The previous code did: city: selectedCity.toLocaleLowerCase().
    // We'll keep it as is from the form selection (Proper Case usually),
    // or convert if specifically required by backend.
    // Sticking to form value (Proper Case) is usually safer for display,
    // but let's check if the backend *requires* lowercase.
    // The previous code did `city.toLocaleLowerCase()`.
    // Let's coerce it just to be safe and match behavior.
    updateAddressMutation({
      ...data,
      city: data.city.toLowerCase(),
    });
  };

  return (
    <section className="fixed inset-0 z-[60] backdrop-blur-md p-3 font-main overflow-y-auto">
      <div className="min-h-screen flex flex-col justify-center items-center mx-auto pb-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border p-8 w-full max-w-[500px] border-black rounded-[5px] relative flex flex-col gap-6 bg-card mt-12"
        >
          {/* Editing Badge Sticker */}
          <div className="absolute -top-6 -left-4 bg-[#22c55e] border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]  font-black uppercase tracking-widest text-xs transform -rotate-2">
            Editing Address
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute -top-10 right-0 bg-red-600 text-white border border-black px-4 py-1.5 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50 active:scale-95 group  font-black"
          >
            <IoIosClose
              size={28}
              className="group-hover:rotate-90 transition-transform"
            />
          </button>

          <div className="flex flex-col gap-5 pt-2">
            <AddressSection title="Country">
              <select
                {...register("country")}
                className="bg-gray-50 text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
                disabled
              >
                <option value="Philippines">Philippines</option>
              </select>
            </AddressSection>

            <AddressSection title="Region">
              <select
                onChange={handleRegionChange}
                value={selectedRegionCode}
                className="bg-gray-50 text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
              >
                <option value="">Select Region</option>
                {listRegions().map((region) => (
                  <option key={region.regCode} value={region.regCode}>
                    {region.regionName}
                  </option>
                ))}
              </select>
              {/* Hidden input to register value for hook form */}
              <input type="hidden" {...register("region")} />
              {errors.region && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.region.message}
                </p>
              )}
            </AddressSection>

            <AddressSection title="State / Province">
              <select
                onChange={handleProvinceChange}
                value={selectedProvinceCode}
                className="bg-gray-50 text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer disabled:opacity-50"
                disabled={!selectedRegionCode}
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.provCode} value={province.provCode}>
                    {province.provName}
                  </option>
                ))}
              </select>
              <input type="hidden" {...register("stateProvince")} />
              {errors.stateProvince && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.stateProvince.message}
                </p>
              )}
            </AddressSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressSection title="City">
                <select
                  onChange={handleCityChange}
                  value={watch("city")}
                  className="bg-gray-50 text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer disabled:opacity-50"
                  disabled={!selectedProvinceCode}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.psgcCode} value={city.munCityName}>
                      {city.munCityName}
                    </option>
                  ))}
                </select>
                <input type="hidden" {...register("city")} />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message}
                  </p>
                )}
              </AddressSection>

              <AddressSection title="Barangay">
                {barangays.length > 0 ? (
                  <select
                    {...register("barangay")}
                    className="bg-gray-50 text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors focus:shadow-inner cursor-pointer disabled:opacity-50"
                    disabled={!selectedCityCode}
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
                    className="bg-gray-50 text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors focus:shadow-inner disabled:opacity-50"
                    placeholder={
                      selectedCityCode
                        ? "Enter Barangay manually"
                        : "Select City first"
                    }
                    disabled={!selectedCityCode}
                    maxLength={100}
                  />
                )}
                {errors.barangay && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.barangay.message}
                  </p>
                )}
              </AddressSection>
            </div>

            <AddressSection title="Street Name, Building, House No.">
              <input
                {...register("streetBuildingHouseNum")}
                className="bg-gray-50 text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors focus:shadow-inner"
                placeholder="Street Name, Building, House No."
                type="text"
                id="streetBuildingHouseNum"
                maxLength={200}
              />
              {errors.streetBuildingHouseNum && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.streetBuildingHouseNum.message}
                </p>
              )}
            </AddressSection>
          </div>

          <div className="flex pt-4 justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-[5px] bg-[#22c55e] border border-black py-4  font-black uppercase tracking-widest text-white disabled:opacity-70 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all active:scale-95 group"
            >
              {isSubmitting ? "UPDATING..." : "UPDATE ADDRESS"}
              <FaCheckCircle
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditAddress;
