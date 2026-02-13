import { FaCheckCircle } from "react-icons/fa";
import Buttons from "../reusable/Buttons";
import ValidatedInput from "../reusable/ValidatedInput";

import {
  listRegions,
  listProvinces,
  listMuncities,
  listBarangays,
} from "@jobuntux/psgc";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import EditAddress from "../pages/EditAddress";
import { useUserStore } from "../stores/useUserStore";
import { ConfirmModal } from "../reusable/ConfirmModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Reusing the same schema pattern or importing if centralized
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

export default function ShippingAddressComponent() {
  const queryClient = useQueryClient();

  // PSGC Lists State
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // PSGC Code Tracking
  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const currentUser = useUserStore((state) => state.currentUser);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "Philippines",
      region: "",
      stateProvince: "",
      city: "",
      barangay: "",
      streetBuildingHouseNum: "",
    },
  });

  const {
    data: currentUserAddress,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["address", currentUser._id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/address/user/${currentUser._id}/address`,
      );
      return res.data;
    },
  });

  const { data: singleAddressEdit } = useQuery({
    queryKey: ["address", editAddressId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/address/get-address/${editAddressId}`,
      );
      return res.data;
    },
    enabled: !!editAddressId,
  });

  const { mutate: addAddressMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/address/add-address`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
      reset(); // Reset form fields
      setSelectedRegionCode("");
      setSelectedProvinceCode("");
      setSelectedCityCode("");
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      toast.success("Successfully added address!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const { mutate: deleteAddressMutation } = useMutation({
    mutationFn: async (addressId) => {
      const res = await axiosInstance.delete(
        `/address/delete-address/${addressId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
      toast.success(`Address deleted successfully!`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  const handleDeleteclick = (addressId) => {
    setSelectedId(addressId);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (selectedId) {
      deleteAddressMutation(selectedId);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedId(null);
    setIsModalOpen(false);
  };

  const onSubmit = (data) => {
    addAddressMutation({
      ...data,
      city: data.city.toLowerCase(),
    });
  };

  // PSGC Handlers
  const handleRegionChange = (e) => {
    const regCode = e.target.value;
    const regionObj = listRegions().find((r) => r.regCode === regCode);

    setSelectedRegionCode(regCode);
    setValue("region", regionObj?.regionName || "");

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

    setBarangays([]);
    setSelectedCityCode("");
    setValue("city", "");
    setValue("barangay", "");

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
    setValue("barangay", "");

    const selectedCityObj = cities.find((c) => c.munCityName === cityName);

    if (selectedCityObj) {
      setSelectedCityCode(selectedCityObj.psgcCode);
      setBarangays(listBarangays(selectedCityObj.psgcCode));
    } else {
      setSelectedCityCode("");
      setBarangays([]);
    }
  };

  const handleOpenEdit = (address) => {
    setEditAddressId(address._id);
    setOpenModal(true);
  };

  if (isPending) return <p>loading...</p>;
  if (isError) return <p>loading...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      {openModal && singleAddressEdit && (
        <EditAddress
          address={singleAddressEdit}
          onClose={() => setOpenModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title={"Delete confirm"}
        message={
          "Are you sure you want to delete this address? This action can not be undone."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Address</h1>
        <p className="text-gray-500 mt-1">
          Manage your shipping addresses for delivery
        </p>
      </div>

      <div className="p-8 space-y-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5 text-amber-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm">
            <span className="font-semibold">Important:</span> Your delivery
            address must be valid and accurate. Incomplete or false addresses
            may result in automatic cancellation of your order.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                {...register("country")}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                disabled
              >
                <option value="Philippines">Philippines</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Region
              </label>
              <select
                onChange={handleRegionChange}
                value={selectedRegionCode}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.region.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                State / Province
              </label>
              <select
                onChange={handleProvinceChange}
                value={selectedProvinceCode}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <select
                onChange={handleCityChange}
                value={watch("city")}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Barangay
              </label>
              {barangays.length > 0 ? (
                <select
                  {...register("barangay")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                  placeholder={
                    selectedCityCode
                      ? "Enter Barangay manually"
                      : "Select City first"
                  }
                  disabled={!selectedCityCode}
                />
              )}
              {errors.barangay && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.barangay.message}
                </p>
              )}
            </div>

            <ValidatedInput
              label="Street Name, Building, House No."
              id="streetBuildingHouseNum"
              {...register("streetBuildingHouseNum")}
              error={errors.streetBuildingHouseNum}
              placeholder="Ex: 14 St. #28"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Buttons
              buttonType="submit"
              buttonName="Save Address"
              isLoading={isPending || isSubmitting}
              icon={<FaCheckCircle className="text-lg" />}
              animateIcon={true}
              className="w-fit px-10 "
            />
          </div>
        </form>

        <div className="pt-6 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-primary pl-3 mb-6">
            Saved Addresses
          </h2>
          <div className="space-y-4">
            {currentUserAddress.length > 0 ? (
              currentUserAddress.map((add) => (
                <div
                  key={add._id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {add.fullAddress}
                    </p>
                    <div className="flex gap-4 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(add)}
                        className="text-xs font-black uppercase tracking-widest border border-black px-4 py-2 bg-white rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteclick(add._id)}
                        className="text-xs font-black uppercase tracking-widest border border-black px-4 py-2 bg-red-700 text-white rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No addresses saved yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
