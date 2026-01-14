import AdminHeader from "../../reusable/Admin/AdminHeader";
import {
  createProductSchema,
  productNameSchema,
  productDescriptionSchema,
} from "../../schemas/product.schema";
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
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { SiGooglegemini } from "react-icons/si";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../../firebase/firebase";

export default function AdminEditProducts() {
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productsDetailsArray, setProductsDetailsArray] = useState([]);
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [points, setPoints] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditIndex, setCurrentIndex] = useState(null);
  const [taxStatus, setTaxStatus] = useState("vatable");
  const [vat, setVat] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState([]); // Raw files for upload
  const [isUploading, setIsUploading] = useState(false);

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
      setProductName(singleProduct?.productName || "");
      setProductDescription(singleProduct?.productDescription || "");
      setPrice(singleProduct?.price || 0);

      setCategory(singleProduct?.category?._id || "");
      // setSupplier(singleProduct.supplier || "");
      setProductsDetailsArray(singleProduct?.productDetails || []);
      setImages(singleProduct?.productImages || []);
      setPoints(singleProduct?.points);
      setTaxStatus(singleProduct?.taxStatus || "vatable");
      setVat(singleProduct?.vat?._id || "");
    }
  }, [singleProduct]);

  const {
    data: categories = [],
    isPending: isCategoryPending,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/category/get-categories`);
      return res.data;
    },
  });

  const { data: vatOptions = [] } = useQuery({
    queryKey: ["vat"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/vat/get-vat`);
      return res.data;
    },
  });

  const { mutate: editProductMutation } = useMutation({
    mutationFn: async (data) => {
      const { productid } = params;
      const res = await axiosInstance.put(
        `/product/edit-product/${productid}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      setProductDescription("");
      setProductName("");
      setProductsDetailsArray([]);
      setImages([]);
      setCategory("");
      // setSupplier("");
      setPrice(0);

      toast.success("Successfully edited");
      navigate(`/admin/products`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
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
        }
      );
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation first
    const baseData = {
      productName,
      price,
      productDescription,
      productDetails: productsDetailsArray,
      productImages: images, // Existing URLs
      category: category,
      points,
      taxStatus,
      vat: taxStatus === "vatable" ? vat : null,
    };

    const result = createProductSchema.safeParse(baseData);

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    if (files.length === 0 && images.length === 0) {
      return toast.error("Please add at least one image");
    }

    setIsUploading(true);
    let finalUrls = [...images]; // Start with existing/remaining images

    try {
      if (files.length > 0) {
        const uploadToast = toast.loading("Uploading new images...");
        const promises = files.map((file) => storeImage(file));
        const newUrls = await Promise.all(promises);
        // Special case: In Edit mode, 'images' might already contain preview blobs
        // if AdminUploadProductImage pushes them via setImages.
        // We need to filter out blobs and use real Firebase URLs.

        // Actually, the current AdminUploadProductImage pushes blobs to 'images' for preview.
        // On Save, we should only keep the original URLs and add the new Firebase URLs.
        const originalUrls = images.filter((url) => url.startsWith("http"));
        finalUrls = [...originalUrls, ...newUrls];

        toast.dismiss(uploadToast);
      }

      // Ensure we only save real URLs, never blobs
      const sanitizedUrls = finalUrls.filter((url) => url.startsWith("http"));

      editProductMutation({
        ...result.data,
        productImages: sanitizedUrls,
      });
    } catch (error) {
      toast.error("Image upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitLabelValueObject = () => {
    const isDuplicate = productsDetailsArray.some(
      (detail, index) => detail.label === label && index !== currentEditIndex
    );

    if (!label || !value) {
      toast.error("Both label and value are required.");
    } else if (isDuplicate) {
      toast.error("Label already exists. Please enter a unique label.");
    } else {
      if (isEditing) {
        handleUpdateLabelValue();
      } else {
        handleAddProductLabelValue();
      }

      setLabel("");
      setValue("");
    }
  };

  const handleAddProductLabelValue = () => {
    setProductsDetailsArray((prevDetails) => [
      ...prevDetails,
      { label: label, value: value },
    ]);

    if (productsDetailsArray.length > 10) {
      return toast.error("Product details must not exceed to 10!");
    }

    setLabel("");
    setValue("");
  };

  const handleUpdateLabelValue = () => {
    const updateDetails = productsDetailsArray.map((item, index) =>
      index === currentEditIndex ? { label, value } : item
    );

    setProductsDetailsArray(updateDetails);
    setIsEditing(false);
    setCurrentIndex(null);
  };

  const handleEditLabelValue = (index) => {
    setIsEditing(true);
    setCurrentIndex(index);
    setLabel(productsDetailsArray[index].label); // Load the label and value into the inputs
    setValue(productsDetailsArray[index].value);
  };

  // AI Product Description Generator
  const handleGenerateWithAI = async () => {
    if (!productName || productName.trim().length < 3) {
      toast.error("Please enter a product name first (at least 3 characters)");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axiosInstance.post(
        "/gemini/generate-product-description",
        {
          productName: productName.trim(),
        }
      );

      if (response.data.success) {
        // Auto-fill description
        setProductDescription(response.data.description);

        // Auto-fill product details
        setProductsDetailsArray(response.data.details);

        toast.success("AI generated content successfully!");
      } else {
        toast.error(response.data.message || "Failed to generate content");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to generate content. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveLabelValue = (index) => {
    setProductsDetailsArray((prev) => prev.filter((_, i) => i !== index));
  };

  if (isCategoryPending || isProductPending) {
    return <p>awdwad</p>;
  }

  if (isCategoryError || isProductError) {
    return <p>awdwad</p>;
  }

  return (
    <section className="bg-yellow min-h-screen text-sm md:text-normal font-main pb-20">
      <AdminHeader title={"EDIT PRODUCT"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleFormSubmit}
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
                      !productName ||
                      productName.trim().length < 3
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
                  name="productName"
                  value={productName}
                  onChange={handleInputChange(setProductName)}
                  schema={productNameSchema}
                  className="text-lg font-bold"
                  placeholder="Enter product name"
                  required
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
                  name="productDescription"
                  value={productDescription}
                  onChange={handleInputChange(setProductDescription)}
                  schema={productDescriptionSchema}
                  className="h-[120px] leading-relaxed"
                  placeholder="Enter product description"
                  required
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
                          value={label}
                          maxLength={40}
                          onChange={handleInputChange(setLabel)}
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
                          value={value}
                          maxLength={40}
                          onChange={handleInputChange(setValue)}
                          className="w-full px-3 py-2 border border-black outline-none rounded-[5px] focus:ring-0"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitLabelValueObject}
                      className="bg-[#22c55e] text-white border border-black px-6 py-2 rounded-[5px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-w-[140px]"
                    >
                      {isEditing ? "Update" : "Add Detail"}
                      <IoIosAdd size={20} />
                    </button>
                  </div>

                  {/* DETAILS LIST */}
                  <div className="overflow-y-auto max-h-[281px]">
                    <ul className="flex flex-col gap-3">
                      {productsDetailsArray.map((item, index) => (
                        <li
                          key={index}
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
                              onClick={() => handleEditLabelValue(index)}
                              type="button"
                              className="w-8 h-8 flex items-center justify-center bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              <FiEdit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveLabelValue(index)}
                              type="button"
                              className="w-8 h-8 flex items-center justify-center bg-[#ef4444] text-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              <HiTrash size={18} />
                            </button>
                          </div>
                        </li>
                      ))}
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
                    name="price"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
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
                    name="points"
                    id="points"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                  >
                    <option value="0">No Points</option>
                    <option value="10">10 Points</option>
                    <option value="15">15 Points</option>
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
                    name="category"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-3 rounded-[5px] border border-black outline-none bg-white font-bold"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="taxStatus"
                    className="text-[10px] font-black  uppercase tracking-widest mb-2 pl-1"
                  >
                    TAX STATUS
                  </label>
                  <select
                    name="taxStatus"
                    id="taxStatus"
                    value={taxStatus}
                    onChange={(e) => setTaxStatus(e.target.value)}
                    className="p-3 rounded-[5px] border border-black outline-none bg-white font-bold"
                  >
                    <option value="vatable">Vatable</option>
                    <option value="exempt">Tax Exempt</option>
                  </select>
                </div>

                {taxStatus === "vatable" && (
                  <div className="flex flex-col">
                    <label
                      htmlFor="vat"
                      className="text-[10px] font-black  uppercase tracking-widest mb-2 pl-1"
                    >
                      VAT RATE *
                    </label>
                    <select
                      name="vat"
                      id="vat"
                      value={vat}
                      onChange={(e) => setVat(e.target.value)}
                      className="p-3 rounded-[5px] border border-black outline-none bg-white font-bold"
                      required
                    >
                      <option value="">Select Rate</option>
                      {vatOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                          {option.vatPercent}% VAT
                        </option>
                      ))}
                    </select>
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
            <AdminUploadProductImage
              images={images}
              setImages={setImages}
              files={files}
              setFiles={setFiles}
            />
          </div>
        </form>
      </div>
    </section>
  );
}
