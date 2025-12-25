import { useState, useRef, useEffect } from "react";
import RMTOYSQR from "../assets/RMTOYSQR.jpg";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebase/firebase";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import useOrderStore from "../stores/useOrderStore";
import { useBlocker, useNavigate } from "react-router-dom";
import formatPrice from "../reusable/formatPrice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { clearGuestOrder } from "../lib/utils";

export default function GcashPaymentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentUser = useUserStore((state) => state.currentUser);
  const currentOrder =
    useOrderStore((state) => state.currentOrder) ||
    JSON.parse(localStorage.getItem("manual-order-backup"));
  const clearOrder = useOrderStore((state) => state.clearOrder);

  useEffect(() => {
    if (!currentOrder) {
      navigate("/");
      return;
    }
  }, [currentOrder]);

  console.log(currentOrder);

  const [gcashPhoneNumber, setGcashPhoneNumber] = useState("");
  const [gcashName, setGcashName] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  console.log(gcashPhoneNumber);

  const { mutate: placeOrderGcashQR } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/order/place-order-gcashQR`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`order placed`);
      clearOrder();
      clearGuestOrder();
      navigate("/cart");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiptImage) {
      toast.error("Please upload proof of payment");
      return;
    }

    if (!gcashPhoneNumber) {
      toast.error("no gcash number");
      return;
    }

    try {
      setUploading(true);
      const downloadURL = await storeImage(receiptImage);

      const orderData = {
        ...currentOrder,
        gcashQRmethod: {
          gcashPhoneNumber: gcashPhoneNumber,
          gcashName,
          proofOfPaymentImage: downloadURL,
        },
      };
      placeOrderGcashQR(orderData);

      toast.success("Payment submitted successfully!");
    } catch (error) {
      toast.error("Error submitting payment: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptImage(file);
    }
  };

  const handleRemoveImage = () => {
    setReceiptImage(null);
    fileInputRef.current.value = "";
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
          toast.success(`Upload is ${Math.round(progress)}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const cancelGcashQRpayment = () => {
    clearOrder();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-yellow pt-[200px] px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl border mx-auto  bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Left Column - Payment Form */}
          <div className="md:w-1/2 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
              Submit Your Payment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gcash Phone Number:
                </label>
                <input
                  type="tel"
                  id="gcashPhoneNumber"
                  name="gcashPhoneNumber"
                  value={gcashPhoneNumber}
                  onChange={(e) => setGcashPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-primary"
                  placeholder="Enter your gcash phone number"
                  maxLength={11}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gcash Name:
                </label>
                <input
                  type="text"
                  name="gcashName"
                  id="gcashName"
                  value={gcashName}
                  onChange={(e) => setGcashName(e.target.value)}
                  placeholder="Gcash Name"
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-primary"
                  required
                />
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex flex-col gap-2">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> Please ensure the amount sent
                      matches exactly{" "}
                      <strong>₱{formatPrice(currentOrder?.totalPrice)}</strong>.
                      Payments with incorrect amounts will be refunded and
                      considered failed.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof of Payment
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-500 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                      <span className="text-sm font-medium">Choose File</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg, image/png, image/jpg"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <span className="ml-2 text-sm text-gray-500">
                      {receiptImage ? receiptImage.name : "No file chosen"}
                    </span>
                  </div>

                  {receiptImage && (
                    <div className="relative mt-2">
                      <img
                        src={URL.createObjectURL(receiptImage)}
                        alt="Receipt preview"
                        className="h-32 object-contain border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex-1 bg-primary border border-black text-white py-2 px-4 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-primary-dark"
                  }`}
                >
                  {uploading ? "Submitting..." : "Submit Payment"}
                </button>
                <button
                  onClick={() => cancelGcashQRpayment()}
                  type="button"
                  className="text-white py-2 border border-black px-4 rounded-md bg-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Need help?
              </h3>
              <p className="text-sm text-gray-600">
                Need further assistance? Contact us anytime on our Facebook
                page.{" "}
                <span>
                  <a
                    className="text-blue-700"
                    href="https://www.facebook.com/Rmcarsandmotorbikes"
                    target=""
                  >
                    RM TOYS
                  </a>
                </span>{" "}
                or{" "}
                <button
                  className="text-blue-700"
                  onClick={() => navigate("/contact")}
                >
                  SEND US YOUR CONCERN IN OUR EMAIL!
                </button>
              </p>
            </div>
          </div>

          {/* Right Column - GCash QR Code */}
          <div className="md:w-1/2 bg-blue-50 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-xs">
              <h3 className="text-lg font-medium text-gray-800 mb-3 text-center">
                Scan & Pay via GCash
              </h3>
              <p className="text-xs text-gray-500 text-center mb-4">
                Transfer fees may apply.
              </p>

              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 flex justify-center">
                <img
                  src={RMTOYSQR}
                  alt="GCash QR Code"
                  className="w-60 h-60 object-cover"
                />
              </div>

              <div className="space-y-2 text-sm bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Paying: </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items: </span>
                  <span>{currentOrder?.orderItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method: </span>
                  <span>{currentOrder?.paymentMethod}</span>
                </div>
                {currentUser ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Credits Added:{" "}
                      </span>
                      <span>+{currentOrder?.totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Credits Used:{" "}
                      </span>
                      <span>{currentOrder?.usedCredits}</span>
                    </div>
                  </>
                ) : (
                  ""
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price: </span>
                  <span>{formatPrice(currentOrder?.totalPrice)} PHP</span>
                </div>
                {/* <div className="flex justify-between font-medium">
                      <span className="text-gray-600">GCash Number:</span>
                      <span>09948088370</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600">Account Name:</span>
                      <span>Jhon Josua Gono</span>
                    </div> */}
              </div>

              <p className="mt-4 text-sm text-gray-600 text-center">
                Upload the payment receipt after completing your transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
