import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";
import {
  HiOutlineCurrencyDollar,
  HiOutlineTruck,
  HiOutlineQuestionMarkCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";
import { useUserStore } from "../../stores/useUserStore";
import Buttons from "../../reusable/Buttons";
import { FaPaperPlane } from "react-icons/fa";
import { IoClose, IoAttach } from "react-icons/io5";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../../firebase/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ValidatedInput from "../../reusable/ValidatedInput";

import { createTicketSchema } from "../../schemas/ticket.schema";

const ISSUE_TYPES = [
  {
    value: "Refund Request",
    label: "Refund Request",
    icon: HiOutlineCurrencyDollar,
  },
  { value: "Shipping Issue", label: "Shipping Issue", icon: HiOutlineTruck },
  {
    value: "Product Inquiry",
    label: "Product Inquiry",
    icon: HiOutlineQuestionMarkCircle,
  },
  {
    value: "Damaged Product",
    label: "Damaged Product",
    icon: HiOutlineExclamationTriangle,
  },
  {
    value: "Order Cancellation",
    label: "Order Cancellation",
    icon: HiOutlineXCircle,
  },
  { value: "Other", label: "Other", icon: HiOutlineChatBubbleLeftEllipsis },
];

// Ticket Schema (REMOVED: Using shared schema)

export default function TicketModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.currentUser);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      name: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      orderNumber: "",
      issueType: "",
      subject: "",
      message: "",
      priority: "Medium",
    },
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const watchedIssueType = watch("issueType");

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        orderNumber: "",
        issueType: "",
        subject: "",
        message: "",
        priority: "Medium",
      });
      setSelectedImages([]);
    }
  }, [isOpen, user, reset]);

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/ticket/create", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        "Ticket submitted successfully! We'll respond to your email shortly.",
      );
      onClose();
      queryClient.invalidateQueries({
        queryKey: ["userTickets"],
      });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to submit ticket. Please try again.",
      );
    },
  });

  const onSubmit = async (data) => {
    // Upload images first
    const imageUrls = await uploadImages();
    createTicket({ ...data, images: imageUrls });
  };

  // Image handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (selectedImages.length + validFiles.length > maxFiles) {
      toast.error(`You can only attach up to ${maxFiles} images`);
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls = [];

    try {
      const storage = getStorage(app);

      for (const file of selectedImages) {
        const fileName = `ticket-images/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            },
          );
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }

    return uploadedUrls;
  };

  if (!isOpen) return null;

  return (
    <section className="inset-0 z-50 font-main fixed overflow-y-auto md:overflow-y-hidden backdrop-blur-sm p-3">
      <div className="min-h-screen relative flex flex-col justify-center items-center py-10">
        <div className="border relative p-0 flex flex-col gap-0 border-black w-full max-w-[600px] bg-card rounded-[5px] max-h-[90vh] overflow-hidden">
          {/* Header Sticker */}
          <div className="bg-primary text-white border-b border-black p-4 flex justify-between items-center relative z-10">
            <div>
              <h1 className="font-black uppercase tracking-widest text-base">
                Submit Support Ticket
              </h1>
              <p className="text-sm opacity-80">
                We&apos;ll help you resolve your issue
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Close Button */}
              <button
                onClick={onClose}
                type="button"
                className="bg-red-600 text-white border border-black size-8 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all group"
              >
                <IoIosClose
                  size={24}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 gap-6">
            <form onSubmit={handleSubmit(onSubmit)} className="">
              {/* Issue Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Issue Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ISSUE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = watchedIssueType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setValue("issueType", type.value)}
                        className={`p-4 border border-black rounded-[5px] text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-2 transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-black shadow-none translate-x-[2px] translate-y-[2px]"
                            : "bg-white text-gray-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          className={`text-2xl ${
                            isSelected ? "text-black" : "text-primary"
                          }`}
                        />
                        <span className="text-center">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.issueType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.issueType.message}
                  </p>
                )}
              </div>
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <ValidatedInput
                    label="Full Name *"
                    id="name"
                    {...register("name")}
                    error={errors.name}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>
                <div>
                  <ValidatedInput
                    label="Email *"
                    id="email"
                    type="email"
                    {...register("email")}
                    error={errors.email}
                    placeholder="your@email.com"
                    maxLength={100}
                  />
                </div>
              </div>
              {/* Phone & Order Number Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <ValidatedInput
                    label="Phone Number"
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    error={errors.phone}
                    placeholder="09xxxxxxxxx"
                    maxLength={13}
                  />
                </div>
                <div>
                  <ValidatedInput
                    label="Order Number (if applicable)"
                    id="orderNumber"
                    {...register("orderNumber")}
                    error={errors.orderNumber}
                    placeholder="Order ID"
                    maxLength={50}
                  />
                </div>
              </div>
              {/* Subject */}
              <div className="mt-4">
                <ValidatedInput
                  label="Subject *"
                  id="subject"
                  {...register("subject")}
                  error={errors.subject}
                  placeholder="Brief description of your issue"
                  maxLength={100}
                />
              </div>
              {/* Message */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Message *
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className={`w-full border ${
                    errors.message ? "border-red-500" : "border-black"
                  } rounded-[5px] p-2 focus:outline-none focus:border-primary resize-none`}
                  maxLength={1000}
                  placeholder="Please describe your issue in detail..."
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>
              {/* Image Attachments */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Attach Images (optional)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                />

                {/* Image Preview */}
                {selectedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border border-black"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <IoClose size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 5}
                  className="flex items-center gap-2 px-3 py-2 border border-black rounded-[5px] text-sm bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IoAttach size={18} />
                  {selectedImages.length > 0
                    ? `${selectedImages.length}/5 images attached`
                    : "Add images (max 5)"}
                </button>
              </div>
              {/* Priority (optional) */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  {...register("priority")}
                  className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              {/* Submit Button */}
              <div className="mt-6">
                <Buttons
                  buttonType="submit"
                  isLoading={isPending || isUploading || isSubmitting}
                  loadingText={
                    isUploading ? "Uploading images..." : "Submitting..."
                  }
                  buttonName="Submit Ticket"
                  icon={<FaPaperPlane size={18} />}
                  animateIcon={true}
                  className="w-full py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
