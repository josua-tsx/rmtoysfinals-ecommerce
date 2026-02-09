const {
  listRegions,
  listProvinces,
  listMuncities,
  listBarangays,
} = require("./node_modules/@jobuntux/psgc/dist/index.js");

// 1. Find Region (CAR)
const regions = listRegions();
const region = regions.find((r) => r.regionName.includes("Cordillera"));
console.log("Region found:", region ? region.regionName : "Not found");

if (region) {
  // 2. Find Province (Apayao)
  const provinces = listProvinces(region.regCode);
  const province = provinces.find((p) => p.provName === "Apayao");
  console.log("Province found:", province ? province.provName : "Not found");

  if (province) {
    // 3. Find City/Municipality (Conner)
    const cities = listMuncities(province.provCode);
    const city = cities.find((c) => c.munCityName === "Conner");
    console.log("City found:", city ? city.munCityName : "Not found", city);

    if (city) {
      // 4. List Barangays
      const barangays = listBarangays(city.psgcCode);
      console.log("Barangays count:", barangays.length);
      console.log("Barangays:", barangays);
    } else {
        console.log("Available cities:", cities.map(c => c.munCityName));
    }
  }
}
