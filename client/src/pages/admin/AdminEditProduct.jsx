import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminUploadProductImage from "../../components/admin/AdminUploadProductImage";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import Buttons from "../../reusable/Buttons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminEditProducts() {
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);

  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const [discount, setDiscount] = useState(0);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productsDetailsArray, setProductsDetailsArray] = useState([]);
  const [filters, setFilters] = useState({});
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditIndex, setCurrentIndex] = useState(null);


  const {
    data: singleProduct,
    isPending: isProductPending,
    isError: isProductError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { editProductId } = params;
      const res = await axiosInstance.get(
        `/product/get-product/${editProductId}`
      );
      return res.data;
    },
    enabled: !!params.editProductId,
  });


  useEffect(() => {
    if (singleProduct) {
      setFilters(singleProduct.filters);
      setProductName(singleProduct.productName || "");
      setProductDescription(singleProduct.productDescription || "");
      setPrice(singleProduct.price || 0);
      setDiscount(singleProduct.discount || 0);
      setCategory(singleProduct.category || "");
      setSupplier(singleProduct.supplier || "");
      setProductsDetailsArray(singleProduct.productDetails || []);
      setImages(singleProduct.productImages || []);
    }
  }, [singleProduct]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["filters"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/filter/get-filters`);
      return res.data;
    },
  });

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
    data: suppliers = [],
    isPending: isSuppliersPending,
    isError: isSuppliersError,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/supplier/get-suppliers`);
      return res.data;
    },
  });

  const {
    mutate: editProductMutation,
  } = useMutation({
    mutationFn: async (data) => {
      const { editProductId } = params;
      const res = await axiosInstance.put(
        `/product/edit-product/${editProductId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["products"] });

      setProductDescription("");
      setProductName("");
      setProductsDetailsArray([]);
      setImages([]);
      setCategory("")
      setSupplier("")
      setPrice(0)
      setDiscount(0);
      navigate(`/admin/products`)
      toast.success("Successfully edited");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  // const {mutate: addDraftProductMutation} = useMutation({
  //   mutationFn: async (data) => {
  //     const res = await axiosInstance.post(`/product/add-draft`, data)
  //     return res.data 
  //   }, 
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({queryKey: ["products"]})
  //     setProductDescription("");
  //     setProductName("");
  //     setProductsDetailsArray([]);
  //     setImages([]);
  //     setDiscount(0);
  //     toast.success("Saved As Draft");
  //   },
  //   onError: (err) => {
  //     toast.error(err.response.data.message || "Something went wrong");
  //   },
  // })

  // const handleFormDraftSubmit = () => {

  //   addDraftProductMutation({
  //     productName,
  //     price,
  //     productDescription,
  //     productDetails: productsDetailsArray,
  //     discount,
  //     productImages: images,
  //     filters,
  //     category: category,
  //     supplier: supplier
  //   });

  // }



  const handleFormSubmit = (e) => {
    e.preventDefault();

    editProductMutation({
      productName,
      price,
      productDescription,
      productDetails: productsDetailsArray,
      discount,
      productImages: images,
      filters,
      category: category,
      supplier: supplier,
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

  if (
    isPending ||
    isCategoryPending ||
    isSuppliersPending ||
    isProductPending 
  ) {
    return <p>awdwad</p>;
  }

  if (
    isError ||
    isCategoryError ||
    isSuppliersError ||
    isProductError 
  ) {
    return <p>awdwad</p>;
  }

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"ADD NEW PRODUCTS"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleFormSubmit}
          className="flex gap-2 flex-col-reverse md:flex-row "
        >
          <div className="flex-1 p-2 flex flex-col gap-3 ">
            <div className="border flex-1 pb-5  border-black rounded-[5px] bg-card p-4">
              <div className="mb-3">
                <h1 className="mb-3">PRODUCT NAME: </h1>
                <input
                  type="text"
                  name="productName"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="border border-black w-full rounded-[5px] p-2 h-[50p] outline-none"
                />
              </div>

              <div className="mb-3">
                <h1 className="mb-3">DESCRIPTION: </h1>
                <textarea
                  className="border border-black w-full p-2 h-[100px] resize-none outline-none rounded-[5px]"
                  name="productDescription"
                  id="productDescription"
                  onChange={(e) => setProductDescription(e.target.value)}
                  value={productDescription}
                ></textarea>
              </div>

              <div className="mb-3">
                <h1 className="mb-3">PRODUCT DETAILS: </h1>

                <div className=" flex flex-col gap-5 ">
                  <div className="flex md:items-center flex-col md:flex-row md:justify-between gap-5 ">
                    <div className="flex flex-col md:flex-row gap-2  md:gap-5">
                      <label htmlFor="label">LABEL</label>
                      <input
                        type="text"
                        placeholder="label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-[100px] px-2 border border-black rounded-[5px]"
                      />
                      <label htmlFor="value">VALUE</label>
                      <input
                        type="text"
                        placeholder="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-[100px] px-2 border border-black rounded-[5px]"
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
              <div className="flex flex-col md:flex-row gap-2">
                {/* <div className="flex flex-col flex-1">
                  <label htmlFor="stocks" className="pb-2">
                    Stocks
                  </label>
                  <input
                    type="number"
                    className="p-2 rounded-[5px] border border-black outline-none"
                    name="stocks"
                    id="stocks"
                    value={stocks}
                    onChange={(e) => setStocks(e.target.value)}
                  />
                </div> */}
                <div className="flex flex-col flex-1">
                  <label htmlFor="price" className="pb-2">
                    price
                  </label>
                  <input
                    type="number"
                    className="p-2 rounded-[5px] border border-black outline-none"
                    name="price"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label htmlFor="discount" className="pb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    className="p-2 rounded-[5px] border border-black outline-none"
                    name="discount"
                    id="discount"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <div className="flex flex-col flex-1">
                  <label htmlFor="discountType" className="pb-2">
                    Discount type
                  </label>
                  <select
                    disabled
                    className="p-2 rounded-[5px] border border-black outline-none"
                    name="discountType"
                    id="discountType"
                  >
                    <option value="chineseNewYear">None</option>
                    <option value="chineseNewYear">Chinese New Year</option>
                    <option value="christmas">Christmas</option>
                    <option value="mothersDay">mothers day</option>
                    <option value="holloween">holloween</option>
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

                <div className="flex flex-col">
                  <h1 className="py-2">Suppliers</h1>
                  <select
                    name="supplier"
                    id="supplier"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="-2 rounded-[5px] py-2 border border-black outline-none"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.length > 0 &&
                      suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.supplierName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col border-t-gray-400 border border-r-0 border-l-0 border-b-0 pt-4 my-2 gap-2">
                <h1 className="py-2">FILTERS</h1>

                <div className="flex gap-2 flex-wrap">
                  {data &&
                    data.map((item) => (
                      <div key={item.id} className="flex-1 flex flex-col">
                        <label className="pb-2" htmlFor={item.filterName}>
                          {item.filterName}
                        </label>
                        <select
                          className="p-2 rounded-[5px] border border-black outline-none"
                          name={item.filterName}
                          id={item.filterName}
                 
                          onChange={(e) =>
                            setFilters((prevFilters) => ({
                              ...prevFilters, // Keep existing filters intact
                              [item.filterName]: e.target.value, // Update the current filter value
                            }))
                          }
                        >
                          <option value={value}>
                            select {item.filterName}
                          </option>
                          {Array.isArray(item.filterValue) &&
                            item.filterValue.map((value, index) => (
                              <option key={`${item.id}-${index}`} value={value}>
                                {value}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {/* <div
                onClick={() => handleFormDraftSubmit()}
                className="w-[100px] md:w-[200px]"
              >
                <Buttons buttonType={"button"} buttonName={"draft"} icon={<IoArchive />} />
              </div> */}

              <button className="flex-1 py-2 flex justify-between items-center rounded-[5px] px-4 border border-black bg-primary text-card">
                UPDATE THIS PRODUCT
                <FaCheckCircle />
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
