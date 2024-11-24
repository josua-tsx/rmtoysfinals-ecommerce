import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import QrCode from "../assets/QRCODE.jpg";
import { useRef, useState } from "react";
import app from "../firebase/firebase";
import toast from "react-hot-toast";
import { BiSolidImageAdd } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import useOrderStore from "../stores/useOrderStore";
import { useNavigate } from "react-router-dom";

export default function GcashCheckOut() {
  const queryClient = useQueryClient();

  const navigate = useNavigate()

  const currentOrder = useOrderStore((state) => state.currentOrder);
  const clearOrder = useOrderStore((state) => state.clearOrder);
 

  const [receipt, setReceipt] = useState(null); // Store the uploaded image URL
  const [file, setFile] = useState(null); // Store the actual file to be uploaded



  const [selectedGcash, setSelectedGcash] = useState(null);

  const [gcashName, setGcashName] = useState("");
  const [gcashNo, setGcashNo] = useState("");
  const [gcashRefNo, setGcashRefNo] = useState("");

  // const [isReceiptUploaded, setIsReceiptUploaded] = useState(false);

  const fileInputRef = useRef(); // Reference to the file input element

  const {
    data: gcashActive = [],
    isPending: isGcashPending,
    isError: isGcashError,
  } = useQuery({
    queryKey: ["gcash"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/gcash/gcash-active`);
      return res.data;
    },
  });

  const { mutate: placeOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/order/place-order`, data);
      return res.data;
    },
    onSuccess: () => {
      clearOrder()
      navigate("/shop")
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

    if (!gcashName || !gcashRefNo || !gcashNo || !receipt) {
      return toast.error("Please input required fields!")
    }

    try {
      const orderData = {
        orderItems: currentOrder.orderItems,
        shippingAddress: currentOrder.shippingAddress,
        paymentMethod: currentOrder.paymentMethod,
        taxPrice: currentOrder.taxPrice,
        shippingPrice: currentOrder.shippingPrice,
        discount: currentOrder.discount,
        subtotal: currentOrder.subtotal,
        totalPrice: currentOrder.totalPrice,
        notes: currentOrder.notes,
        quantity: currentOrder.orderItems.quantity,
      };

      // Add GCash details if payment method is GCash
      if (currentOrder.paymentMethod === "Gcash") {
        orderData.gcashAdditionalDetails = {
          gcashName,
          gcashNo,
          gcashRefNo,
          gcashReceiptImage: receipt,
        };
      }
      // Place the order
      placeOrder(orderData);

    } catch (error) {
      toast.error(error.message || "Failed to place order");
    }
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0]; // Get the first selected file
    if (selectedFile) {
      setFile(selectedFile); // Set the file state
      const imagePreview = URL.createObjectURL(selectedFile); // Create preview URL for the selected image
      setReceipt(imagePreview); // Set the preview image
    }
  };

  const handleImageSubmit = () => {
    if (!file) {
      toast.error("No image selected!");
      return;
    }

    storeImage(file)
      .then((url) => {
        toast.success("Image uploaded successfully!");
        setReceipt(url);
        setFile(null); // Reset file state
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleRemoveImage = () => {
    setReceipt(null); // Clear the preview image
    setFile(null); // Clear the file state
    fileInputRef.current.value = ""; // Clear the file input value
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`); // For debugging purposes
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch(reject); // Ensure error handling on URL fetch
        }
      );
    });
  };

  const handleSelectChange = (e) => {
    const selectedGcashName = e.target.value;

    const selectedItem = gcashActive.find(
      (item) => item.gcashName === selectedGcashName
    );

    // setSelectedGcash(selectedItem ? selectedItem.gcashImage : "")
    console.log(selectedItem);
    setSelectedGcash(selectedItem ? selectedItem.gcashUrl : "");
  };

  console.log(selectedGcash);

  if (isGcashPending) return <p>loading..</p>;
  if (isGcashError) return <p>Error</p>;

  return (
    <section className="font-main px-5 py-10">
      <div className="p-2 flex flex-col md:flex-row max-w-[1280px] mx-auto gap-5">
        {/* COLUMNS */}
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <select
              onChange={handleSelectChange}
              className="w-full border bg-card border-black rounded-[5px] p-1 outline-none"
            >
              {gcashActive?.length > 0 &&
                gcashActive.map((item) => (
                  <option key={item._id} value={item.gcashName}>
                    {item.gcashName}
                  </option>
                ))}
            </select>
          </div>

          <div className="w-full flex items-center flex-col">
            {/* RENDER THE IMAGE HERE */}
            {selectedGcash ? (
              <img
                src={selectedGcash}
                alt="gcash qr code"
                className="rounded-[5px] w-[400px] md:w-[430px] h-auto"
              />
            ) : (
              <img
                src={QrCode}
                alt=""
                className="rounded-[5px] w-[400px] md:w-[430px] h-auto"
              />
            )}
          </div>
        </div>

        <form
          onSubmit={handleOrderFormSubmit}
          className="p-2 flex-1 flex flex-col gap-5 justify-between rounded-[5px] border border-black bg-card"
        >
          <div className="flex flex-col gap-5">
            <div className=" rounded-[5px] flex flex-col gap-2">
              <p className="text-xl md:text-3xl">
                Total Price: {currentOrder?.totalPrice} PHP
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xl">
                  Gcash Name.
                </label>
                <input
                  type="text"
                  value={gcashName}
                  onChange={(e) => setGcashName(e.target.value)}
                  className="border px-2 border-black outline-none rounded-[5px]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xl">
                  Gcash No.
                </label>
                <input
                  type="number"
                  value={gcashNo}
                  onChange={(e) => setGcashNo(e.target.value)}
                  min={0}
                  className="border px-2 border-black outline-none rounded-[5px]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xl">
                  Reference No.
                </label>
                <input
                  type="number"
                  value={gcashRefNo}
                  onChange={(e) => setGcashRefNo(e.target.value)}
                  className="border px-2 border-black outline-none rounded-[5px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="" className="text-xl">
                  Receipt Image:
                </label>

                <div className="flex justify-center">
                  <input
                    ref={fileInputRef} // Attach reference to the input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="border opacity-0 cursor-pointer bg-black absolute"
                  />
                  <div className="flex gap-2 border border-black p-1 rounded-[5px] w-full justify-center">
                    <p>ADD RECEIPT IMAGE</p>
                    <BiSolidImageAdd size={25} />
                  </div>
                </div>
              </div>

              {/* Display the uploaded image */}
              {receipt && (
                <div className="p-2 rounded-[5px] flex flex-col gap-2">
                  <div className="bg-card relative flex-1 min-h-[80px] border-black border px-5 p-3 rounded-[5px]">
                    <img
                      src={receipt}
                      alt="Receipt Preview"
                      className="w-[85px] mx-auto h-auto"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage()}
                      className="text-red-600 absolute right-0 top-0 hover:text-red-300"
                    >
                      <MdDelete size={25} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImageSubmit()}
                    className="border border-black bg-primary text-card p-1 rounded-[5[x]]"
                  >
                    Upload Receipt
                  </button>
                </div>
              )}
            </div>
          </div>

         <div className="flex gap-2">
         <button
            // disabled={isReceiptUploaded}
            className="border flex-1   border-black rounded-[5px] bg-primary text-card py-1"
          >
            SUBMIT
          </button>
          <button
          onClick={() => navigate("/shop")}
          type="button"
            // disabled={isReceiptUploaded}
            className="border w-[20%] border-black rounded-[5px] bg-red-700 text-card py-1"
          >
            CANCEL
          </button>
         </div>
        </form>
      </div>
    </section>
  );
}
