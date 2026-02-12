import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaCamera, FaExclamationTriangle } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Buttons from "../reusable/Buttons";
import PasswordInput from "../reusable/PasswordInput";
import ValidatedInput from "../reusable/ValidatedInput";
import VerifyOtpWidget from "./VerifyOtpWidget";
import {
  emailSchema,
  usernameSchema,
  phMobileSchema,
  fullNameSchema,
} from "../schemas/common.schema";
import { passwordSchema } from "../schemas/auth.schema";

import app from "../firebase/firebase";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserStore } from "../stores/useUserStore";

import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Profile Schema
const profileSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  fullName: fullNameSchema.optional().or(z.literal("")),
  phoneNumber: phMobileSchema.optional().or(z.literal("")),
  password: z.union([z.literal(""), passwordSchema]).optional(),
});

export default function ChangeInfoComponent() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [changePassword, setChangePassword] = useState(false);

  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const checkAuth = useUserStore((state) => state.checkAuth);

  const fileRef = useRef(null);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      fullName: currentUser?.fullName || "",
      phoneNumber: currentUser?.phoneNumber || "",
      password: "",
    },
  });

  // Reset form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser.username || "",
        email: currentUser.email || "",
        fullName: currentUser.fullName || "",
        phoneNumber: currentUser.phoneNumber || "",
        password: "",
      });
    }
  }, [currentUser, reset]);

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        `/user/update/${currentUser._id}`,
        data,
      );
      return res.data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await checkAuth(); // Update local Zustand store
      toast.success("Profile Updated Successfully");
      setChangePassword(false);
      reset({ ...data, password: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  const handleRefreshUser = () => {
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };

  const onSubmit = (data) => {
    // Build submission data
    const submitData = {
      ...data,
      avatar: imageUrl ? imageUrl : currentUser.avatar,
    };

    // Remove password if empty
    if (!submitData.password) {
      delete submitData.password;
    }

    updateProfile(submitData);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Only JPG/JPEG/PNG files are allowed");
      return;
    }

    // Validate file size (2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleProfilePhotoUpload = (file) => {
    setUploadProgress(0);

    if (!file) return;

    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const rounded = Math.round(progress);
        setUploadProgress(rounded);
      },
      (error) => {
        console.log("Upload failed", error);
        toast.error("Image upload failed");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          toast.success(`Avatar uploaded`);
          setImageUrl(downloadUrl);
        });
      },
    );
  };

  useEffect(() => {
    if (file) {
      handleProfilePhotoUpload(file);
    }
  }, [file]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account information and preferences
        </p>
      </div>
      <div className="  p-8 space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileRef.current.click()}
            >
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
                <img
                  src={
                    imageUrl ||
                    currentUser.avatar ||
                    "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <FaCamera className="text-white text-2xl" />
                </div>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            <input
              hidden
              type="file"
              ref={fileRef}
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
              name="image"
            />

            <div className="text-center space-y-2">
              <Buttons
                buttonName="Change Profile Photo"
                onClick={() => fileRef.current.click()}
                animateIcon={true}
                className="w-fit mx-auto px-6 py-2 "
              />
              <p className="text-[10px] font-black uppercase text-gray-400">
                JPG, GIF or PNG. Max size 2MB
              </p>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-primary pl-3">
                Personal Information
              </h2>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold">Important:</span> Keep your
                  phone number up to date. We use this to send you critical
                  updates about your orders and account security.
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Email Field */}
                <div className="space-y-2 relative">
                  <ValidatedInput
                    label="Email Address"
                    id="email"
                    type="email"
                    {...register("email")}
                    error={errors.email}
                    placeholder="name@example.com"
                  />
                  <div className="absolute right-8 top-8">
                    <VerifyOtpWidget
                      identifier={currentUser?.email}
                      channel="email"
                      isVerified={currentUser?.isEmailVerified}
                      onVerified={handleRefreshUser}
                    />
                  </div>
                </div>

                {/* Username Field */}
                <ValidatedInput
                  label="Username"
                  id="username"
                  {...register("username")}
                  error={errors.username}
                  placeholder="johndoe123"
                  errorText="3-30 characters, no special characters"
                />

                {/* Full Name Field */}
                <ValidatedInput
                  label="Full Name"
                  id="fullName"
                  {...register("fullName")}
                  error={errors.fullName}
                  placeholder="John Doe"
                />

                {/* Phone Number Field */}
                <div className="space-y-2 relative">
                  <ValidatedInput
                    label="Phone Number"
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    error={errors.phoneNumber}
                    placeholder="09xxxxxxxxx"
                    errorText="Must be a valid 11-digit number starting with 09"
                  />
                  {currentUser?.phoneNumber && (
                    <div className="absolute right-8 top-8">
                      <VerifyOtpWidget
                        identifier={currentUser?.phoneNumber}
                        channel="sms"
                        isVerified={currentUser?.isPhoneVerified}
                        onVerified={handleRefreshUser}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-red-500 pl-3">
                Security
              </h2>

              {!changePassword ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setChangePassword(true)}
                    className=" inline-flex items-center justify-center px-4 py-2 border border-black text-xs font-black uppercase tracking-widest rounded-[5px] text-gray-700 bg-white hover:bg-gray-50 focus:outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div className=" rounded-lg p-6 space-y-4 border border-black bg-white animate-in fade-in slide-in-from-top-2 duration-200">
                  <PasswordInput
                    label="New Password"
                    id="password"
                    {...register("password")}
                    error={errors.password}
                    placeholder="Enter new password"
                    className="!bg-white"
                    errorText="Must be at least 8 characters with 1 lowercase, 1 uppercase, 1 symbol, and 1 number"
                  />

                  <div className="flex justify-end pt-2">
                    <Buttons
                      buttonType="button"
                      buttonName="Cancel"
                      onClick={() => setChangePassword(false)}
                      className="w-fit bg-white border border-black !py-1 !text-black"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <Buttons
              buttonType="submit"
              buttonName="Save Changes"
              isLoading={isUpdating || isSubmitting}
              loadingText="Updating..."
              icon={<FaCheckCircle className="text-lg" />}
              animateIcon={true}
              className="w-fit px-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
