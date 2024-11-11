import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

export default function OrderSummaryModal() {
  const {
    data: activeAddress,
    isPending: isActivePending,
    isError: isActiveError,
  } = useQuery({
    queryKey: ["address"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/address/get-activeAddress`);
      return res.data;
    },
  });

  const {
    data: cart = [],
    isPending: isCartPending,
    isError: isCartError,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/cart/get`);
      return res.data;
    },
  });

  console.log(activeAddress);

  console.log(cart);

  if (isActivePending || isCartPending) return <p>loading...</p>;
  if (isActiveError || isCartError) return <p>error...</p>;

  return (
    <section className="fixed inset-0 h-screen flex flex-col justify-center z-50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row w-[90%] mx-auto gap-5 justify-center items-start">
        <form className="bg-card p-2 flex flex-col relative rounded-[5px] border h-[500px] w-[90%] md:w-[60%]  lg:w-[50%] border-black">
          <div className="absolute -top-9 bg-primary border border-black left-0 rounded-[5px] text-card px-3 text-sm py-1">
            <h1>ORDER SUMMARY</h1>
          </div>

          <div className="flex flex-col">
            <label htmlFor="currentAddress">Current Address: </label>
            <input
              className="border border-black rounded-[5px] p-1"
              type="text"
              id="currentAddress"
              name="currentAddress"
              disabled
              value={activeAddress.fullAddress}
            />
          </div>
        </form>

        <div className="flex text-sm h-full flex-col gap-2 w-[90%] md:w-[25%]  ">
          <div className="flex flex-col gap-2 bg-card rounded-[5px] p-2 border-black border">
            <div className="flex justify-between">
              <p>SHIPPING FEE</p>
              <p>35 PHP</p>
            </div>
            {/* <div className="flex justify-between">
            <p>TAX: </p>
            <p>35 PHP</p>
           </div> */}
            <div className="flex justify-between">
              <p>DISCOUNT</p>
              <p>0 PHP</p>
            </div>
            <div className="flex justify-between">
              <p>SHIPPING FEE</p>
              <p>35 PHP</p>
            </div>
            <div className="flex justify-between">
              <p>TOTAL ITEMS: </p>
              <p>5</p>
            </div>
            <div className="flex justify-between">
              <p>SUBTOTAL: </p>
              <p>5000 PHP</p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg">TOTAL PRICE: </p>
              <p className="text-lg">5900 PHP</p>
            </div>
          </div>
          <div className=" border flex flex-col max-h-[307px] h-[307px] gap-2  overflow-y-auto bg-card rounded-[5px] p-2 border-black">
            {/* PRODUCT ORDER SUMMARY CARD */}
            {cart?.items?.length > 0 ? (
              cart?.items.map((item) => (
                <div key={item?._id} className="flex gap-2 justify-between border border-black rounded-[5px] p-1 items-center">
                  <img
                    src={item.productId.productImages[0]}
                    alt="productImage"
                    className="size-[50px] border-none rounded-[5px]"
                  />
                  <div className="flex gap-10">
                    <p>{item.productId.productName}</p>
                    <div>
                      <p className="flex gap-2">Quantity: <span>{item.quantity}</span></p>
                      <p className="flex gap-2">Price: <span>{(item.productId.price * item.quantity)} PHP</span></p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
