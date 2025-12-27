import { useState } from "react";
import { IoFilter } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import FilterSection from "./FilterSection";
import axiosInstance from "../lib/axios";
import { useQuery } from "@tanstack/react-query";

export default function ShopSide({
  setSearchTerm,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
}) {
  const [showFilter, setShowFilter] = useState(false);
  // const [priceRangeState, setPriceRangeState] = useState([0, 30000]);
  const [sortOption, setSortOption] = useState("latest");
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterColor, setFilterColor] = useState("");

  const {
    data: categories = [],
    isPending: isCategoryPending,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/category/get-categories`);
      return res.data;
    },
  });

  const {
    data: products = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-products`);
      return res.data.products;
    },
  });

  // Now we can map through the products and extract the color from productDetails
  const productColors = [
    ...new Set(
      products
        .flatMap((product) => {
          // Find the color detail from productDetails
          const colorDetail = product.productDetails?.find(
            (detail) => detail.label === "color"
          );
          return colorDetail ? colorDetail.value : null; // Return color value if found, otherwise null
        })
        .filter((color) => color !== null) // Remove null values if no color found
    ),
  ];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    setSelectedCategory(filterCategory);
    setSearchTerm(filterColor);
    setSortBy(sortOption === "latest" ? "createdAt" : "oldest");
    setSortOrder(sortOption === "latest" ? "desc" : "asc");
    setShowFilter(false);
  };

  const handleResetFilter = () => {
    setSelectedCategory("");
    setFilterCategory("");
    setFilterColor("");
    setSearchTerm("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setSortOption("latest");
  };

  if (isPending || isCategoryPending) {
    return <p>loading...</p>;
  }

  if (isError || isCategoryError) {
    return <p>loading...</p>;
  }

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <div className="flex w-[90%] text-sm md:text-normal mx-auto md:w-[320px] justify-center px-5 gap-5 flex-col relative overflow-visible md:justify-start p-3 border-black border rounded-[5px] bg-card mt-4">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-white border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Filter
        </h1>
      </div>

      <div className="flex justify-between pb-2 pt-6">
        <div className="w-1"></div> {/* Spacer for header */}
        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className="border border-black p-1 rounded-[5px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <IoFilter size={20} />
        </button>
      </div>

      <div className="flex items-center relative gap-2">
        <input
          type="text"
          placeholder="search for products name"
          onChange={handleSearchChange}
          className="border w-full outline-none rounded-[5px] border-black p-2 bg-white shadow-inner font-main focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <IoSearch size={22} className="absolute right-3" />
      </div>
      <form onSubmit={handleSubmitFilter} className="flex flex-col gap-5">
        <div
          className={`${
            showFilter ? "flex" : "hidden"
          } md:flex flex-col h-full gap-7`}
        >
          {/* sort */}
          <FilterSection title={"Sort"}>
            <div className="flex gap-3">
              <input
                type="radio"
                name="sort"
                value="latest"
                checked={sortOption === "latest"}
                onChange={handleSortChange}
              />
              <label htmlFor="latest">Latest</label>
            </div>
            <div className="flex gap-3">
              <input
                type="radio"
                name="sort"
                value="oldest"
                checked={sortOption === "oldest"}
                onChange={handleSortChange}
              />
              <label htmlFor="oldest">Oldest</label>
            </div>
          </FilterSection>

          {/* price range */}

          {/* CATEGORIES */}
          <div className="flex flex-col gap-2 pb-5 border-t border-black pt-5">
            <div className="flex items-start justify-between">
              <h1 className="font-black uppercase tracking-widest text-sm  mb-2 bg-primary text-white px-2 py-1 rounded-[5px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Categories
              </h1>
            </div>

            <div className="flex flex-col gap-2">
              <div className={`flex flex-col gap-2`}>
                {categories.length > 0 &&
                  categories.map((category) => (
                    <div
                      key={category.categoryName}
                      className={`flex items-center gap-3`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4  text-blue-600 bg-gray-100 border-gray-300 rounded  dark:bg-gray-700 dark:border-gray-600"
                        id={category.categoryName}
                        value={category.categoryName}
                        checked={filterCategory.includes(category.categoryName)}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      />
                      <label htmlFor={category.categoryName} className="">
                        {category.categoryName}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <FilterSection title={"Colors"}>
            <div className={` flex flex-col gap-2`}>
              {productColors &&
                productColors.map((color) => (
                  <label key={color} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className=""
                      value={color}
                      checked={filterColor.includes(color)}
                      onChange={(e) => setFilterColor(e.target.value)}
                    />
                    <span className="">{color}</span>
                  </label>
                ))}
            </div>
          </FilterSection>

          <div className="flex gap-2">
            <button className="border flex-1 justify-center items-center w-full border-black p-2 rounded-[5px] bg-primary text-card font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
              Apply Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="border border-black bg-red-700 text-card px-3 rounded-[5px] font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
