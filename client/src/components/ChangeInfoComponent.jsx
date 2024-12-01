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
import { CiEdit } from "react-icons/ci";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function ChangeInfoComponent() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState(false);

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

  // handleuploadImage

  useEffect(() => {
    if (file) {
      handleProfilePhotoUpload(file);
    }
  }, [file]);

  const handleProfilePhotoUpload = (file) => {
    setFileError("");
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

  return (
    <div>
      <h1 className="text-xl">CHANGE INFORMATION</h1>
      <form onSubmit={handleFormSubmit} className="my-5 flex flex-col gap-10 ">
        <div className="flex flex-col items-center gap-4 justify-center">
          <p>AVATAR</p>
          <input
            hidden
            type="file"
            ref={fileRef}
            accept="image/.*"
            onChange={(e) => setFile(e.target.files[0])}
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
            className="bg-primary uppercase border border-black text-card px-2 py-1 rounded-[5px]"
          >
            Change Avatar
          </button>
        </div>

        <div className="flex flex-col gap-5 w-[90%] md:w-[70%] mx-auto uppercase">
          <div className="flex flex-col md:flex-row md:items-center my-2 justify-between text-md md:text-lg ">
            <h1 className="my-5">PERSONAL INFORMATION</h1>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="email">Email: </label>
                <div className="flex items-center  justify-between gap-5">
                  <input
                    type="email"
                    name="email"
                    defaultValue={currentUser.email}
                    id="email"
                    className="border border-black px-5 py-2 w-full bg-gray-200 rounded-[5px] outline-none"
                  />
                
                </div>
              </div>
            </div>
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="username">username: </label>
                <div className="flex items-center  justify-between gap-5">
                  <input
                    type="text"
                    name="username"
                    defaultValue={currentUser.username}
                    id="username"
                    className="border border-black px-5 py-2 w-full bg-gray-200 rounded-[5px] outline-none"
                  />
                
                </div>
              </div>
            </div>
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="fullName">full name: </label>
                <div className="flex items-center  justify-between gap-5">
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={currentUser.fullName}
                    id="fullName"
                    className="border border-black px-5 py-2 w-full bg-gray-200 rounded-[5px] outline-none"
                  />
                
                </div>
              </div>
            </div>
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="password">password: </label>
                <div className="flex items-center  justify-between gap-5">
                  <div className="flex relative bg-gray-200  w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      className=" outline-none p-3 bg-transparent w-full  border-[#313031] border rounded-[5px]"
                    />
                    <label
                      htmlFor=""
                      className="absolute right-2 top-4 flex items-center gap-2"
                    >
                      <p className="text-xs">SHOW PASSWORD</p>
                      <input
                        type="checkbox"
                        onChange={togglePassword}
                        checked={showPassword}
                        className="border  size-[20px]  border-black"
                      />
                    </label>
                  </div>
                
                </div>
              </div>
            </div>
            <div>
              <div className="flex  w-full gap-[10px] flex-col">
                <label htmlFor="phoneNum">phone number: </label>
                <div className="flex items-center  justify-between gap-5">
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="number"
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="phone number"
                      defaultValue={currentUser.phoneNumber}
                      className="border border-black px-5 py-2  bg-gray-200 rounded-[5px] outline-none"
                    />
                    <p className="text-sm pt-1 lowercase text-green-700">
                      (Category name do not allow spaces and number. It should
                      be between 3 to 50 max characters.)
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button className="hover:opacity-95 uppercase flex items-center border gap-5 px-5 border-black p-2 rounded-[5px] bg-primary text-card">
            UPDATE
            <FaCheckCircle size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
