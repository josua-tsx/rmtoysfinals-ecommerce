import { useState, useEffect } from "react";
import { IoFilter } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { SiGooglegemini } from "react-icons/si";
import { IoSparkles } from "react-icons/io5";
import FilterSection from "./FilterSection";
import axiosInstance from "../lib/axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ShopSideSkeleton from "./skeleton/ShopSideSkeleton";
import useDebounce from "../hooks/useDebounce";

export default function ShopSide({
  setSearchTerm,
  setSelectedCategory,
  setSelectedColor,
  setSortBy,
  setSortOrder,
  setAiSearchResults, // New prop for AI search results
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [sortOption, setSortOption] = useState("latest");
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterColor, setFilterColor] = useState([]);
  const [isAiMode, setIsAiMode] = useState(false); // AI search toggle
  const [aiQuery, setAiQuery] = useState(""); // AI search input
  const [localSearchTerm, setLocalSearchTerm] = useState(""); // Local state for immediate input feedback

  // Debounce the search term to avoid excessive filtering updates
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Sync debounced term with parent state
  useEffect(() => {
    if (!isAiMode) {
      setSearchTerm(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, isAiMode, setSearchTerm]);

  const {
    data: categoriesData = [],
    isPending: isCategoryPending,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["categories", "shopSide"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/category/get-categories?limit=1000`,
      );
      return res.data;
    },
  });

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray(categoriesData?.categories)
      ? categoriesData.categories
      : [];

  const {
    data: productColors = [],
    isPending: isColorsPending,
    isError: isColorsError,
  } = useQuery({
    queryKey: ["productColors"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-product-colors`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const handleSearchChange = (event) => {
    if (!isAiMode) {
      setLocalSearchTerm(event.target.value);
    } else {
      setAiQuery(event.target.value);
    }
  };

  // AI Search Mutation
  const { mutate: performAiSearch, isPending: isAiSearching } = useMutation({
    mutationFn: async (query) => {
      const res = await axiosInstance.post("/gemini/search-products", {
        query,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success && data.products.length > 0) {
        setAiSearchResults?.(data.products);
        toast.success(
          `Found ${data.products.length} products matching your query!`,
        );
      } else {
        setAiSearchResults?.([]);
        toast.error("No products found. Try a different search.");
      }
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "AI search failed. Try again.",
      );
    },
  });

  const handleAiSearch = () => {
    if (aiQuery.trim().length < 2) {
      toast.error("Please enter at least 2 characters to search.");
      return;
    }
    performAiSearch(aiQuery.trim());
  };

  const handleToggleAiMode = () => {
    setIsAiMode((prev) => !prev);
    setAiQuery("");
    setLocalSearchTerm("");
    setSearchTerm("");
    setAiSearchResults?.(null); // Clear AI results when toggling
  };

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    setSelectedCategory(filterCategory.join(","));
    setSelectedColor(filterColor.join(","));
    setSortBy("createdAt");
    setSortOrder(sortOption === "latest" ? "desc" : "asc");
    setShowFilter(false);
  };

  const handleResetFilter = () => {
    setSelectedCategory("");
    setFilterCategory([]);
    setFilterColor([]);
    setSelectedColor("");
    setSearchTerm("");
    setLocalSearchTerm(""); // Reset local state
    setSortBy("createdAt");
    setSortOrder("desc");
    setSortOption("latest");
    setIsAiMode(false);
    setAiQuery("");
    setAiSearchResults?.(null);
  };

  if (isColorsPending || isCategoryPending) {
    return <ShopSideSkeleton />;
  }

  if (isColorsError || isCategoryError) {
    return <p>Error loading filters...</p>;
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
        {/* AI Mode Toggle */}
        <button
          type="button"
          onClick={handleToggleAiMode}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black text-xs font-black tracking-wide transition-all ${
            isAiMode
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {isAiMode && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
            </span>
          )}
          <SiGooglegemini size={14} />
          AI Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className="border border-black p-1.5 rounded-[5px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <IoFilter size={20} />
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={isAiMode ? aiQuery : localSearchTerm}
            placeholder={
              isAiMode
                ? "Describe what you need..."
                : "Search for product name..."
            }
            onChange={handleSearchChange}
            maxLength={100}
            onKeyDown={(e) => {
              if (isAiMode && e.key === "Enter") {
                e.preventDefault();
                handleAiSearch();
              }
            }}
            className={`border w-full outline-none rounded-[8px] border-black p-2.5 pr-10 bg-white shadow-sm font-main focus:ring-2 transition-all text-sm ${
              isAiMode
                ? "focus:ring-violet-500/50 focus:border-violet-600"
                : "focus:ring-primary/20"
            }`}
          />
          <IoSearch
            size={20}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              isAiMode ? "text-violet-600" : "text-gray-400"
            }`}
          />
        </div>

        {/* AI Search Button (only shown in AI mode) */}
        {isAiMode && (
          <button
            type="button"
            onClick={handleAiSearch}
            disabled={isAiSearching || aiQuery.trim().length < 2}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-2.5 rounded-[8px] border border-black font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {isAiSearching ? (
              <div className="w-5 h-5 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SiGooglegemini size={20} />
            )}
          </button>
        )}
      </div>

      {/* AI Mode Hint */}
      {isAiMode && (
        <div className="bg-violet-50 border border-violet-100 p-2 rounded-md -mt-2">
          <p className="text-[10px] text-violet-700 font-medium leading-tight flex items-center gap-1">
            <IoSparkles size={12} /> <span className="font-bold">Tip:</span> Try
            &quot;educational toys under ₱500&quot; or &quot;pink dolls for
            beginners&quot;
          </p>
        </div>
      )}
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
                        onChange={(e) => {
                          const value = e.target.value;
                          setFilterCategory((prev) =>
                            prev.includes(value)
                              ? prev.filter((c) => c !== value)
                              : [...prev, value],
                          );
                        }}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilterColor((prev) =>
                          prev.includes(value)
                            ? prev.filter((c) => c !== value)
                            : [...prev, value],
                        );
                      }}
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
