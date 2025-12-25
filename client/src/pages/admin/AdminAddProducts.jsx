import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminUploadProductImage from "../../components/admin/AdminUploadProductImage";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaCheckCircle } from "react-icons/fa";
// import { IoArchive } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { SiGooglegemini } from "react-icons/si";
import Buttons from "../../reusable/Buttons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { useNavigate } from "react-router-dom";

export default function AdminAddProducts() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productsDetailsArray, setProductsDetailsArray] = useState([]);
  const [category, setCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditIndex, setCurrentIndex] = useState(null);
  const [points, setPoints] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taxStatus, setTaxStatus] = useState("vatable");
  const [vat, setVat] = useState("");

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

  const {
    data: vatOptions = [],
    isPending: isVatPending,
    isError: isVatError,
  } = useQuery({
    queryKey: ["vat"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/vat/get-vat`);
      return res.data;
    },
  });

  const { mutate: addProductMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/product/add-product`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      setProductDescription("");
      setProductName("");
      setProductsDetailsArray([]);
      setImages([]);
      setTaxStatus("vatable");
      setVat("");

      toast.success("Product Submitted");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    addProductMutation({
      productName,

      productDescription,
      productDetails: productsDetailsArray,

      productImages: images,
      // filters,
      category: category,
      points,
      taxStatus,
      vat: taxStatus === "vatable" ? vat : null,
      // supplier: supplier,
    });
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

  const handleRemoveLabelValue = (index) => {
    setProductsDetailsArray((prev) => prev.filter((_, i) => i !== index));
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

  if (isCategoryPending) {
    return <p>Loading...</p>;
  }

  if (isCategoryError) {
    return <p>Error.</p>;
  }

  return (
    <section className="bg-yellow h-screen text-sm md:text-normal font-main">
      <AdminHeader title={"ADD NEW PRODUCTS"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleFormSubmit}
          className="flex gap-2 flex-col-reverse md:flex-row "
        >
          <div className="flex-1 p-2 flex flex-col gap-3 ">
            <div className="border flex-1 pb-5  border-black rounded-[5px] bg-card p-4">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-3">
                  <h1>PRODUCT NAME: </h1>
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={
                      isGenerating ||
                      !productName ||
                      productName.trim().length < 3
                    }
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-card rounded-[5px] border border-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    {isGenerating ? (
                      <div className="animate-spin h-4 w-4 border-2 border-card border-t-transparent rounded-full" />
                    ) : (
                      <SiGooglegemini size={16} />
                    )}
                    {isGenerating ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
                <input
                  type="text"
                  name="productName"
                  id="productName"
                  value={productName}
                  maxLength={50}
                  onChange={handleInputChange(setProductName)}
                  className="border border-black w-full rounded-[5px] p-2 h-[50p] outline-none"
                />
                <p className="text-sm pt-1  text-green-700">
                  (Product name must be 5-50 characters. Double spaces are not
                  allowed)
                </p>
              </div>

              <div className="mb-3">
                <div className="flex flex-col md:flex-row md:gap-2">
                  <h1 className="mb-3">DESCRIPTION: </h1>
                  <p className="text-sm pt-1  text-green-700">
                    (Product description should max 200 characters, no double
                    spaces, uppercase letters allowed.)
                  </p>
                </div>
                <textarea
                  className="border border-black w-full p-2 h-[100px] resize-none outline-none rounded-[5px]"
                  name="productDescription"
                  id="productDescription"
                  onChange={handleInputChange(setProductDescription)}
                  value={productDescription}
                  maxLength={200}
                ></textarea>
              </div>

              <div className="mb-3">
                <div className="bg-yellow-50 border-l-4 border-red-700 text-red-700 p-4 mb-6">
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
                        <strong>Important:</strong> Always include COLOR in
                        label and value for filtering purposes. example: LABEL:
                        color VALUE: yellow
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:gap-2 md:flex-row">
                  <h1 className="mb-3">PRODUCT DETAILS: </h1>
                </div>
                <div className=" flex flex-col gap-5 pt-4 md:pt-0 ">
                  <div className="flex md:items-center flex-col md:flex-row md:justify-between gap-5 ">
                    <div className="flex flex-col md:flex-row gap-2  md:gap-5">
                      <label htmlFor="label">LABEL</label>
                      <input
                        type="text"
                        placeholder="label"
                        value={label}
                        maxLength={40}
                        onChange={handleInputChange(setLabel)}
                        className="w-[100px] px-2 border border-black outline-none rounded-[5px]"
                      />
                      <label htmlFor="value">VALUE</label>
                      <input
                        type="text"
                        placeholder="value"
                        value={value}
                        maxLength={40}
                        onChange={handleInputChange(setValue)}
                        className="w-[100px] px-2 border border-black outline-none rounded-[5px]"
                      />
                    </div>
                    <div
                      onClick={handleSubmitLabelValueObject}
                      className="w-full md:w-[170px]"
                    >
                      <Buttons
                        buttonName={`${isEditing ? "update" : "add details"}`}
                        icon={<IoIosAdd size={25} />}
                      />
                    </div>
                  </div>

                  {/* DETAILS GOES HERE */}
                  <div className="overflow-y-auto max-h-[281px]">
                    <ul className="flex flex-col gap-4  ">
                      {productsDetailsArray.length > 0 &&
                        productsDetailsArray.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center overflow-x-auto gap-2 justify-between bg-white rounded-[5px] p-2 border-black border"
                          >
                            <div className="flex gap-5">
                              <p className="text-sm">{item.label}</p>
                              {":"}
                              <p className="text-sm">{item.value}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditLabelValue(index)}
                                type="button"
                                className=" text-green-600 hover:text-indigo-300 mr-2"
                              >
                                <CiEdit size={25} />
                              </button>
                              <button
                                onClick={() => handleRemoveLabelValue(index)}
                                type="button"
                                className=" text-red-600"
                              >
                                <MdDelete size={25} />
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="border flex flex-col gap-2 border-black rounded-[5px] uppercase bg-card p-4">
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <div className="flex flex-col flex-1">
                  <label htmlFor="points" className="pb-2">
                    Points (OPTIONAL)
                  </label>
                  <select
                    className="p-2 rounded-[5px] border border-black outline-none"
                    name="points"
                    id="points"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                  >
                    <option>Select Points</option>
                    <option value="10">10 Points</option>
                    <option value="15">15 Points</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col border-t-gray-400 border border-r-0 border-l-0 border-b-0 pt-4 my-2 gap-2">
                <div className="flex flex-col">
                  <h1 className="py-2">Categories</h1>
                  <select
                    name="category"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="-2 rounded-[5px] py-2 border border-black outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.length > 0 &&
                      categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col pt-4">
                  <h1 className="py-2">TAX STATUS</h1>
                  <select
                    name="taxStatus"
                    id="taxStatus"
                    value={taxStatus}
                    onChange={(e) => setTaxStatus(e.target.value)}
                    className="p-2 rounded-[5px] border border-black outline-none"
                  >
                    <option value="vatable">Vatable</option>
                    <option value="exempt">Tax Exempt</option>
                  </select>
                </div>

                {taxStatus === "vatable" && (
                  <div className="flex flex-col pt-4">
                    <h1 className="py-2">VAT RATE *</h1>
                    <select
                      name="vat"
                      id="vat"
                      value={vat}
                      onChange={(e) => setVat(e.target.value)}
                      className="p-2 rounded-[5px] border border-black outline-none"
                      required
                    >
                      <option value="">Select VAT Rate</option>
                      {vatOptions.length > 0 &&
                        vatOptions.map((option) => (
                          <option key={option._id} value={option._id}>
                            {option.vatPercent}% VAT
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-2">
              <button className="flex-1 p-2 flex justify-between items-center rounded-[5px] px-4 border border-black bg-primary text-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Add This Product
                <FaCheckCircle />
              </button>
              <button
                onClick={() => navigate(`/admin/products`)}
                type="button"
                className="bg-red-600 p-2  md:w-[20%] border border-black rounded-[5px] text-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* COLUMN 2 */}
          <AdminUploadProductImage images={images} setImages={setImages} />
        </form>
      </div>
    </section>
  );
}
