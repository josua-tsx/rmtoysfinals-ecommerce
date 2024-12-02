import { FaCheckCircle } from "react-icons/fa";
import AddressSection from "../hooks/AddressSection";

import {
  regions,
  getProvincesByRegion,
  getCityMunByProvince,
} from "phil-reg-prov-mun-brgy";
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

  const [barangay, setBarangay] = useState("");
  const [streetBuildingHouseNum, setStreetBuildingHouseNum] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [editAddressId, setEditAddressId] = useState(null);

  const currentUser = useUserStore((state) => state.currentUser);


  const [selectedId, setSelectedId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: currentUserAddress,
    isPending,
    isError,
    error
  } = useQuery({
    queryKey: ["address", currentUser._id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/address/user/${currentUser._id}/address`);
      return res.data;
    },
  });

  const { data: singleAddressEdit } = useQuery({
    queryKey: ["address", editAddressId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/address/get-address/${editAddressId}`
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
        `/address/delete-address/${addressId}`
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
    setSelectedId(addressId)
    setIsModalOpen(true)
  }

  const handleConfirm = () => {
    if (selectedId) {
      deleteAddressMutation(selectedId)
      setIsModalOpen(false)
    }
  }

  const handleCancel = () => {
    setSelectedId(null)
    setIsModalOpen(false)
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();

    addAddressMutation({
      region: selectedRegion.name,
      stateProvince: selectedProvince.name,
      city: selectedCity.toLocaleLowerCase(),
      barangay,
      streetBuildingHouseNum,
    });
  };

  const handleRegionChange = (e) => {
    const selectedRegCode = e.target.value;
    const selecteddRegion = regions.find(
      (region) => region.reg_code === selectedRegCode
    );
    setSelectedRegion(selecteddRegion);
    setProvinces(getProvincesByRegion(selectedRegCode));
    setSelectedProvince("");
    setCities([]);
  };

  const handleProvinceChange = (e) => {
    const selectedProvCode = e.target.value;
    const selecteddProvince = provinces.find(
      (province) => province.prov_code === selectedProvCode
    );
    setSelectedProvince(selecteddProvince);
    setCities(getCityMunByProvince(selectedProvCode));
    setSelectedCity("");
  };

  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    setSelectedCity(cityCode);
  };

  const handleOpenEdit = (address) => {
    setEditAddressId(address._id);
    setOpenModal(true);
  };


  if (isPending) return <p>loading...</p>
  if (isError) return <p>loading...</p>




  return (
    <div>
      {openModal && singleAddressEdit && (
        <EditAddress
          address={singleAddressEdit}
          onClose={() => setOpenModal(false)} // Close modal function
        />
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title={"Delete confirm"}
        message={"Are you sure you want to delete this address? This action can not be undone."}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <h1 className="text-xl">SHIPPING ADDRESS</h1>
      <div className="w-[90%] md:w-[80%] mx-auto my-5">
        <form onSubmit={handleAddressSubmit} className="flex flex-col gap-5">
          {/* <div className="flex justify-end">
            <button
              type="button"
              className="hover:opacity-95 uppercase flex items-center border gap-5 px-5 border-black p-2 rounded-[5px] bg-primary text-card"
            >
              Add new address
              <FaCheckCircle size={15} />
            </button>
          </div> */}

          <AddressSection title={"Country"}>
            <select
              className="bg-gray-200  p-2 border border-black rounded-[5px]"
              name="country"
              id="contry"
            >
              <option value="Philippines">Philippines</option>
            </select>
          </AddressSection>

          <AddressSection title={"Region"}>
            <select
              value={selectedRegion ? selectedRegion.reg_code : ""}
              onChange={handleRegionChange}
              className="bg-gray-200  p-2 border border-black rounded-[5px]"
              name="region"
              id="region"
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.name} value={region.reg_code}>
                  {region.name}
                </option>
              ))}
            </select>
          </AddressSection>

          <AddressSection title={"State / Province"}>
            <select
              value={selectedProvince ? selectedRegion.prov_code : ""}
              onChange={handleProvinceChange}
              className="bg-gray-200  p-2 border border-black rounded-[5px]"
              name="stateProvince"
              id="stateProvince"
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.name} value={province.prov_code}>
                  {province.name}
                </option>
              ))}
            </select>
          </AddressSection>

          <AddressSection title={"City"}>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="bg-gray-200  p-2 border border-black rounded-[5px]"
              name="city"
              id="city"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </AddressSection>

          <AddressSection title={"Barangay (Ex: Lower bicutan)"}>
            <input
              type="text"
              value={barangay}
              onChange={handleInputChange(setBarangay)}
              className="bg-gray-200 outline-none p-2 border border-black rounded-[5px]"
              name="barangay"
              id="barangay"
              placeholder="input barangay"
            ></input>
          </AddressSection>

          <AddressSection
            title={"Street Name, Building, House No. (Ex: 14 St. #28)"}
          >
            <input
              value={streetBuildingHouseNum}
              onChange={handleInputChange(setStreetBuildingHouseNum)}
              className="bg-gray-200 outline-none p-2 border border-black rounded-[5px]"
              placeholder="Street Name, Building, House No."
              type="text"
              id="streetBuildingHouseNum"
              name="streetBuildingHouseNum"
            />
          </AddressSection>

          <div className="flex justify-end">
            <button className="hover:opacity-95 uppercase flex items-center border gap-5 px-5 border-black p-2 rounded-[5px] bg-primary text-card">
              Save Address
              <FaCheckCircle size={15} />
            </button>
          </div>
        </form>

        <div className="flex flex-col mt-10 border-t-gray-400 pt-5 border border-r-0 border-l-0 border-b-0 gap-2">
          <h1>Your Address: </h1>
          <div className="flex flex-col gap-5">
            <ul className="flex flex-col gap-3">
              {currentUserAddress.length > 0 ? (
                currentUserAddress.map((add) => (
                  <li
                    key={add._id}
                    className="border flex justify-between border-black p-1 px-2 rounded-[5px]"
                  >
                    {add.fullAddress}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(add)}
                        className="text-green-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteclick(add._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm">(no address yet)</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
