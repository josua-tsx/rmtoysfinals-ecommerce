import { useInfiniteQuery } from "@tanstack/react-query";
import ShopProductCards from "../components/ShopProductCards.jsx";
import ShopSide from "../components/ShopSide.jsx";
import axiosInstance from "../lib/axios.js";
import { useEffect, useState } from "react";
import CreditPointsAuto from "../components/CreditPointsAuto.jsx";

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // const [priceRange, setPriceRange] = useState([0, 30000]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");



  // Fetch products using useInfiniteQuery with updated configuration
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    // Querykey is now an object
    queryKey: ["products", selectedCategory, sortBy, sortOrder],

    // Fetcher function
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get(`/product/get-products`, {
        params: {
          page: pageParam,
          limit: 8,
          categoryName: selectedCategory,
          // price: priceRange,
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },

    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  const products = data?.pages.flatMap((page) => page.products) || [];

  // Infinite scroll handler
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  // CONVERT THE PRODUCT TO ARRAY IF IT IS NOT AN ARRAY YET.
  const arrayProducts = Array.isArray(products) ? products : [];

  const filteredArrayProducts = arrayProducts.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productDetails?.some((detail) =>
        detail.value.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (product.discount &&
        product.discount.toString().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading products: {error.message}</p>;

  return (
    <section className="font-main p-3 bg-yellow h-full py-[130px]">
      <div className="max-w-[1280px] h-full md:h-screen bg-yellow mx-auto">
        <div className="flex w-full mb-5">
          <h1 className="text-3xl">Products</h1>
        </div>

        <CreditPointsAuto/>

        <div className="mb-5">
          <p className="text-sm">SHOP{">"}</p>
        </div>

        <div className="flex flex-col bg-yellow gap-4 md:flex-row">
          {/* SIDEBAR FORM*/}
          <ShopSide
            setSearchTerm={setSearchTerm}
            setSelectedCategory={setSelectedCategory}
            // setPriceRange={setPriceRange}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
          />

          {/* Products/Cards */}
          <div className="w-full bg-yellow h-full">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Product Cards */}
              {filteredArrayProducts.length > 0 &&
                filteredArrayProducts.map((product) => (
                  <ShopProductCards key={product._id} product={product} />
                ))}
            </div>

            {/* Loading & Exhaustion Indicators */}
            {isFetchingNextPage && <p>Loading more...</p>}

            {!hasNextPage && (
              <p className="text-center pt-5 text-red-700">
                No more products to load.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
