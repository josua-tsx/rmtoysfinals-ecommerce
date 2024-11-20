import { IoIosClose } from "react-icons/io";
import CarImage from "../assets/car.png";

export default function SingleOrderList({ order, onClose }) {
  console.log(order);

  return (
    <section className="inset-0 z-50 fixed backdrop-blur-sm p-3">
      <div className="h-screen relative flex flex-col justify-center items-center ">
        <div className="border relative p-2 flex flex-col gap-2 border-black w-full md:w-[500px] bg-card max-h-[600px] h-[600px]  rounded-[5px]">
          <button
            onClick={onClose}
            type="button"
            className="absolute border border-black text-card bg-primary rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>

          {/* CARD GOES HERE */}

          <div className="flex justify-between">
            <div className="flex flex-col text-sm">
              <div className="flex gap-2">
                <p>Total Items: </p>
                <span>{order?.orderItems?.length}</span>
              </div>
              <div className="flex gap-2">
                <p>Taxes: </p>
                <span>{order.taxPrice}</span>
              </div>
              <div className="flex gap-2">
                <p>Shipping Price: </p>
                <span>{order.shippingPrice} PHP</span>
              </div>
              <div className="flex gap-2">
                <p>Discount: </p>
                <span>{order.discount} PHP</span>
              </div>
              <div className="flex gap-2">
                <p>To Ship: </p>
                <span>{order.shippingAddress}</span>
              </div>
              <div className="flex gap-2">
                <p>Payment Method: </p>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex gap-2">
                <p>Notes: </p>
                <span>{!order.notes ? "No notes provided" : order.notes}</span>
              </div>
            </div>
            <div className="flex flex-col text-sm">
              <div className="flex gap-2">
                <p>Subtotal: </p>
                <span>{order.subtotal} PHP</span>
              </div>
              <div className="flex gap-2">
                <p>Total Price: </p>
                <span>{order.totalPrice} PHP</span>
              </div>
              <div className="flex gap-2">
                <p>Status: </p>
                <span>{order.status}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
            {order?.orderItems?.length > 0 &&
              order?.orderItems.map((item) => (
                <div key={item._id} className="border border-black bg-card rounded-[5px] p-2 flex gap-4 items-center">
                  <img src={item?.productId?.productImages[0]} alt="product image" className="w-12" />
                  <div className="text-sm flex justify-between w-full">
                    <div>
                      <div className="text-sm flex  gap-2">
                        <p>Name: </p>
                        <span>{item?.productId?.productName}</span>
                      </div>
                      <div className="text-sm flex  gap-2">
                        <p>Price: </p>
                        <span>{item?.productId?.price}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <p>Category: </p>
                        <span>{item?.productId?.category?.categoryName}</span>
                      </div>
                      <div className="flex gap-2">
                        <p>Quantity: </p>
                        <span>{item?.quantity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
