import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { HiDownload, HiUpload } from "react-icons/hi";
import { IoClose, IoCopy } from "react-icons/io5";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../../firebase/firebase";
import { MdDelete } from "react-icons/md";
// Remove unused placeholder if not needed, or keep it. It was used in AdminUploadProductImage.
// import AdminImagePlaceholder from "../../reusable/Admin/AdminImagePlaceholder";

export default function AdminBatchUpload() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // --- Bulk Image Upload Helper State ---
  const [helperImages, setHelperImages] = useState([]); // Preview URLs
  const [helperFiles, setHelperFiles] = useState([]); // Raw files
  const [uploadedLinks, setUploadedLinks] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const imageInputRef = useRef();

  // Mutation for batch upload
  const { mutate: uploadMutation, isPending: isUploading } = useMutation({
    mutationFn: async (formData) => {
      const res = await axiosInstance.post(`/product/batch-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setUploadResult(data);
      setFile(null);
      if (data.created > 0) {
        toast.success(`Successfully created ${data.created} products!`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} products failed. See details below.`);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Upload failed");
      setUploadResult(null);
    },
  });

  // Download CSV Template
  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance.get(`/product/csv-template`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product_upload_template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    } catch {
      toast.error("Failed to download template");
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  // Handle upload
  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    uploadMutation(formData);
  };

  // Clear file
  const handleClearFile = () => {
    setFile(null);
    setUploadResult(null);
  };

  // --- Image Helper Functions ---
  const handleImageHelperChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    // Filter valid images
    const validFiles = selectedFiles.filter((file) => {
      const isValid = ["image/jpeg", "image/png", "image/jpg"].includes(
        file.type,
      );
      const isSmallEnough = file.size <= 2 * 1024 * 1024; // 2MB
      if (!isValid) toast.error(`${file.name}: Invalid type`);
      if (!isSmallEnough) toast.error(`${file.name}: Too large (>2MB)`);
      return isValid && isSmallEnough;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    if (validFiles.length + helperFiles.length > 4) {
      toast.error("Max 4 images allowed per batch");
      e.target.value = "";
      return;
    }

    // Clear previous links when adding new images
    setUploadedLinks("");

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setHelperImages((prev) => [...prev, ...newPreviews]);
    setHelperFiles((prev) => [...prev, ...validFiles]);

    // Reset input value to allow re-selecting the same file
    e.target.value = "";
  };

  const removeHelperImage = (index) => {
    // Revoke URL to avoid memory leaks
    if (helperImages[index]) {
      URL.revokeObjectURL(helperImages[index]);
    }
    setHelperImages((prev) => prev.filter((_, i) => i !== index));
    setHelperFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedLinks("");
  };

  const clearHelper = () => {
    helperImages.forEach((url) => URL.revokeObjectURL(url));
    setHelperImages([]);
    setHelperFiles([]);
    setUploadedLinks("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const uploadHelperImages = async () => {
    if (!helperFiles.length) return;
    setIsUploadingImages(true);
    setUploadedLinks(""); // Clear any old links before starting
    const storage = getStorage(app);

    try {
      const uploadPromises = helperFiles.map(async (file) => {
        const fileName = `batch_upload/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytesResumable(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      });

      const urls = await Promise.all(uploadPromises);
      const urlString = urls.join(",");
      setUploadedLinks(urlString);
      toast.success("Images uploaded! Links ready to copy.");

      // Clear files and revoke URLs after successful upload
      helperImages.forEach((url) => URL.revokeObjectURL(url));
      setHelperImages([]);
      setHelperFiles([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const copyLinks = () => {
    navigator.clipboard.writeText(uploadedLinks);
    toast.success("Links copied to clipboard!");
  };

  return (
    <section className="bg-yellow min-h-screen text-sm md:text-normal font-main pb-20">
      <AdminHeader title="BATCH PRODUCT UPLOAD" />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-6 flex-col">
        {/* Instructions Card */}
        <div className="border border-black rounded-[5px] bg-card p-6">
          <h2 className="font-black uppercase tracking-widest mb-4">
            How to Use Batch Upload
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Download the template</strong> - Click the button below to
              get the CSV template with correct column headers.
            </li>
            <li>
              <strong>Fill in your products</strong> - Add one product per row.
              See the example row for format guidance.
            </li>
            <li>
              <strong>Upload your CSV</strong> - Select your filled CSV file and
              click Upload.
            </li>
            <li>
              <strong>Review results</strong> - Check which products were
              created and fix any errors.
            </li>
          </ol>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-500 rounded-[5px]">
            <h3 className="font-black text-xs uppercase tracking-widest text-amber-700 mb-2">
              Important Notes
            </h3>
            <ul className="text-xs space-y-1 text-amber-800">
              <li>
                • <strong>categoryName</strong> and{" "}
                <strong>supplierName</strong> must match existing names in your
                system.
              </li>
              <li>
                • <strong>productImages</strong> should be comma-separated URLs
                (create them using the Helper tool below!).
              </li>
              <li>
                • <strong>productDetails</strong> must be valid JSON:{" "}
                <code className="bg-amber-100 px-1 rounded">
                  {'[{"label":"color","value":"red"}]'}
                </code>
              </li>
              <li>
                • Products will be created with <strong>status: pending</strong>
                . Add stock separately.
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Download Template */}
          <button
            onClick={handleDownloadTemplate}
            className="flex-1 bg-indigo-600 text-white p-4 flex justify-center items-center gap-3 rounded-[5px] border border-black font-black uppercase tracking-[0.1em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            <HiDownload size={20} />
            Download CSV Template
          </button>
        </div>

        {/* Image Helper Tool */}
        <div className="border border-black rounded-[5px] bg-card p-6">
          <h2 className="font-black uppercase tracking-widest mb-4">
            Image Link Helper
          </h2>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-[5px] mb-4 text-xs text-blue-800">
            <p className="font-bold mb-1">Need image links for your CSV?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Upload product images here (Max 4).</li>
              <li>Click &quot;Generate Links&quot;.</li>
              <li>
                Copy the result and paste it into the{" "}
                <strong>productImages</strong> column of your CSV.
              </li>
              <li>Repeat for each product.</li>
            </ol>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Upload Area */}
            <div className="flex-1">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {/* Upload Button Box */}
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-square bg-white border border-dashed border-gray-400 rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <HiUpload size={20} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500 mt-1">
                    ADD
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={imageInputRef}
                    onChange={handleImageHelperChange}
                  />
                </div>

                {/* Previews */}
                {helperImages.map((src, idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative group border border-black rounded-[5px] overflow-hidden"
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                    <button
                      onClick={() => removeHelperImage(idx)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={uploadHelperImages}
                  disabled={!helperFiles.length || isUploadingImages}
                  className="flex-[3] bg-blue-600 text-white p-2 rounded-[5px] font-black uppercase text-xs tracking-wider disabled:opacity-50"
                >
                  {isUploadingImages ? "Generating..." : "Generate Links"}
                </button>
                <button
                  onClick={clearHelper}
                  disabled={
                    isUploadingImages || (!helperFiles.length && !uploadedLinks)
                  }
                  className="flex-1 bg-gray-200 text-gray-700 p-2 rounded-[5px] font-black uppercase text-xs tracking-wider hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Result Area */}
            <div
              className={`flex-1 flex flex-col ${
                !uploadedLinks && "opacity-50"
              }`}
            >
              <label className="text-[10px] font-black uppercase tracking-widest mb-2">
                Generated Links String
              </label>
              <textarea
                readOnly
                value={uploadedLinks}
                className="flex-1 resize-none border border-black rounded-[5px] p-2 text-xs font-mono bg-white mb-2 min-h-[80px]"
                placeholder="Upload images to generate links..."
              />
              <button
                onClick={copyLinks}
                disabled={!uploadedLinks}
                className="bg-green-600 text-white p-2 rounded-[5px] font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <IoCopy size={14} /> Copy to Clipboard
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="border border-black rounded-[5px] bg-card p-6">
          <h2 className="font-black uppercase tracking-widest mb-4">
            Upload Your CSV
          </h2>

          {/* File Input */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <label className="flex-1 border-2 border-dashed border-gray-400 rounded-[5px] p-6 text-center cursor-pointer hover:border-black transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleClearFile();
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <IoClose size={20} />
                  </button>
                </div>
              ) : (
                <span className="text-gray-500">
                  Click to select a CSV file or drag and drop
                </span>
              )}
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-[#22c55e] text-white px-8 py-4 flex items-center gap-3 rounded-[5px] border border-black font-black uppercase tracking-[0.1em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  Uploading...
                </>
              ) : (
                <>
                  <HiUpload size={20} />
                  Upload CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {uploadResult && (
          <div className="border border-black rounded-[5px] bg-card p-6">
            <h2 className="font-black uppercase tracking-widest mb-4">
              Upload Results
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-500 rounded-[5px] p-4 text-center">
                <p className="text-3xl font-black text-green-600">
                  {uploadResult.created}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-green-700">
                  Products Created
                </p>
              </div>
              <div className="bg-red-50 border border-red-500 rounded-[5px] p-4 text-center">
                <p className="text-3xl font-black text-red-600">
                  {uploadResult.failed}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-red-700">
                  Products Failed
                </p>
              </div>
            </div>

            {/* Error Details */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-[5px] p-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-red-700 mb-3">
                  Error Details
                </h3>
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="text-left p-2 font-bold">Row</th>
                        <th className="text-left p-2 font-bold">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResult.errors.map((err, idx) => (
                        <tr key={idx} className="border-b border-red-200">
                          <td className="p-2 font-mono">{err.row}</td>
                          <td className="p-2">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
