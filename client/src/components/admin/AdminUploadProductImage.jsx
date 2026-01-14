import AdminImagePlaceholder from "../../reusable/Admin/AdminImagePlaceholder";
import { useRef } from "react";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";

export default function AdminUploadProductImage({
  images,
  setImages,
  files,
  setFiles,
}) {
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 2MB limit`);
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error(
          `"${file.name}" is not a valid image type (only JPG/JPEG/PNG allowed)`
        );
        return;
      }
    }

    if (selectedFiles.length + images.length > 4) {
      toast.error("You can only upload up to 4 images");
      return;
    }

    const newImages = selectedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedFiles = files.filter((_, i) => i !== index);
    setImages(updatedImages);
    setFiles(updatedFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col w-full lg:w-[320px] gap-6 relative">
      <div className="absolute -top-3 right-4 w-20 h-6 bg-card border-2 border-black rounded-full z-10 hidden lg:block"></div>

      <div className="flex flex-col gap-6">
        <div className="border border-black relative aspect-square bg-card rounded-[5px] p-4 flex items-center justify-center group overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleImageChange}
            className={`z-20 opacity-0 cursor-pointer inset-0 absolute ${
              images[0] ? "hidden" : "block"
            }`}
          />

          {images[0] ? (
            <>
              <img
                src={images[0]}
                className="w-full h-full object-cover rounded-sm transition-transform group-hover:scale-105"
                alt="Product Main"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(0);
                }}
                className="absolute inset-0 bg-red-600/40 text-white opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity z-30"
              >
                <div className="bg-red-600 p-2 rounded-full shadow-lg border-2 border-white">
                  <MdDelete size={32} />
                </div>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-gray-300 group-hover:text-green-500 transition-colors">
              <AdminImagePlaceholder size={120} />
              <span className="font-black uppercase tracking-widest text-xs">
                Drop images here
              </span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter opacity-70">
            Main View
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="aspect-square bg-card relative border border-black rounded-[5px] flex items-center justify-center overflow-hidden group/thumb"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  >
                    <MdDelete size={14} />
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

      <div className="border border-black rounded-[5px] bg-card p-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Click boxes above to add images
        </p>
        <p className="text-[9px] uppercase tracking-tighter text-gray-400 mt-1">
          Max 4 images • JPEG/PNG • Max 2MB
        </p>
      </div>
    </div>
  );
}
