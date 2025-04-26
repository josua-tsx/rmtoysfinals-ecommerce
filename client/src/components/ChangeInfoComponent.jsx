import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";

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
  const [fileError, setFileError] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Toggle the password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  console.log(currentUser);

  const fileRef = useRef(null);

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        `/user/update/${currentUser._id}`,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      setCurrentUser(data);
      setShowPassword(false);
      toast.success("Profile Updated Successfully");
      setChangePassword(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { username, email, password, phoneNumber, fullName } = inputs;

    try {
      updateProfile({
        username,
        email,
        password,
        avatar: imageUrl ? imageUrl : currentUser.avatar,
        phoneNumber,
        fullName,
      });
    } catch (error) {
      console.log(error);
    }
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

    if (!file) {
      console.log("file did not exist");
    }

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
        setFileError(true);
        console.log("Upload failed", error);
        toast.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setFileError(false);
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
    <div>
      <h1 className="text-xl">Change Information</h1>
      <form onSubmit={handleFormSubmit} className="my-5 flex flex-col gap-10 ">
        <div className="flex flex-col items-center gap-4 justify-center">
          <p>AVATAR</p>
          <input
            hidden
            type="file"
            ref={fileRef}
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleFileChange}
            name="image"
          />
          <img
            src={currentUser.avatar}
            alt="avatar.img"
            className="w-[150px] h-[150px] rounded-full border border-black object-cover"
          />
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="bg-primary  border border-black text-card px-2 py-1 rounded-[5px]"
          >
            Change Avatar
          </button>
         <div className="flex flex-col items-center">
         <p className="text-sm text-green-700">
            (File size must be less than 2MB )
          </p>
          <p className="text-sm text-center text-green-700">
            (Image.png, image.jpeg, and image.jgp are only allowed. )
          </p>
         </div>
        </div>

        <div className="flex flex-col gap-5 w-[90%] md:w-[70%] mx-auto ">
          <div className="flex flex-col md:flex-row md:items-center my-2 justify-between text-md md:text-lg ">
            <h1 className="my-5">Personal Information</h1>
          </div>

          <div className="bg-yellow-50 border-l-4 text-red-700 border-red-700 p-4 mb-6">
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
                <p className="text-md ">
                  <strong>Important:</strong> Your phone number is very
                  important — this is where we’ll send SMS updates about your
                  orders and other important notifications. Please make sure
                  it’s valid and up to date.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="email">Email: </label>
                <div className="flex flex-col ">
                  <input
                    type="email"
                    name="email"
                    defaultValue={currentUser.email}
                    id="email"
                    placeholder="Ex: example@domain.com"
                    className="border border-black px-5 py-2 w-full bg-gray-200 rounded-[5px] outline-none"
                  />
                  <p className="text-sm pt-1 lowercase text-green-700">
                    (Enter a valid email. Numbers are not allowed after "@")
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="username">Username: </label>
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="username"
                    defaultValue={currentUser.username}
                    id="username"
                    placeholder="Ex: johndoe123"
                    className="border border-black px-5 py-2 w-full bg-gray-200 rounded-[5px] outline-none"
                  />
                  <p className="text-sm pt-1 lowercase text-green-700">
                    (Username must be 3-30 characters long and contain no
                    special characters.)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="fullName">Full Name: </label>
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={currentUser.fullName}
                    id="fullName"
                    placeholder="Ex: John Doe"
                    className="border border-black px-5 py-2 w-full bg-gray-200 rounded-[5px] outline-none"
                  />
                  <p className="text-sm pt-1 lowercase text-green-700">
                    (Fullname must be 2-100 characters long. Fullname must only
                    use letters, spaces, hyphens (-), apostrophes ('), or dot
                    (.) )
                  </p>
                </div>
              </div>
            </div>

            <div className="">
              {!changePassword ? (
                <div className="flex flex-col gap-2 my-2">
                  <label htmlFor="">Do you want to change your password?</label>
                  <button
                    onClick={() => setChangePassword(!changePassword)}
                    className="border border-black p-2  rounded-[5px] bg-primary text-card "
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="flex  w-full gap-[10px] flex-col">
                  <label htmlFor="password">Password: </label>
                  <div className="flex items-center  justify-between gap-5">
                    <div className="flex relative  w-full">
                      <div className="flex flex-col w-full">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          className=" outline-none p-3  w-full bg-gray-200   border-[#313031] border rounded-[5px]"
                        />
                        <p className="text-sm pt-1 lowercase text-green-700">
                          (Password must be at least 8 characters)
                        </p>
                      </div>
                      <label
                        htmlFor=""
                        className="absolute right-2 top-4 flex items-center gap-2"
                      >
                        <p className="text-xs">Show Password</p>
                        <input
                          type="checkbox"
                          onChange={togglePassword}
                          checked={showPassword}
                          className="border  size-[20px]  border-black"
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    className="border border-black p-2 rounded-[5px] bg-red-700 text-card "
                    onClick={() => setChangePassword(!changePassword)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="phoneNum">Phone Number: </label>
                <div className="flex items-center  justify-between gap-5">
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="number"
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="Ex: 09*******83"
                      defaultValue={currentUser.phoneNumber}
                      className="border border-black px-5 py-2  bg-gray-200 rounded-[5px] outline-none"
                    />
                    <p className="text-sm pt-1 lowercase text-green-700">
                      (Phone number should be valid number. It should start with
                      09 and exact 11 numbers)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button className="hover:opacity-95  flex items-center border gap-5 px-5 border-black p-2 rounded-[5px] bg-primary text-card">
            Update
            <FaCheckCircle size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
