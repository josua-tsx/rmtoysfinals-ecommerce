import AdminImagePlaceholder from "../../reusable/Admin/AdminImagePlaceholder";
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

    // Check if no files were selected
    if (selectedFiles.length === 0) return;

    // Validate each file
    for (const file of selectedFiles) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 2MB limit`);
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error(
          `"${file.name}" is not a valid image type (only JPG/JPEG/PNG allowed)`
        );
        return;
      }
    }

    // Validate total number of images
    if (selectedFiles.length + images.length > 4) {
      toast.error("You can only upload up to 4 images");
      return;
    }

    // Create preview URLs and update state
    const newImages = selectedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleImageSubmit = () => {
    setUploading(true);

    if (files.length > 0) {
      const promises = files.map((file) => storeImage(file));
      Promise.all(promises)
        .then((urls) => {
          toast.success("Images uploaded successfully!");
          setImages(urls);
          setFiles([]);
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
    <div className="flex flex-col w-full lg:w-[320px] gap-6 relative">
      {/* DECORATIVE PILL ACCENT */}
      <div className="absolute -top-3 right-4 w-20 h-6 bg-card border-2 border-black rounded-full z-10 hidden lg:block"></div>

      <div className="flex flex-col gap-6">
        {/* MAIN PREVIEW CONTAINER */}
        <div className="border border-black relative aspect-square bg-card rounded-[5px] p-4 flex items-center justify-center group overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleImageChange}
            className="z-20 opacity-0 cursor-pointer inset-0 absolute"
          />

          {images[0] ? (
            <img
              src={images[0]}
              className="w-full h-full object-cover rounded-sm transition-transform group-hover:scale-105"
              alt="Product Main"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-gray-300 group-hover:text-green-500 transition-colors">
              <AdminImagePlaceholder size={120} />
              <span className="font-black uppercase tracking-widest text-xs">
                Drop images here
              </span>
            </div>
          )}

          {/* OVERLAY INDICATOR */}
          <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter opacity-70">
            Main View
          </div>
        </div>

        {/* THUMBNAILS GRID */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="aspect-square bg-card relative border border-black rounded-[5px] flex items-center justify-center overflow-hidden"
            >
              {images[idx] ? (
                <>
                  <img
                    src={images[idx]}
                    alt={`Thumb ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-red-600/80 text-white opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <MdDelete size={24} />
                  </button>
                </>
              ) : (
                <div className="text-gray-200">
                  <AdminImagePlaceholder size={30} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* UPLOAD CONTROLS */}
      <div className="border border-black rounded-[5px] bg-card p-6">
        <h1 className="uppercase tracking-widest text-xs mb-4 pl-1">
          UPLOAD IMAGE
        </h1>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleImageSubmit}
            className="w-full bg-[#22c55e] text-white border border-black font-black uppercase tracking-widest py-3 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {uploading ? "Uploading..." : "Upload Images"}
            {uploading && (
              <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setImages([]);
              setFiles([]);
            }}
            className="w-full bg-blue-600 text-white border border-black font-black uppercase tracking-widest py-2 text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
