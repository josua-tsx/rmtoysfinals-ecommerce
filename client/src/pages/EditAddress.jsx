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
import axiosInstance from "../lib/axios.js";
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

  // console.log(cities)
  // console.log(selectedCity)

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
    <section className="fixed inset-0 z-[60] backdrop-blur-md p-3 font-main overflow-y-auto">
      <div className="min-h-screen flex flex-col justify-center items-center mx-auto pb-10">
        <form
          onSubmit={handleUpdateSubmit}
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
                className="bg-gray-50  text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
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
                className="bg-gray-50  text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
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
                className="bg-gray-50  text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressSection title="City">
                <select
                  value={selectedCity || ""}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-gray-50  text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
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

              <AddressSection title="Barangay">
                <input
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  type="text"
                  className="bg-gray-50  text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors focus:shadow-inner"
                  name="barangay"
                  id="barangay"
                  placeholder="Input barangay"
                  required
                />
              </AddressSection>
            </div>

            <AddressSection title="Street Name, Building, House No.">
              <input
                value={streetBuildingHouseNum}
                onChange={(e) => setStreetBuildingHouseNum(e.target.value)}
                className="bg-gray-50  text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors focus:shadow-inner"
                placeholder="Street Name, Building, House No."
                type="text"
                id="streetBuildingHouseNum"
                name="streetBuildingHouseNum"
                required
              />
            </AddressSection>
          </div>

          <div className="flex pt-4 justify-center">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-[5px] bg-[#22c55e] border border-black py-4  font-black uppercase tracking-widest text-white disabled:opacity-70 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all active:scale-95 group"
            >
              UPDATE ADDRESS
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
