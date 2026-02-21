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
import { MdDelete, MdCloudUpload } from "react-icons/md";
import { FaCopy, FaChevronDown, FaChevronUp } from "react-icons/fa";
import useOrderStore from "../stores/useOrderStore";
import { useNavigate } from "react-router-dom";
import formatPrice from "../reusable/formatPrice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

import { clearGuestOrder } from "../lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phMobileSchema } from "../schemas/common.schema";
import ValidatedInput from "../reusable/ValidatedInput";

const gcashPaymentSchema = z.object({
  gcashPhoneNumber: phMobileSchema,
  gcashName: z.string().min(1, "GCash Name is required"),
});

export default function GcashPaymentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentOrder =
    useOrderStore((state) => state.currentOrder) ||
    JSON.parse(localStorage.getItem("manual-order-backup"));
  const clearOrder = useOrderStore((state) => state.clearOrder);

  useEffect(() => {
    if (!currentOrder) {
      navigate("/");
      return;
    }
  }, [currentOrder, navigate]);

  console.log(currentOrder);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gcashPaymentSchema),
    defaultValues: {
      gcashPhoneNumber: "",
      gcashName: "",
    },
  });

  useEffect(() => {
    if (currentOrder?.guestUser) {
      setValue("gcashName", currentOrder.guestUser.name || "");
      setValue("gcashPhoneNumber", currentOrder.guestUser.phone || "");
    }
  }, [currentOrder, setValue]);

  const [receiptImage, setReceiptImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const fileInputRef = useRef();

  const { mutate: placeOrderGcashQR } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/order/place-order-gcashQR`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`order placed`);
      clearOrder();
      localStorage.removeItem("manual-order-backup");
      clearGuestOrder();
      navigate("/cart");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const onSubmit = async (data) => {
    if (!receiptImage) {
      toast.error("Please upload proof of payment");
      return;
    }

    try {
      setUploading(true);
      const downloadURL = await storeImage(receiptImage);

      const orderData = {
        ...currentOrder,
        gcashQRmethod: {
          gcashPhoneNumber: data.gcashPhoneNumber,
          gcashName: data.gcashName,
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

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("09948088370");
    toast.success("GCash Number Copied!");
  };

  // --- Drag and Drop Handlers ---
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setReceiptImage(e.dataTransfer.files[0]);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        },
      );
    });
  };

  const cancelGcashQRpayment = () => {
    clearOrder();
    localStorage.removeItem("manual-order-backup");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-yellow px-4 flex items-center justify-center ">
      <div className="w-full max-w-5xl border mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col-reverse md:flex-row">
        {/* Left Column - Payment Form */}
        <div className="md:w-1/2 p-8 border-r border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Submit Proof of Payment
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ValidatedInput
              label="Your Gcash Phone Number"
              id="gcashPhoneNumber"
              {...register("gcashPhoneNumber")}
              error={errors.gcashPhoneNumber}
              placeholder="09XX XXX XXXX"
              maxLength={11}
            />

            <ValidatedInput
              label="Your Gcash Name"
              id="gcashName"
              {...register("gcashName")}
              error={errors.gcashName}
              placeholder="Juan D."
              maxLength={50}
            />

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
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
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Please ensure the sent amount is
                    exactly{" "}
                    <strong className="text-lg">
                      ₱{formatPrice(currentOrder?.totalPrice)}
                    </strong>
                    . Incorrect amounts may be refunded or marked as failed.
                  </p>
                </div>
              </div>
            </div>

            {/* Drag and Drop Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Receipt Screenshot
              </label>

              {!receiptImage ? (
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-blue-50 scale-[1.02]"
                      : "border-gray-300 hover:border-primary hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="p-3 bg-blue-100 text-primary rounded-full mb-3">
                      <MdCloudUpload size={32} />
                    </div>
                    <span className="text-gray-900 font-medium">
                      Click to upload
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      or drag and drop here
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative group border rounded-xl overflow-hidden bg-gray-50">
                  <div className="h-48 flex items-center justify-center p-4">
                    <img
                      src={URL.createObjectURL(receiptImage)}
                      alt="Receipt preview"
                      className="max-h-full max-w-full object-contain shadow-sm"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-white text-red-600 px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-50 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                    >
                      <MdDelete size={20} /> Remove File
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {receiptImage.name}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className={`flex-1 bg-primary border-2 border-black text-black font-bold py-3 px-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex justify-center items-center gap-2 ${
                  uploading ? "opacity-70 cursor-wait" : ""
                }`}
              >
                {uploading ? <>Processing...</> : <>Submit Payment</>}
              </button>
              <button
                onClick={() => cancelGcashQRpayment()}
                type="button"
                className="px-6 py-3 border-2 border-black rounded-xl font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Questions? Message us on{" "}
            <a
              href="https://www.facebook.com/Rmcarsandmotorbikes"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-bold hover:underline"
            >
              Facebook
            </a>{" "}
            or{" "}
            <button
              onClick={() => navigate("/contact")}
              className="text-blue-600 font-bold hover:underline"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Right Column - GCash Info & Summary */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex flex-col items-center">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-1">
              Scan to Pay
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6">
              Use your GCash App to scan
            </p>

            <div className="aspect-square bg-gray-50 rounded-xl mb-6 p-2 border border-dashed border-gray-200">
              <img
                src={RMTOYSQR}
                alt="GCash QR"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  GCash Number
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                    0994 808 8370
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
                    title="Copy Number"
                  >
                    <FaCopy size={18} />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Account Name
                </div>
                <div className="text-lg font-bold text-gray-800">
                  Jhon Josua Gono
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="mt-6 w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowOrderDetails(!showOrderDetails)}
            >
              <div>
                <div className="text-xs text-gray-500 font-bold uppercase">
                  Order Total
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₱{formatPrice(currentOrder?.totalPrice)}
                </div>
              </div>
              <div className="text-gray-400">
                {showOrderDetails ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {showOrderDetails && (
              <div className="bg-gray-50 max-h-60 overflow-y-auto p-4 space-y-3">
                {currentOrder?.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-white rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          item?.productId?.productImages?.[0] ||
                          item?.productImages?.[0] ||
                          item?.image
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 line-clamp-1">
                        {item?.productId?.productName || item.name || "Product"}
                      </div>
                      <div className="text-gray-500">
                        Qty: {item.quantity} × ₱
                        {formatPrice(item?.productId?.price || item.price)}
                      </div>
                    </div>
                    <div className="font-bold text-gray-700">
                      ₱
                      {formatPrice(
                        (item?.productId?.price || item.price || 0) *
                          item.quantity,
                      )}
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-3 mt-2 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₱{formatPrice(currentOrder?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₱{formatPrice(currentOrder?.shippingPrice)}</span>
                  </div>
                  {currentOrder?.usedCredits > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Credits Used</span>
                      <span>-₱{formatPrice(currentOrder?.usedCredits)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!showOrderDetails && (
              <div className="px-4 py-2 bg-gray-50 text-xs text-center text-gray-500 font-medium">
                {currentOrder?.orderItems?.length} Item(s) • Click to view
                details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
