import { useState } from "react";
import { IoFilter } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import FilterSection from "./FilterSection";
import axiosInstance from "../lib/axios";
import { useQuery } from "@tanstack/react-query";

export default function ShopSide() {
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["filters"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/filter/get-filters`);
      return res.data;
    },
  });

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


  

  if (isLoading  || isCategoryPending) {
    return <p>loading...</p>
  }

  if (isError || isCategoryError) {
    return <p>loading...</p>
  }

  const handlePriceChange = (event) => {
    const value = event.target.value;
    setPriceRange([0, value]);
  };

  return (
    <form className=" flex w-[90%] mx-auto md:w-[320px] justify-center px-5 gap-5 flex-col relative overflow-x-hidden md:justify-start p-3 border-black border rounded-[5px] bg-card">
      <div className="flex justify-between pb-5 ">
        <h1 className="text-xl">FILTER</h1>
        <button type="button" onClick={() => setShowFilter((prev) => !prev)}>
          <IoFilter size={20} />
        </button>
      </div>

      <div className="flex items-center relative  gap-2">
        <input
          type="text"
          className="border w-full outline-none rounded-[2.5px] border-black p-1"
        />
        <IoSearch size={25} className="absolute right-2" />
      </div>

      <div
        className={`${
          showFilter ? "flex" : "hidden"
        } md:flex flex-col h-full gap-7`}
      >
        {/* sort */}
        <FilterSection title={"sort"}>
          <div className="flex gap-3">
            <input type="radio" name="sort" id="latest" />
            <label htmlFor="latest">LATEST</label>
          </div>
          <div className="flex gap-3">
            <input type="radio" name="sort" id="oldest" />
            <label htmlFor="oldest">OLDEST</label>
          </div>
        </FilterSection>

        {/* price range */}

        <FilterSection title={"price range"}>
          <div className={`flex flex-col`}>
            <span className="text-gray-700">PHP {priceRange[1]}</span>
            <input
              min={0}
              max={1000}
              type="range"
              name="priceRange"
              id="priceRange"
              value={priceRange[1]}
              onChange={handlePriceChange}
              className="w-full"
            />
          </div>
        </FilterSection>

        {/* CATEGORIES */}


        <div  className={` flex-col gap-2  pb-5`}>
        <div className="flex items-start justify-between">
          <h1 className="text-xl mb-2 uppercase">Categories</h1>
        </div>

        <div className="flex flex-col gap-2">
          <div className={`flex flex-col gap-2`}>

          
          {
            categories.length > 0 && categories.map((category) => (
              <div key={category.categoryName} className={`flex items-center gap-3`}>
              <input
                type="checkbox"
                className="w-4 h-4  text-blue-600 bg-gray-100 border-gray-300 rounded  dark:bg-gray-700 dark:border-gray-600"
                id={category.categoryName}
                value={category.categoryName}
              />
              <label htmlFor={category.categoryName} className="uppercase" >{category.categoryName}</label>
            </div>
            ))
          }
      
          
          </div>
        </div>
      </div>
            
       
  

        {
          data.map((filter) => (
            
        <div key={filter._id} className={` flex-col gap-2  pb-5`}>
        <div className="flex items-start justify-between">
          <h1 className="text-xl mb-2 uppercase">{filter.filterName}</h1>
        </div>

        <div className="flex flex-col gap-2">
          <div className={`flex flex-col gap-2`}>

           {
            filter.filterValue.map((value) => (
              <div key={value} className={`flex items-center gap-3`}>
              <input
                type="checkbox"
                className="w-4 h-4  text-blue-600 bg-gray-100 border-gray-300 rounded  dark:bg-gray-700 dark:border-gray-600"
                id={value}
                name={value}
              />
              <label htmlFor={value} className="uppercase" >{value}</label>
            </div>
            ))
           }
          
          </div>
        </div>
      </div>
          ))
        }

        {/* COLORS */}

        <FilterSection title={"colors"}>
          <div className={`flex flex-wrap gap-2`}>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="hidden" />
              <span className="size-[35px] rounded-[2.5px] bg-red-500 cursor-pointer"></span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="hidden" />
              <span className="size-[35px] rounded-[2.5px] bg-blue-500 cursor-pointer"></span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="hidden" />
              <span className="size-[35px] rounded-[2.5px] bg-green-500 cursor-pointer"></span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="hidden" />
              <span className="size-[35px] rounded-[2.5px] bg-black cursor-pointer"></span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="hidden" />
              <span className="size-[35px] rounded-[2.5px] bg-white cursor-pointer"></span>
            </label>
          </div>
        </FilterSection>

        <div>
          <button className="border hover:opacity-95 uppercase justify-center items-center w-full border-black p-2 rounded-[5px] bg-primary text-card">
            APPLY FILTERS
          </button>
        </div>
      </div>
    </form>
  );
}
