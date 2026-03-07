import AdminHeader from "../../reusable/Admin/AdminHeader";
import { createProductSchema } from "../../schemas/product.schema";
import AdminUploadProductImage from "../../components/admin/AdminUploadProductImage";
import ValidatedInput from "../../reusable/ValidatedInput";
import { FiEdit3 } from "react-icons/fi";
import { HiTrash } from "react-icons/hi";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { SiGooglegemini } from "react-icons/si";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../../firebase/firebase";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminEditProducts() {
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState([]); // Raw files for upload (separate from form state)
  const [isUploading, setIsUploading] = useState(false);

  // Local state for adding new product details before pushing to array
  const [detailLabel, setDetailLabel] = useState("");
  const [detailValue, setDetailValue] = useState("");
  const [editingDetailIndex, setEditingDetailIndex] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      productImages: [],
      category: "",
      price: 0,
      points: 0,
      taxStatus: "vatable",
      vat: "",
      productDetails: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "productDetails",
  });

  // Watch values for conditional rendering and validaton
  const watchedTaxStatus = watch("taxStatus");
  const watchedProductName = watch("productName");
  const watchedImages = watch("productImages");

  const {
    data: singleProduct,
    isPending: isProductPending,
    isError: isProductError,
  } = useQuery({
    queryKey: ["product", params.productid],
    queryFn: async () => {
      const { productid } = params;
      const res = await axiosInstance.get(`/product/get-product/${productid}`);
      return res.data;
    },
    enabled: !!params.productid,
  });

  useEffect(() => {
    if (singleProduct) {
      reset({
        productName: singleProduct.productName || "",
        productDescription: singleProduct.productDescription || "",
        price: singleProduct.price || 0,
        category: singleProduct.category?._id || "",
        points: singleProduct.points || 0,
        taxStatus: singleProduct.taxStatus || "vatable",
        vat: singleProduct.vat?._id || "",
        productDetails: singleProduct.productDetails || [],
        productImages: singleProduct.productImages || [],
      });
    }
  }, [singleProduct, reset]);

  const {
    data: categories,
    isPending: isCategoryPending,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Fetching with a high limit to get all categories for the dropdown
      const res = await axiosInstance.get(`/category/get-categories?limit=100`);
      return res.data;
    },
  });

  const categoriesData = categories?.categories || [];

  const { data: vatOptions = [] } = useQuery({
    queryKey: ["vat"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/vat/get-vat`);
      return res.data;
    },
  });

  const { data: pointsOptions = [] } = useQuery({
    queryKey: ["points"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/points/get-points`);
      return res.data;
    },
  });

  const { mutate: editProductMutation } = useMutation({
    mutationFn: async (data) => {
      const { productid } = params;
      const res = await axiosInstance.put(
        `/product/edit-product/${productid}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      queryClient.invalidateQueries({
        queryKey: ["product", params.productid],
      });
      // Reset logic handled by navigation or query invalidation
      toast.success("Successfully edited");
      navigate(`/admin/products`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "_" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {
          // Progress can be logged but we'll stick to a general "Uploading..." toast
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };

  const onSubmit = async (data) => {
    if (files.length === 0 && data.productImages.length === 0) {
      return toast.error("Please add at least one image");
    }

    setIsUploading(true);
    let finalUrls = [...data.productImages];

    try {
      if (files.length > 0) {
        const uploadToast = toast.loading("Uploading new images...");
        const promises = files.map((file) => storeImage(file));
        const newUrls = await Promise.all(promises);

        // Filter out any blob preview URLs if present (should correspond to index of new files in UI logic but here we trust data.productImages has valid existing URLs + maybe blobs?)
        // Actually, logic: data.productImages contains existing URLs + Blobs for new files
        // We separate them: keep http, replace blob with newUrl?
        // Simpler approach:
        // Use `data.productImages` to find kept existing images.
        // Use `newUrls` for the newly uploaded ones.

        // However, `AdminUploadProductImage` updates `productImages` with blobs for new files.
        // So `data.productImages` has: ["http://...", "blob://..."]
        // We need to replace the blobs with the `newUrls` in the correct order OR just append newUrls to existing http urls.
        // Order matters if user re-arranged? AdminUploadProductImage doesn't support re-ordering yet, just append/remove.
        // So we can filter only http urls from data.productImages, then append newUrls.

        const existingUrls = data.productImages.filter((url) =>
          url.startsWith("http"),
        );
        finalUrls = [...existingUrls, ...newUrls];

        toast.dismiss(uploadToast);
      } else {
        // If no new files, just ensure we don't send blobs if any
        finalUrls = data.productImages.filter((url) => url.startsWith("http"));
      }

      editProductMutation({
        ...data,
        productImages: finalUrls,
        // Ensure vat is null if taxStatus is exempt
        vat: data.taxStatus === "vatable" ? data.vat : null,
      });
    } catch (error) {
      toast.error("Image upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDetailAction = () => {
    const isDuplicate = fields.some(
      (detail, index) =>
        detail.label === detailLabel && index !== editingDetailIndex,
    );

    if (!detailLabel || !detailValue) {
      toast.error("Both label and value are required.");
    } else if (isDuplicate) {
      toast.error("Label already exists. Please enter a unique label.");
    } else {
      if (editingDetailIndex !== null) {
        update(editingDetailIndex, { label: detailLabel, value: detailValue });
        setEditingDetailIndex(null);
      } else {
        if (fields.length >= 10) {
          return toast.error("Product details must not exceed 10!");
        }
        append({ label: detailLabel, value: detailValue });
      }
      setDetailLabel("");
      setDetailValue("");
    }
  };

  const handleEditDetail = (index) => {
    const detail = fields[index];
    setDetailLabel(detail.label);
    setDetailValue(detail.value);
    setEditingDetailIndex(index);
  };

  // AI Product Description Generator
  const handleGenerateWithAI = async () => {
    if (!watchedProductName || watchedProductName.trim().length < 3) {
      toast.error("Please enter a product name first (at least 3 characters)");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axiosInstance.post(
        "/gemini/generate-product-description",
        {
          productName: watchedProductName.trim(),
        },
      );

      if (response.data.success) {
        // Auto-fill description
        setValue("productDescription", response.data.description, {
          shouldValidate: true,
        });

        // Auto-fill product details
        setValue("productDetails", response.data.details);

        toast.success("AI generated content successfully!");
      } else {
        toast.error(response.data.message || "Failed to generate content");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to generate content. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isCategoryPending || isProductPending) {
    return <p>Loading...</p>;
  }

  if (isCategoryError || isProductError) {
    return <p>Error loading product data.</p>;
  }

  return (
    <section className="bg-yellow min-h-screen text-sm md:text-normal font-main pb-20">
      <AdminHeader title={"EDIT PRODUCT"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex gap-6 flex-col-reverse lg:flex-row"
        >
          <div className="flex-1 flex flex-col gap-6 ">
            {/* MAIN FORM CONTAINER */}
            <div className="border border-black rounded-[5px] bg-card p-6 ">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="font-black uppercase tracking-widest ">
                    PRODUCT NAME:
                  </h1>
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={
                      isGenerating ||
                      !watchedProductName ||
                      watchedProductName.trim().length < 3
                    }
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center gap-2 px-4 py-2 rounded-[5px] border border-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] group"
                  >
                    {isGenerating ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <SiGooglegemini
                        size={16}
                        className="group-hover:animate-pulse"
                      />
                    )}
                    {isGenerating ? "Generating..." : "Generate with AI"}
                  </button>
                </div>

                <ValidatedInput
                  id="productName"
                  {...register("productName")}
                  error={errors.productName}
                  className="text-lg font-bold"
                  placeholder="Enter product name"
                  required
                  maxLength={50}
                />
                <p className="text-[11px] pt-2  uppercase tracking-tight">
                  (Product name must be 5-50 characters. Double spaces are not
                  allowed)
                </p>
              </div>

              <div className="mb-6">
                <div className="flex flex-col mb-3">
                  <h1 className="font-black uppercase tracking-widest ">
                    DESCRIPTION:
                  </h1>
                  <p className="text-[11px]  uppercase tracking-tight">
                    (Product description should max 200 characters, no double
                    spaces, uppercase letters allowed.)
                  </p>
                </div>
                <ValidatedInput
                  type="textarea"
                  id="productDescription"
                  {...register("productDescription")}
                  error={errors.productDescription}
                  className="h-[120px] leading-relaxed"
                  placeholder="Enter product description"
                  required
                  maxLength={200}
                />
              </div>

              <div className="mb-6">
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-600"
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
                    <div className="ml-3">
                      <p className="text-xs text-red-700 uppercase font-black tracking-wider">
                        <strong>Important:</strong> Always include COLOR in
                        label and value for filtering purposes. example: LABEL:
                        color VALUE: yellow
                      </p>
                    </div>
                  </div>
                </div>

                <h1 className="font-black uppercase tracking-widest  mb-4">
                  PRODUCT DETAILS:
                </h1>

                <div className="flex flex-col gap-6">
                  <div className="flex md:items-end flex-col md:flex-row gap-4">
                    <div className="flex flex-1 gap-4">
                      <div className="flex flex-col flex-1">
                        <label
                          htmlFor="label"
                          className="text-[10px] font-black  uppercase tracking-widest mb-1 pl-1"
                        >
                          LABEL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Color"
                          value={detailLabel}
                          maxLength={40}
                          onChange={(e) => setDetailLabel(e.target.value)}
                          className="w-full px-3 py-2 border border-black outline-none rounded-[5px] focus:ring-0"
                        />
                      </div>
                      <div className="flex flex-col flex-1">
                        <label
                          htmlFor="value"
                          className="text-[10px] font-black  uppercase tracking-widest mb-1 pl-1"
                        >
                          VALUE
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Red"
                          value={detailValue}
                          maxLength={40}
                          onChange={(e) => setDetailValue(e.target.value)}
                          className="w-full px-3 py-2 border border-black outline-none rounded-[5px] focus:ring-0"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDetailAction}
                      className="bg-[#22c55e] text-white border border-black px-6 py-2 rounded-[5px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-w-[140px]"
                    >
                      {editingDetailIndex !== null ? "Update" : "Add Detail"}
                      <IoIosAdd size={20} />
                    </button>
                    {editingDetailIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDetailIndex(null);
                          setDetailLabel("");
                          setDetailValue("");
                        }}
                        className="bg-gray-200 text-black border border-black px-4 py-2 rounded-[5px] font-bold uppercase text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* DETAILS LIST */}
                  <div className="overflow-y-auto max-h-[281px]">
                    <ul className="flex flex-col gap-3">
                      {fields.map((item, index) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between bg-white rounded-[5px] p-3 border border-black"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black  uppercase tracking-tighter">
                              {item.label}
                            </span>
                            <span className="font-bold ">{item.value}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditDetail(index)}
                              type="button"
                              className="w-8 h-8 flex items-center justify-center bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              <FiEdit3 size={16} />
                            </button>
                            <button
                              onClick={() => remove(index)}
                              type="button"
                              className="w-8 h-8 flex items-center justify-center bg-[#ef4444] text-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              <HiTrash size={18} />
                            </button>
                          </div>
                        </li>
                      ))}
                      {fields.length === 0 && (
                        <p className="text-center text-gray-400 text-xs italic py-4">
                          No product details found.
                        </p>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* SECONDARY SETTINGS CONTAINER */}
            <div className="border border-black rounded-[5px] bg-card p-6 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col">
                  <label
                    htmlFor="price"
                    className="text-[10px] font-black  uppercase tracking-widest mb-2 pl-1"
                  >
                    Price
                  </label>
                  <input
                    type="number"
                    className="p-3 rounded-[5px] border border-black outline-none bg-white font-bold"
                    id="price"
                    min={0}
                    max={1000000}
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="points"
                    className="text-[10px] font-black  uppercase tracking-widest mb-2 pl-1"
                  >
                    Points (OPTIONAL)
                  </label>
                  <select
                    className="p-3 rounded-[5px] border border-black outline-none bg-white font-bold"
                    id="points"
                    {...register("points")}
                  >
                    <option value="0">No Points</option>
                    {pointsOptions
                      .filter((p) => p.pointsValue > 0)
                      .map((opt) => (
                        <option key={opt._id} value={opt.pointsValue}>
                          {opt.pointsValue} Points
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label
                    htmlFor="category"
                    className="text-[10px] font-black  uppercase tracking-widest mb-2 pl-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    className={`p-3 rounded-[5px] border border-black outline-none bg-white font-bold ${errors.category ? "border-red-500" : ""}`}
                    {...register("category")}
                  >
                    <option value="">Select Category</option>
                    {categoriesData.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="taxStatus"
                    className="text-[10px] font-black  uppercase tracking-widest mb-2 pl-1"
                  >
                    TAX STATUS
                  </label>
                  <select
                    id="taxStatus"
                    className="p-3 rounded-[5px] border border-black outline-none bg-white font-bold"
                    {...register("taxStatus")}
                  >
                    <option value="vatable">Vatable</option>
                    <option value="exempt">Tax Exempt</option>
                  </select>
                </div>

                {watchedTaxStatus === "vatable" && (
                  <div className="flex flex-col">
                    <label
                      htmlFor="vat"
                      className="text-[10px] font-black  uppercase tracking-widest mb-2 pl-1"
                    >
                      VAT RATE *
                    </label>
                    <select
                      id="vat"
                      className={`p-3 rounded-[5px] border border-black outline-none bg-white font-bold ${errors.vat ? "border-red-500" : ""}`}
                      {...register("vat")}
                    >
                      <option value="">Select Rate</option>
                      {vatOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                          {option.vatPercent}% VAT
                        </option>
                      ))}
                    </select>
                    {errors.vat && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                        {errors.vat.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <button
                disabled={isUploading || isGenerating}
                className="flex-1 bg-[#22c55e] text-white p-4 flex justify-between items-center rounded-[5px] border border-black font-black uppercase tracking-[0.1em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all active:scale-95 disabled:opacity-50"
              >
                {isUploading ? "UPDATING..." : "UPDATE THIS PRODUCT"}
                <FaCheckCircle size={20} />
              </button>
              <button
                onClick={() => navigate(`/admin/products`)}
                type="button"
                className="bg-[#ef4444] text-white p-4 md:w-[30%] border border-black rounded-[5px] font-black uppercase tracking-[0.1em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* COLUMN 2 - IMAGE UPLOAD */}
          <div className="lg:w-[320px]">
            {/* Wrapper to bridge simple state with RHF */}
            <AdminUploadProductImage
              images={watchedImages}
              setImages={(newImages) => {
                // If newImages is a function (React state updater pattern), call it with current value
                const updated =
                  typeof newImages === "function"
                    ? newImages(watchedImages)
                    : newImages;
                setValue("productImages", updated, { shouldValidate: true });
              }}
              files={files}
              setFiles={setFiles}
            />
            {errors.productImages && (
              <p className="text-red-500 text-[10px] font-bold mt-2 text-center uppercase">
                {errors.productImages.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
