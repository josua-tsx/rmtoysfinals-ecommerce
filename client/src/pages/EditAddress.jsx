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

const EditAddress = ({ address, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [streetBuildingHouseNum, setStreetBuildingHouseNum] = useState("");

  // console.log(cities)
  // console.log(selectedCity)

  useEffect(() => {
    if (address) {
      // Find region
      const region = listRegions().find((r) => r.regionName === address.region);
      if (region) {
        setSelectedRegion(region);
        const provs = listProvinces(region.regCode);
        setProvinces(provs);

        // Find province
        const province = provs.find(
          (p) => p.provName === address.stateProvince,
        );
        if (province) {
          setSelectedProvince(province);
          const muns = listMuncities(province.provCode);
          setCities(muns);

          // Find city
          const city = muns.find(
            (c) => c.munCityName.toLowerCase() === address.city.toLowerCase(),
          );
          if (city) {
            setSelectedCity(city.munCityName);
            setBarangays(listBarangays(city.psgcCode));
          }
        }
      }
      setBarangay(address.barangay || "");
      setStreetBuildingHouseNum(address.streetBuildingHouseNum || "");
    }
  }, [address]);

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
      region: selectedRegion.regionName,
      stateProvince: selectedProvince?.provName || "",
      city: selectedCity.toLocaleLowerCase(),
      barangay,
      streetBuildingHouseNum,
    });
  };

  const handleRegionChange = (e) => {
    const selectedRegCode = e.target.value;
    const selectedRegionObj = listRegions().find(
      (region) => region.regCode === selectedRegCode,
    );
    setSelectedRegion(selectedRegionObj || "");
    setProvinces(listProvinces(selectedRegCode));
    setSelectedProvince("");
    setSelectedCity("");
    setCities([]);
    setBarangays([]);
  };

  const handleProvinceChange = (e) => {
    const selectedProvCode = e.target.value;
    const selectedProvinceObj = provinces.find(
      (province) => province.provCode === selectedProvCode,
    );
    setSelectedProvince(selectedProvinceObj || "");
    const cityList = listMuncities(selectedProvCode);
    setCities(cityList);
    if (cityList.length === 1) {
      setSelectedCity(cityList[0].munCityName);
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
                value={selectedRegion?.regCode || ""}
                onChange={handleRegionChange}
                className="bg-gray-50  text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
                name="region"
                id="region"
                required
              >
                <option value="">Select Region</option>
                {listRegions().map((region) => (
                  <option key={region.regCode} value={region.regCode}>
                    {region.regionName}
                  </option>
                ))}
              </select>
            </AddressSection>

            <AddressSection title="State / Province">
              <select
                value={selectedProvince?.provCode || ""}
                onChange={handleProvinceChange}
                className="bg-gray-50  text-sm p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
                name="stateProvince"
                id="stateProvince"
                required
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.provCode} value={province.provCode}>
                    {province.provName}
                  </option>
                ))}
              </select>
            </AddressSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressSection title="City">
                <select
                  value={selectedCity || ""}
                  onChange={handleCityChange}
                  className="bg-gray-50  text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors cursor-pointer"
                  name="city"
                  id="city"
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.psgcCode} value={city.munCityName}>
                      {city.munCityName}
                    </option>
                  ))}
                </select>
              </AddressSection>

              <AddressSection title="Barangay">
                <select
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="bg-gray-50  text-xs p-3 border border-black rounded-[5px] w-full outline-none focus:bg-white transition-colors focus:shadow-inner cursor-pointer"
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
