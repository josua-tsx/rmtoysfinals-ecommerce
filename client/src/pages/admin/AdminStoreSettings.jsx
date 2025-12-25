import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSave, FiPlus, FiTrash2, FiSettings } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

/**
 * =============================================================================
 * ADMIN STORE SETTINGS PAGE
 * =============================================================================
 *
 * This page allows admins to configure store information that is injected
 * into the AI chatbot's context. Changes here automatically update what
 * the chatbot knows and can answer about.
 */

export default function AdminStoreSettings() {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    storeName: "",
    tagline: "",
    aboutUs: "",
    ownerName: "",
    ownerStory: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    businessHours: "",
    shippingPolicy: "",
    returnPolicy: "",
    paymentMethods: [],
    customPromptRules: [],
    specialResponses: [],
    socialMedia: {
      facebook: "",
      instagram: "",
      tiktok: "",
    },
  });

  // Temp states for adding new items
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [newCustomRule, setNewCustomRule] = useState("");
  const [newSpecialResponse, setNewSpecialResponse] = useState({
    trigger: "",
    response: "",
  });

  // Fetch current store info
  const { data: storeInfo, isLoading } = useQuery({
    queryKey: ["storeInfo"],
    queryFn: async () => {
      const res = await axiosInstance.get("/store-info");
      return res.data;
    },
  });

  // Populate form when data is fetched
  useEffect(() => {
    if (storeInfo?.data) {
      setFormData({
        storeName: storeInfo.data.storeName || "",
        tagline: storeInfo.data.tagline || "",
        aboutUs: storeInfo.data.aboutUs || "",
        ownerName: storeInfo.data.ownerName || "",
        ownerStory: storeInfo.data.ownerStory || "",
        contactEmail: storeInfo.data.contactEmail || "",
        contactPhone: storeInfo.data.contactPhone || "",
        address: storeInfo.data.address || "",
        businessHours: storeInfo.data.businessHours || "",
        shippingPolicy: storeInfo.data.shippingPolicy || "",
        returnPolicy: storeInfo.data.returnPolicy || "",
        paymentMethods: storeInfo.data.paymentMethods || [],
        customPromptRules: storeInfo.data.customPromptRules || [],
        specialResponses: storeInfo.data.specialResponses || [],
        socialMedia: storeInfo.data.socialMedia || {
          facebook: "",
          instagram: "",
          tiktok: "",
        },
      });
    }
  }, [storeInfo]);

  // Update mutation
  const { mutate: updateStoreInfo, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put("/store-info", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeInfo"] });
      toast.success("Store settings updated! Chatbot will use new info.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update settings");
    },
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialMedia.")) {
      const socialField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    updateStoreInfo(formData);
  };

  // Array handlers
  const addPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      setFormData((prev) => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newPaymentMethod.trim()],
      }));
      setNewPaymentMethod("");
    }
  };

  const removePaymentMethod = (index) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, i) => i !== index),
    }));
  };

  const addCustomRule = () => {
    if (newCustomRule.trim()) {
      setFormData((prev) => ({
        ...prev,
        customPromptRules: [...prev.customPromptRules, newCustomRule.trim()],
      }));
      setNewCustomRule("");
    }
  };

  const removeCustomRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      customPromptRules: prev.customPromptRules.filter((_, i) => i !== index),
    }));
  };

  const addSpecialResponse = () => {
    if (
      newSpecialResponse.trigger.trim() &&
      newSpecialResponse.response.trim()
    ) {
      setFormData((prev) => ({
        ...prev,
        specialResponses: [...prev.specialResponses, { ...newSpecialResponse }],
      }));
      setNewSpecialResponse({ trigger: "", response: "" });
    }
  };

  const removeSpecialResponse = (index) => {
    setFormData((prev) => ({
      ...prev,
      specialResponses: prev.specialResponses.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FiSettings className="text-2xl" />
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
          <RiRobot2Line /> AI Chatbot Context
        </span>
      </div>

      <p className="text-gray-600 mb-6">
        Configure your store information here. These settings are used by the AI
        chatbot to answer customer questions about your store.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            📍 Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="RM Toys"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="Your Trusted Online Toy Store"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">About Us</label>
            <textarea
              name="aboutUs"
              value={formData.aboutUs}
              onChange={handleChange}
              rows={3}
              className="border border-black w-full rounded-[5px] p-2 outline-none resize-none"
              placeholder="Tell customers about your store..."
            />
          </div>
        </div>

        {/* Owner Info Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            👤 Owner Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Owner Name
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="Juan Dela Cruz"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Owner Story
            </label>
            <textarea
              name="ownerStory"
              value={formData.ownerStory}
              onChange={handleChange}
              rows={3}
              className="border border-black w-full rounded-[5px] p-2 outline-none resize-none"
              placeholder="Founded RM Toys in 2020 with a passion for bringing joy to children..."
            />
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            📞 Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="support@rmtoys.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="Manila, Philippines"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Hours
              </label>
              <input
                type="text"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="Mon-Sat, 9AM-6PM"
              />
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            📋 Store Policies
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Shipping Policy
              </label>
              <textarea
                name="shippingPolicy"
                value={formData.shippingPolicy}
                onChange={handleChange}
                rows={2}
                className="border border-black w-full rounded-[5px] p-2 outline-none resize-none"
                placeholder="Free shipping for orders over ₱1,500. Metro Manila: 2-3 days."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Return Policy
              </label>
              <textarea
                name="returnPolicy"
                value={formData.returnPolicy}
                onChange={handleChange}
                rows={2}
                className="border border-black w-full rounded-[5px] p-2 outline-none resize-none"
                placeholder="7-day returns with original receipt and unopened packaging."
              />
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            💳 Payment Methods
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.paymentMethods.map((method, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-2"
              >
                {method}
                <button
                  type="button"
                  onClick={() => removePaymentMethod(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              className="border border-black flex-1 rounded-[5px] p-2 outline-none"
              placeholder="Add payment method (e.g., Maya)"
            />
            <button
              type="button"
              onClick={addPaymentMethod}
              className="px-4 py-2 bg-primary text-white rounded-[5px] flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <FiPlus /> Add
            </button>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            🌐 Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="text"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="facebook.com/rmtoys"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Instagram
              </label>
              <input
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="@rmtoys"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TikTok</label>
              <input
                type="text"
                name="socialMedia.tiktok"
                value={formData.socialMedia.tiktok}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none"
                placeholder="@rmtoys"
              />
            </div>
          </div>
        </div>

        {/* AI Custom Rules Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card border-l-4 border-l-blue-500">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <RiRobot2Line className="text-blue-500" />
            AI Custom Rules
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Add custom instructions for the AI chatbot. These rules will be
            followed in all conversations.
          </p>
          <div className="space-y-2 mb-3">
            {formData.customPromptRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-blue-50 p-2 rounded"
              >
                <span className="flex-1 text-sm">{rule}</span>
                <button
                  type="button"
                  onClick={() => removeCustomRule(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCustomRule}
              onChange={(e) => setNewCustomRule(e.target.value)}
              className="border border-black flex-1 rounded-[5px] p-2 outline-none"
              placeholder="e.g., Always mention our holiday sale - 15% off!"
            />
            <button
              type="button"
              onClick={addCustomRule}
              className="px-4 py-2 bg-blue-500 text-white rounded-[5px] flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <FiPlus /> Add Rule
            </button>
          </div>
        </div>

        {/* Special Responses Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card border-l-4 border-l-purple-500">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <RiRobot2Line className="text-purple-500" />
            Special Responses
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Define trigger words/phrases and custom responses. When a user asks
            about the trigger, the AI will respond with your custom message.
          </p>
          <div className="space-y-2 mb-3">
            {formData.specialResponses.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-purple-50 p-3 rounded"
              >
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>Trigger:</strong> {`"${item.trigger}"`}
                  </p>
                  <p className="text-sm">
                    <strong>Response:</strong> {`"${item.response}"`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecialResponse(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={newSpecialResponse.trigger}
              onChange={(e) =>
                setNewSpecialResponse((prev) => ({
                  ...prev,
                  trigger: e.target.value,
                }))
              }
              className="border border-black rounded-[5px] p-2 outline-none"
              placeholder="Trigger phrase (e.g., pinaka magandang babae)"
            />
            <input
              type="text"
              value={newSpecialResponse.response}
              onChange={(e) =>
                setNewSpecialResponse((prev) => ({
                  ...prev,
                  response: e.target.value,
                }))
              }
              className="border border-black rounded-[5px] p-2 outline-none"
              placeholder="Response (e.g., That would be Girlie Marie! 💕)"
            />
          </div>
          <button
            type="button"
            onClick={addSpecialResponse}
            className="px-4 py-2 bg-purple-500 text-white rounded-[5px] flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <FiPlus /> Add Special Response
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-primary text-white py-3 rounded-[5px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <FiSave />
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
