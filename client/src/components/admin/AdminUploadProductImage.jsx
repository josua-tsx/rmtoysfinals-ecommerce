import AdminImagePlaceholder from "../../reusable/Admin/AdminImagePlaceholder";
import Buttons from "../../reusable/Buttons";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../../firebase/firebase";
import { MdDelete } from "react-icons/md";

export default function AdminUploadProductImage({ images, setImages }) {
  const [files, setFiles] = useState([]); // Stores the actual files to be uploaded
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + images.length > 4) {
      toast.error("You can only upload up to 4 images");
    } else {
      const newImages = selectedFiles.map((file) => URL.createObjectURL(file)); // Create a preview URL for each image
      setImages((prevImages) => [...prevImages, ...newImages]);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleImageSubmit = () => {
    setUploading(true);

    if (files.length > 0) {
      const promises = files.map((file) => storeImage(file));
      Promise.all(promises)
        .then((urls) => {
          // Successfully uploaded images, update state with URLs
          toast.success("Images uploaded successfully!");
          setImages(urls);
          setFiles([]); // Clear the files since they've been uploaded
          setUploading(false);
        })
        .catch((error) => {
          setUploading(false);
          toast.error(error.message);
        });
    } else {
      toast.error("No images to upload");
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedFiles = files.filter((_, i) => i !== index);
    setImages(updatedImages);
    setFiles(updatedFiles);
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
          toast.success(`Upload is ${progress}% done`);
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

  return (
    <div className="p-2 flex flex-col md:w-[450px] gap-2 relative">
      <div className="absolute bg-card -top-5 right-1 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div>
        <div className="flex-1 flex  mx-auto flex-col gap-2">
          {/* Main Picture */}
          <div className="border relative min-h-[400px] bg-card rounded-[5px] border-black p-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="border z-10 opacity-0 cursor-pointer inset-0 bg-black absolute"
            />
            <img src={images[0]} className="w-[300px] mx-auto" />
            {!images[0] && <AdminImagePlaceholder size={150} />}
          </div>

          <div className="flex gap-2">
            {images.slice(1, 4).map((image, index) => (
              <div
                key={index}
                className="bg-card relative flex-1 min-h-[80px] border-black border px-5 p-3 rounded-[5px]"
              >
                <img src={image} alt="" className="w-[85px] mx-auto h-auto" />
                {!image && <AdminImagePlaceholder size={50} />}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index + 1)} /// removing images
                  className="text-red-600 absolute right-0 top-0 hover:text-red-300"
                >
                  <MdDelete size={25} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-black rounded-[5px] bg-card p-4">
        <h1>UPLOAD IMAGE</h1>
        <div className="flex gap-2 justify-between items-center pt-5 pb-2">
          <div onClick={handleImageSubmit} className="flex-1">
            <Buttons
              buttonName={`${uploading ? "uploading" : "Upload image"}`}
            />
          </div>

          <button
            onClick={() => setImages([])}
            className="bg-blue-700 p-2 px-4 rounded-[5px] border border-black text-card"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
