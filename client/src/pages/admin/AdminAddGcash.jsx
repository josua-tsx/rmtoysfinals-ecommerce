import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import app from "../../firebase/firebase";
import toast from "react-hot-toast";
import { useRef, useState } from "react";
import { BiSolidImageAdd } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export default function AdminAddGcash() {
  const fileInputRef = useRef(); // Reference to the file input element
  const queryClient = useQueryClient();

  const [gcashImage, setGcashImage] = useState(null); // Store the uploaded image URL
  const [gcashName, setGcashName] = useState("");
  const [file, setFile] = useState(null); // Store the actual file to be uploaded
  const [uploading, setUploading] = useState(false);

  console.log(gcashName);

  const { mutate: addGcashMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/gcash/add-gcash`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gcash"] });
      toast.success("Successfully Added Gcash!");
      fileInputRef.current.value = "";
      setGcashImage(null);
      setGcashName("");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0]; // Get the first selected file
    if (selectedFile) {
      setFile(selectedFile); // Set the file state
      const imagePreview = URL.createObjectURL(selectedFile); // Create preview URL for the selected image
      setGcashImage(imagePreview); // Set the preview image
    }
  };

  const handleImageSubmit = () => {
    if (!file) {
      toast.error("No image selected!");
      return;
    }

    setUploading(true);
    storeImage(file)
      .then((url) => {
        toast.success("Image uploaded successfully!");
        setGcashImage(url); // Store the uploaded image URL
        setFile(null); // Clear the file state
        setUploading(false);
      })
      .catch((error) => {
        setUploading(false);
        toast.error(error.message);
      });
  };

  const handleRemoveImage = () => {
    setGcashImage(null); // Clear the preview image
    setFile(null); // Clear the file state
    fileInputRef.current.value = ""; // Clear the file input value
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name; // Create unique file name
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          toast.success(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL); // Return the download URL after the upload is complete
          });
        }
      );
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!gcashImage || !gcashName) {
      toast.error("Please input required fields.");
      return;
    }

    setUploading(true); // Set uploading state

    storeImage(file) // Upload image
      .then((uploadedImageUrl) => {
        toast.success("Image uploaded successfully!");

        // Now submit the form with the image URL and other data
        addGcashMutation({
          gcashUrl: uploadedImageUrl, // Pass the uploaded image URL
          gcashName,
        });

        // Reset the form states after successful submission
        setGcashImage(null);
        setFile(null);
        setGcashName("");
        fileInputRef.current.value = ""; // Clear the file input
        setUploading(false); // End the uploading state
      })
      .catch((error) => {
        toast.error("Image upload failed. Please try again.");
        setUploading(false); // End the uploading state
      });
  };

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"ADD GCASH"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleFormSubmit}
          className="relative border border-black flex flex-col rounded-[5px] bg-card"
        >
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className="flex flex-col p-2 pb-5 gap-2">
            <div className="flex flex-col">
              <label className="p-2 uppercase" htmlFor="cproductName">
                GCASH IMAGE:
              </label>

              <div>
                <input
                  ref={fileInputRef} // Attach reference to the input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border opacity-0 cursor-pointer w-full bg-black absolute"
                />
                <div className="flex gap-2 border border-black p-1 rounded-[5px] w-full justify-center">
                  <p>ADD GCASH IMAGE</p>
                  <BiSolidImageAdd size={25} />
                </div>
              </div>
            </div>

            {/* Display the uploaded image */}
            {gcashImage && (
              <div className="p-2 rounded-[5px]">
                <div className="bg-card relative flex-1 min-h-[80px] border-black border px-5 p-3 rounded-[5px]">
                  <img
                    src={gcashImage}
                    alt="gcashImage Preview"
                    className="w-[85px] mx-auto h-auto"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-600 absolute right-0 top-0 hover:text-red-300"
                  >
                    <MdDelete size={25} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col justify-between">
              <label className="p-2 uppercase" htmlFor="stockQuantity">
                GCASH NAME:
              </label>
              <input
                className="border p-1 w-full outline-none  border-black rounded-[5px]"
                type="text"
                name="gcashName"
                id="gcashName"
                onChange={(e) => setGcashName(e.target.value)}
                value={gcashName}
              />
            </div>
          </div>

          <div className="flex p-2">
            <button
              type="submit"
              className="bg-primary flex-1 text-card p-2 rounded-[5px] border border-black"
              disabled={uploading}
            >
              {uploading ? "loading.." : "ADD GCASH"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
