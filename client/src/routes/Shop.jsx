import { useQuery } from "@tanstack/react-query";
import ShopProductCards from "../components/ShopProductCards.jsx";
import ShopSide from "../components/ShopSide.jsx";
import axiosInstance from "../lib/axios.js";


export default function Shop() {


  const {data: products = [], isPending, isError} = useQuery({
    queryKey: ["products"],
    queryFn:  async() => {
      const res = await axiosInstance.get(`/product/get-products`)
      return res.data
    }
  })


  console.log(products)




  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error loading filters</p>;

  return (
    <section className=" font-main p-3  py-[130px]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex w-full mb-5 ">
          <h1 className="text-3xl">PRODUCTS</h1>
        </div>

        <div className="mb-5">
          <p className="text-sm">SHOP{">"}</p>
        </div>

        <div className="flex flex-col gap-10 md:flex-row ">
          {/* SIDEBAR FORM*/}
          <ShopSide/>
          {/* products/cards */}
          <div className="w-full h-full">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 ">
              {/* card */}

              {
                products.length > 0 && products.map((product) => (
                  <ShopProductCards key={product._id} product={product}/>
                ))
              }
            
            
       
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
