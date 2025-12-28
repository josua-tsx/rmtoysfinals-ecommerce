import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import ShopProductCards from "../components/ShopProductCards.jsx";
import ShopSide from "../components/ShopSide.jsx";
import axiosInstance from "../lib/axios.js";
import { useEffect, useState, useMemo, useCallback } from "react";
import CreditPointsAuto from "../components/CreditPointsAuto.jsx";
import { throttle } from "lodash";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";

export default function Shop() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [aiSearchResults, setAiSearchResults] = useState(null); // AI search results

  // Fetch products using useInfiniteQuery
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["products", selectedCategory, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get(`/product/get-products`, {
        params: {
          page: pageParam,
          limit: 8,
          categoryName: selectedCategory,
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log(data);

  // Flatten pages to products array
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) || [],
    [data]
  );

  // Filter products based on search term OR use AI search results
  const filteredArrayProducts = useMemo(() => {
    // If AI search results are available, use them
    if (aiSearchResults && aiSearchResults.length > 0) {
      return aiSearchResults;
    }

    // Otherwise, use regular text search
    return products.filter(
      (product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productDetails?.some((detail) =>
          detail.value.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (product.discount &&
          product.discount.toString().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm, aiSearchResults]);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Add scroll event listener
  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 200);
    window.addEventListener("scroll", throttledHandleScroll);
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [handleScroll]);

  // Reset scroll position when filters change
  useEffect(() => {
    window.scrollTo(0, 0);
    queryClient.resetQueries({ queryKey: ["products"] });
  }, [selectedCategory, sortBy, sortOrder, queryClient]);

  if (isError)
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Error loading products: {error.message}</p>
        <button
          onClick={() => queryClient.refetchQueries({ queryKey: ["products"] })}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          Retry
        </button>
      </div>
    );

  return (
    <section className="font-main p-3 h-full  bg-yellow py-[130px]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex w-full mb-5">
          <h1 className="text-3xl">Products</h1>
        </div>

        <CreditPointsAuto />

        <div className="mb-5">
          <p className="text-sm">SHOP{">"}</p>
        </div>

        {isLoading ? (
          <div className="w-full flex justify-center items-center  h-[400px] ">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row">
            {/* SIDEBAR FORM*/}
            <ShopSide
              setSearchTerm={setSearchTerm}
              setSelectedCategory={setSelectedCategory}
              setSortBy={setSortBy}
              setSortOrder={setSortOrder}
              setAiSearchResults={setAiSearchResults}
            />

            {/* Products/Cards */}
            <div className="w-full h-full">
              {filteredArrayProducts.length === 0 && !isLoading ? (
                <p className="text-center py-10">
                  No products found matching your criteria.
                </p>
              ) : (
                <>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredArrayProducts.map((product) => (
                      <ShopProductCards key={product._id} product={product} />
                    ))}
                  </div>

                  {isFetchingNextPage && (
                    <div className="flex justify-center py-5">
                      <LoadingSpinner />
                    </div>
                  )}

                  {!hasNextPage && filteredArrayProducts.length > 0 && (
                    <p className="text-center pt-5 text-gray-500">
                      You&apos;ve reached the end of products.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
