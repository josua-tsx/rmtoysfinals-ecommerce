import { FaCheckCircle } from "react-icons/fa";
import Buttons from "../reusable/Buttons";
import ValidatedInput from "../reusable/ValidatedInput";
import { addressSchema } from "../schemas/address.schema";

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
import { handleInputChange } from "../reusable/helperFunctions/onChangeInput";

export default function ShippingAddressComponent() {
  const queryClient = useQueryClient();

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [barangay, setBarangay] = useState("");
  const [streetBuildingHouseNum, setStreetBuildingHouseNum] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [editAddressId, setEditAddressId] = useState(null);

  const currentUser = useUserStore((state) => state.currentUser);

  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setSelectedRegion("");
      setSelectedProvince("");
      setSelectedCity("");
      setBarangay("");
      setStreetBuildingHouseNum("");
      toast.success("Sucessfully added address!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
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
      toast.error(err.response.data.message || "Something went wrong!");
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

  const handleAddressSubmit = (e) => {
    e.preventDefault();

    const data = {
      region: selectedRegion?.regionName || "",
      stateProvince: selectedProvince?.provName || "",
      city: selectedCity.toLocaleLowerCase(),
      barangay,
      streetBuildingHouseNum,
    };

    const result = addressSchema.safeParse(data);

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    addAddressMutation(result.data);
  };

  const handleRegionChange = (e) => {
    const selectedRegCode = e.target.value;
    const selecteddRegion = listRegions().find(
      (region) => region.regCode === selectedRegCode,
    );
    setSelectedRegion(selecteddRegion);
    setProvinces(listProvinces(selectedRegCode));
    setSelectedProvince("");
    setCities([]);
    setBarangays([]);
  };

  const handleProvinceChange = (e) => {
    const selectedProvCode = e.target.value;
    const selecteddProvince = provinces.find(
      (province) => province.provCode === selectedProvCode,
    );
    setSelectedProvince(selecteddProvince);
    const cityList = listMuncities(selectedProvCode);
    setCities(cityList);
    if (cityList.length === 1) {
      setSelectedCity(cityList[0].munCityName);
      // Auto-select city means we should also load its barangays
      setBarangays(listBarangays(cityList[0].psgcCode));
    } else {
      setSelectedCity("");
      setBarangays([]);
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    setBarangay("");

    const selectedCityObj = cities.find((c) => c.munCityName === cityName);
    if (selectedCityObj) {
      setBarangays(listBarangays(selectedCityObj.psgcCode));
    } else {
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
    <div className="max-w-4xl mx-auto p-6">
      {openModal && singleAddressEdit && (
        <EditAddress
          address={singleAddressEdit}
          onClose={() => setOpenModal(false)} // Close modal function
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

        <form onSubmit={handleAddressSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                name="country"
                id="contry"
              >
                <option value="Philippines">Philippines</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Region
              </label>
              <select
                value={selectedRegion ? selectedRegion.regCode : ""}
                onChange={handleRegionChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                name="region"
                id="region"
              >
                <option value="">Select Region</option>
                {listRegions().map((region) => (
                  <option key={region.regCode} value={region.regCode}>
                    {region.regionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                State / Province
              </label>
              <select
                value={selectedProvince ? selectedProvince.provCode : ""}
                onChange={handleProvinceChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                name="stateProvince"
                id="stateProvince"
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.provCode} value={province.provCode}>
                    {province.provName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                name="city"
                id="city"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.psgcCode} value={city.munCityName}>
                    {city.munCityName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Barangay
              </label>
              <select
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                name="barangay"
                id="barangay"
                required
                disabled={!selectedCity}
              >
                <option value="">Select Barangay</option>
                {barangays.map((brgy) => (
                  <option key={brgy.psgcCode} value={brgy.brgyName}>
                    {brgy.brgyName}
                  </option>
                ))}
              </select>
            </div>

            <ValidatedInput
              label="Street Name, Building, House No."
              name="streetBuildingHouseNum"
              value={streetBuildingHouseNum}
              onChange={handleInputChange(setStreetBuildingHouseNum)}
              placeholder="Ex: 14 St. #28"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <Buttons
              buttonType="submit"
              buttonName="Save Address"
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
