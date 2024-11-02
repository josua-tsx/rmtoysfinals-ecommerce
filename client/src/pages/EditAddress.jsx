import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import AddressSection from "../hooks/AddressSection";
import {
  regions,
  getProvincesByRegion,
  getCityMunByProvince,
} from "phil-reg-prov-mun-brgy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const EditAddress = ({ address, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [streetBuildingHouseNum, setStreetBuildingHouseNum] = useState("");

  useEffect(() => {
    if (address) {
      setBarangay(address.barangay || "");
      setStreetBuildingHouseNum(address.streetBuildingHouseNum || "");
    }
  }, [address]);

  const { mutate: updateAddressMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/address/edit-address/${address._id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
      onClose();
      setSelectedRegion("");
      setSelectedProvince("");
      setSelectedCity("");
      setBarangay("");
      setStreetBuildingHouseNum("");
      toast.success(`Sucessfully Updated Address`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const handleUpdateSubmit = (e) => {
    e.preventDefault();

    updateAddressMutation({
      region: selectedRegion.name,
      stateProvince: selectedProvince.name,
      city: selectedCity.toLocaleLowerCase(),
      barangay,
      streetBuildingHouseNum,
    });
  };

  const handleRegionChange = (e) => {
    const selectedRegCode = e.target.value;
    const selectedRegionObj = regions.find(
      (region) => region.reg_code === selectedRegCode
    );
    setSelectedRegion(selectedRegionObj || "");
    setProvinces(getProvincesByRegion(selectedRegCode));
    setSelectedProvince("");
    setSelectedCity("");
    setCities([]);
  };

  const handleProvinceChange = (e) => {
    const selectedProvCode = e.target.value;
    const selectedProvinceObj = provinces.find(
      (province) => province.prov_code === selectedProvCode
    );
    setSelectedProvince(selectedProvinceObj || "");
    setCities(getCityMunByProvince(selectedProvCode));
    setSelectedCity("");
  };

  return (
    <section className="fixed inset-0 z-50 backdrop-blur-sm p-3">
      <div className="h-screen flex flex-col justify-center items-center mx-auto">
        <form
          onSubmit={handleUpdateSubmit}
          className="border p-4 max-w-[90%] border-black rounded-[5px] relative flex flex-col gap-2 bg-card"
        >
          <div className="absolute -top-10 bg-primary border border-black left-0 rounded-[5px] text-card px-5 py-1">
            <h1>EDITING</h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute border border-black text-card bg-primary rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>

          <AddressSection title="Country">
            <select
              className="bg-gray-200 p-2 border border-black rounded-[5px] w-full"
              name="country"
              id="country"
              defaultValue="Philippines"
            >
              <option value="Philippines">Philippines</option>
            </select>
          </AddressSection>

          <AddressSection title="Region">
            <select
              value={selectedRegion?.reg_code || ""}
              onChange={handleRegionChange}
              className="bg-gray-200 p-2 border border-black rounded-[5px] w-full"
              name="region"
              id="region"
              required
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.reg_code} value={region.reg_code}>
                  {region.name}
                </option>
              ))}
            </select>
          </AddressSection>

          <AddressSection title="State / Province">
            <select
              value={selectedProvince?.prov_code || ""}
              onChange={handleProvinceChange}
              className="bg-gray-200 p-2 border border-black rounded-[5px] w-full"
              name="stateProvince"
              id="stateProvince"
              required
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.prov_code} value={province.prov_code}>
                  {province.name}
                </option>
              ))}
            </select>
          </AddressSection>

          <AddressSection title="City">
            <select
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-gray-200 p-2 border border-black rounded-[5px] w-full"
              name="city"
              id="city"
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.mun_code} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </AddressSection>

          <AddressSection title="Barangay (Ex: Lower bicutan)">
            <input
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              type="text"
              className="bg-gray-200 p-2 border border-black rounded-[5px] w-full"
              name="barangay"
              id="barangay"
              placeholder="Input barangay"
              required
            />
          </AddressSection>

          <AddressSection title="Street Name, Building, House No. (Ex: 14 St. #28)">
            <input
              value={streetBuildingHouseNum}
              onChange={(e) => setStreetBuildingHouseNum(e.target.value)}
              className="bg-gray-200 p-2 border border-black rounded-[5px] w-full"
              placeholder="Street Name, Building, House No."
              type="text"
              id="streetBuildingHouseNum"
              name="streetBuildingHouseNum"
              required
            />
          </AddressSection>

          <div className="flex pt-4 justify-center">
            <button
              type="submit"
              className="hover:opacity-95 uppercase flex items-center border gap-5 px-5 border-black p-2 rounded-[5px] bg-primary text-card"
            >
              Update Address
              <FaCheckCircle size={15} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditAddress;
