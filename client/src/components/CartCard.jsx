
import { MdDelete } from 'react-icons/md'

export default function CartCard({productCart}) {


  if (!productCart || Object.keys(productCart).length === 0) {
    return <p>No product found.</p>;
}

  return (
    <div className="flex items-center gap-5 relative bg-card border-black border p-3 rounded-[5px]">
    <img
      src={productCart.productId.productImages[0]}
      alt="product images"
      className="size-[60px] border-none rounded-[5px]"
    />
    <div className="flex-col lg:flex-row justify-between  lg:items-center flex lg:gap-5 w-full ">
      <h1>{productCart.productId.productName}</h1>
      <div className="my-1 flex flex-col md:flex-row md:gap-5">
        <p className="text-sm">
          SIZE: <span className="text-indigo-500"></span>
        </p>
        {/* <p className="text-sm">
          COLOR:<span className="text-indigo-500">{color}</span>
        </p> */}
      </div>
      <div className="flex gap-10 justify-between items-center">
        <p>
         <span className="text-indigo-500 text-xl">{productCart.productId.price}PHP</span>
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className="text-3xl">
            -
          </button>
          <p className="">3</p>
          <button type="button" className="text-3xl">
            +
          </button>
        </div>
      </div>
      <button type="button" className="absolute right-2  lg:relative text-red-600 ">
        <MdDelete size={25} />
    </button>
    </div>
</div>
  )
}
