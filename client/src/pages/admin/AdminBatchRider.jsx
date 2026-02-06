import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { HiDownload } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

export default function AdminBatchRider() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // Mutation for batch upload
  const { mutate: uploadMutation, isPending: isUploading } = useMutation({
    mutationFn: async (formData) => {
      const res = await axiosInstance.post(`/rider/batch-add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setUploadResult(data);
      setFile(null);
      if (data.created > 0) {
        toast.success(`Successfully created ${data.created} riders!`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} rows failed. See details below.`);
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
      const response = await axiosInstance.get(`/rider/csv-template`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "rider_upload_template.csv");
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

  return (
    <section className="bg-yellow min-h-screen text-sm md:text-normal font-main pb-20">
      <AdminHeader title="BATCH RIDER UPLOAD" />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-6 flex-col">
        {/* Instructions Card */}
        <div className="border border-black rounded-[5px] bg-card p-6">
          <h2 className="font-black uppercase tracking-widest mb-4">
            How to Use Batch Rider
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Download the template</strong> - Get the CSV with headers.
            </li>
            <li>
              <strong>Fill in details</strong> - Name, Phone Number (must be
              unique).
            </li>
            <li>
              <strong>Upload CSV</strong> - The system will create valid riders
              and skip duplicates.
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleDownloadTemplate}
            className="flex-1 bg-indigo-600 text-white p-4 flex justify-center items-center gap-3 rounded-[5px] border border-black font-black uppercase tracking-[0.1em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            <HiDownload size={20} />
            Download Template
          </button>
        </div>

        {/* Upload Section */}
        <div className="border border-black rounded-[5px] bg-card p-6">
          <h2 className="font-black uppercase tracking-widest mb-4">
            Upload Your CSV
          </h2>

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
                <span className="text-gray-500">Click to select CSV file</span>
              )}
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-[#22c55e] text-white px-8 py-4 flex items-center gap-3 rounded-[5px] border border-black font-black uppercase tracking-[0.1em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload CSV"}
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
                  Created
                </p>
              </div>
              <div className="bg-red-50 border border-red-500 rounded-[5px] p-4 text-center">
                <p className="text-3xl font-black text-red-600">
                  {uploadResult.failed}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-red-700">
                  Failed
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
