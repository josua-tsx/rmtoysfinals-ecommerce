import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaCamera, FaExclamationTriangle } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import Buttons from "../reusable/Buttons";
import PasswordInput from "../reusable/PasswordInput";
import ValidatedInput from "../reusable/ValidatedInput";
import {
  emailSchema,
  usernameSchema,
  phMobileSchema,
  fullNameSchema,
} from "../schemas/common.schema";

import app from "../firebase/firebase";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { useUserStore } from "../stores/useUserStore";

import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function ChangeInfoComponent() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [changePassword, setChangePassword] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  // Local states for inputs to support ValidatedInput
  const [username, setUsername] = useState(currentUser.username || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [fullName, setFullName] = useState(currentUser.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || "");
  const [password, setPassword] = useState("");

  const fileRef = useRef(null);

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        `/user/update/${currentUser._id}`,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentUser(data);
      toast.success("Profile Updated Successfully");
      setChangePassword(false);
      setPassword("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: verifyEmailMutation, isPending: isVerifying } = useMutation({
    mutationFn: async (email) => {
      const res = await axiosInstance.post(`/user/verify-email`, { email });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Verification email sent");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send email");
    },
  });

  const handleVerifyEmail = (email) => {
    verifyEmailMutation(email);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const data = {
      username,
      email,
      fullName,
      phoneNumber,
      password,
      avatar: imageUrl ? imageUrl : currentUser.avatar,
    };

    // Note: On frontend we validate the body part of updateUserSchema or just individual fields
    // Using a simple check for required fields or specific schemas
    const usernameResult = usernameSchema.safeParse(username);
    const emailResult = emailSchema.safeParse(email);
    const phoneResult = phMobileSchema.safeParse(phoneNumber);
    const nameResult = fullNameSchema.safeParse(fullName);

    if (!usernameResult.success)
      return toast.error(usernameResult.error.issues[0].message);
    if (!emailResult.success)
      return toast.error(emailResult.error.issues[0].message);
    if (fullName && !nameResult.success)
      return toast.error(nameResult.error.issues[0].message);
    if (phoneNumber && !phoneResult.success)
      return toast.error(phoneResult.error.issues[0].message);

    updateProfile(data);
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
      }
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
        <form onSubmit={handleFormSubmit} className="space-y-8">
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
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    schema={emailSchema}
                    placeholder="name@example.com"
                  />
                  <div className="absolute right-8 top-8">
                    {currentUser?.isEmailVerified ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => handleVerifyEmail(currentUser.email)}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-md font-medium transition-colors"
                      >
                        {isVerifying ? "Sending..." : "Verify Now"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Username Field */}
                <ValidatedInput
                  label="Username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  schema={usernameSchema}
                  placeholder="johndoe123"
                  errorText="3-30 characters, no special characters"
                />

                {/* Full Name Field */}
                <ValidatedInput
                  label="Full Name"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  schema={fullNameSchema}
                  placeholder="John Doe"
                />

                {/* Phone Number Field */}
                <ValidatedInput
                  label="Phone Number"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  schema={phMobileSchema}
                  placeholder="09xxxxxxxxx"
                  errorText="Must be a valid 11-digit number starting with 09"
                />
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
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              isLoading={isUpdating}
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
