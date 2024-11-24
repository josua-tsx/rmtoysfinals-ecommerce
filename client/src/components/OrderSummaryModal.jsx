import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../stores/useOrderStore";

export default function OrderSummaryModal({ onClose }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const { setCurrentOrder } = useOrderStore();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [taxes, setTaxes] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(35);
  const [cartItems, setCartItems] = useState({});

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

  useEffect(() => {
    if (cart) {
      setCartItems(cart.items);
    }
  }, [cart]);

  // Calculate subtotal if cart is not empty
  const subtotal = cart?.items?.reduce((total, item) => {
    return total + item.productId.price * item.quantity;
  }, 0);

  const totalPrice = subtotal + shippingFee + taxes;

  const { mutate: placeOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/order/place-order`, data);

      return res.data;
    },
    onSuccess: () => {
      setNotes("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`order placed`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleOrderFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { fullName, phoneNumber, paymentMethod, notes, currentAddress } =
      inputs;

    if (!fullName || !phoneNumber || !currentAddress)
      return toast.error("Please update required fields first");

    if (paymentMethod === "Gcash") {
      if (cartItems.length > 0) {
        const orderData = {
          orderItems: cartItems,
          shippingAddress: currentAddress,
          paymentMethod,
          taxPrice: taxes,
          shippingPrice: shippingFee,
          discount,
          subtotal,
          totalPrice,
          notes,
          quantity: cartItems.quantity,
        };
        setCurrentOrder(orderData);
        navigate("/gcashPage");
      } else {
        return toast.error("You can not placed an order without products!");
      }

      return;
    }

    if (paymentMethod === "Cod") {
      placeOrder({
        orderItems: cartItems,
        shippingAddress: currentAddress,
        paymentMethod,
        taxPrice: taxes,
        shippingPrice: shippingFee,
        discount,
        subtotal,
        totalPrice,
        notes,
        quantity: cartItems.quantity,
      });
    }
  };

  if (isActivePending || isCartPending) return <p>loading...</p>;
  if (isActiveError || isCartError) return <p>error...</p>;

  return (
    <section className="fixed inset-0 h-screen  overflow-y-auto flex flex-col justify-center z-50 backdrop-blur-sm">
      <div className="flex relative flex-col-reverse py-10 overflow-y-auto md:flex-row w-[90%] mx-auto gap-5 justify-center items-start">
        <form
          onSubmit={handleOrderFormSubmit}
          className="bg-card p-2  flex flex-col justify-between relative rounded-[5px] border h-[500px] w-[90%] md:w-[60%]  lg:w-[50%] border-black"
        >
          <div className="hidden md:flex absolute -top-9 bg-primary border border-black left-0 rounded-[5px] text-card px-3 text-sm py-1">
            <h1>ORDER SUMMARY</h1>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="fullName">Full name: </label>
              <input
                className="border outline-none border-black rounded-[5px] p-1"
                type="text"
                id="fullName"
                name="fullName"
                value={currentUser?.fullName && currentUser?.fullName}
                disabled={!activeAddress?.fullAddress ? true : false}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="fullName">Phone Number: </label>
              <input
                className="border outline-none border-black rounded-[5px] p-1"
                type="number"
                id="phoneNumber"
                name="phoneNumber"
                value={currentUser?.phoneNumber && currentUser?.phoneNumber}
                disabled={!activeAddress?.fullAddress ? true : false}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="currentAddress">Current Shipping Address: </label>
              <input
                className="border  outline-none border-black rounded-[5px] p-1"
                type="text"
                id="currentAddress"
                name="currentAddress"
                value={activeAddress?.fullAddress && activeAddress?.fullAddress}
                disabled={!activeAddress?.fullAddress ? true : false}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="paymentMethod">Payment Method: </label>
              <select
                name="paymentMethod"
                id="paymentMethod"
                className="border outline-none border-black rounded-[5px] p-1"
              >
                <option value="Gcash">Gcash</option>
                <option value="Cod">Cash on delivery</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <label htmlFor="notes">Add additional note (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                name="notes"
                id="notes"
                className="border p-2 outline-none resize-none  md:h-[130px] border-black rounded-[5px]"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-row-reverse gap-2">
            <button
              onClick={onClose}
              type="button"
              className="border w-[90px] md:w-[150px] border-black bg-red-700 text-card p-1 rounded-[5px]"
            >
              Cancel
            </button>
            <button className="border flex-1 border-black bg-primary text-card p-1 rounded-[5px]">
              Place Order
            </button>
          </div>
        </form>

        <div className="flex text-sm h-full flex-col gap-2 w-[90%] md:w-[25%]  ">
          <div className="flex flex-col gap-2 bg-card rounded-[5px] p-2 border-black border">
            <div className="flex justify-between">
              <p>TOTAL ITEMS: </p>
              <p>{cart?.items?.length}</p>
            </div>
            <div className="flex justify-between">
              <p>SHIPPING FEE</p>
              <p>{shippingFee} PHP</p>
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
              <p>SUBTOTAL: </p>
              <p>{subtotal} PHP</p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg">TOTAL PRICE: </p>
              <p className="text-lg">{totalPrice} PHP</p>
            </div>
          </div>
          <div className=" border flex flex-col max-h-[334px] h-[334px] gap-2  overflow-y-auto bg-card rounded-[5px] p-2 border-black">
            {/* PRODUCT ORDER SUMMARY CARD */}
            {cart?.items?.length > 0 ? (
              cart?.items.map((item) => (
                <div
                  key={item?._id}
                  className="flex gap-2 justify-between border border-black rounded-[5px] p-1 items-center"
                >
                  <img
                    src={item.productId.productImages[0]}
                    alt="productImage"
                    className="size-[50px] border-none rounded-[5px]"
                  />
                  <div className="flex gap-10">
                    <p>{item.productId.productName}</p>
                    <div>
                      <p className="flex gap-2">
                        Quantity: <span>{item.quantity}</span>
                      </p>
                      <p className="flex gap-2">
                        Price:{" "}
                        <span>{item.productId.price * item.quantity} PHP</span>
                      </p>
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
