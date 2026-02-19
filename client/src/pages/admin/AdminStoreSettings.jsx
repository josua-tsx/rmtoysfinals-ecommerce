import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSave, FiPlus, FiTrash2, FiSettings } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import Buttons from "../../reusable/Buttons";
import ValidatedInput from "../../reusable/ValidatedInput";
import {
  storeInfoSchema,
  storeNameSchema,
  taglineSchema,
  aboutUsSchema,
  shortTextSchema,
} from "../../schemas/store.schema";
import { emailSchema, phMobileSchema } from "../../schemas/auth.schema";

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

    const result = storeInfoSchema.safeParse(formData);
    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    updateStoreInfo(result.data);
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
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Store Name
              </label>
              <ValidatedInput
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                placeholder="RM Toys"
                schema={storeNameSchema}
                maxLength={100}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Tagline
              </label>
              <ValidatedInput
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Your Trusted Online Toy Store"
                schema={taglineSchema}
                maxLength={150}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
              About Us
            </label>
            <ValidatedInput
              type="textarea"
              name="aboutUs"
              value={formData.aboutUs}
              onChange={handleChange}
              rows={3}
              placeholder="Tell customers about your store..."
              schema={aboutUsSchema}
              maxLength={1000}
            />
          </div>
        </div>

        {/* Owner Info Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            👤 Owner Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Owner Name
              </label>
              <ValidatedInput
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Juan Dela Cruz"
                schema={shortTextSchema}
                maxLength={100}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
              Owner Story
            </label>
            <textarea
              name="ownerStory"
              value={formData.ownerStory}
              onChange={handleChange}
              rows={3}
              className="border border-black w-full rounded-[5px] p-2 outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
              placeholder="Founded RM Toys in 2020 with a passion for bringing joy to children..."
              maxLength={1000}
            />
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            📞 Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Email
              </label>
              <ValidatedInput
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="support@rmtoys.com"
                schema={emailSchema}
                maxLength={254}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Phone
              </label>
              <ValidatedInput
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="0917XXXXXXX"
                schema={phMobileSchema}
                maxLength={11}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Address
              </label>
              <ValidatedInput
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Manila, Philippines"
                schema={shortTextSchema}
                maxLength={100}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Business Hours
              </label>
              <ValidatedInput
                type="text"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleChange}
                placeholder="Mon-Sat, 9AM-6PM"
                schema={shortTextSchema}
                maxLength={100}
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
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Shipping Policy
              </label>
              <textarea
                name="shippingPolicy"
                value={formData.shippingPolicy}
                onChange={handleChange}
                rows={2}
                className="border border-black w-full rounded-[5px] p-2 outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="Free shipping for orders over ₱1,500. Metro Manila: 2-3 days."
                maxLength={1000}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Return Policy
              </label>
              <textarea
                name="returnPolicy"
                value={formData.returnPolicy}
                onChange={handleChange}
                rows={2}
                className="border border-black w-full rounded-[5px] p-2 outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="7-day returns with original receipt and unopened packaging."
                maxLength={1000}
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
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-2 border border-black text-xs font-bold"
              >
                {method}
                <button
                  type="button"
                  onClick={() => removePaymentMethod(index)}
                  className="text-red-500 hover:text-red-700 hover:scale-125 transition-transform"
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
              className="border border-black flex-1 rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors"
              placeholder="Add payment method (e.g., Maya)"
              maxLength={50}
            />
            <Buttons
              buttonName="Add"
              onClick={addPaymentMethod}
              icon={<FiPlus />}
              className="w-fit px-4 py-2"
            />
          </div>
        </div>

        {/* Social Media Section */}
        <div className="border border-black rounded-[5px] p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            🌐 Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Facebook
              </label>
              <input
                type="text"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="facebook.com/rmtoys"
                maxLength={255}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                Instagram
              </label>
              <input
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="@rmtoys"
                maxLength={255}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1 pl-1">
                TikTok
              </label>
              <input
                type="text"
                name="socialMedia.tiktok"
                value={formData.socialMedia.tiktok}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="@rmtoys"
                maxLength={255}
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
                className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-200"
              >
                <span className="flex-1 text-sm font-medium">{rule}</span>
                <button
                  type="button"
                  onClick={() => removeCustomRule(index)}
                  className="text-red-500 hover:text-red-700 hover:scale-125 transition-transform"
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
              className="border border-black flex-1 rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors"
              placeholder="e.g., Always mention our holiday sale - 15% off!"
              maxLength={200}
            />
            <Buttons
              buttonName="Add Rule"
              onClick={addCustomRule}
              icon={<FiPlus />}
              className="w-fit px-4 py-2 bg-blue-500 hover:bg-blue-600"
            />
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
                className="flex items-start gap-2 bg-purple-50 p-3 rounded border border-purple-200"
              >
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-black text-purple-700 uppercase text-[10px]">
                      Trigger:
                    </span>{" "}
                    {`"${item.trigger}"`}
                  </p>
                  <p className="text-sm">
                    <span className="font-black text-purple-700 uppercase text-[10px]">
                      Response:
                    </span>{" "}
                    {`"${item.response}"`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecialResponse(index)}
                  className="text-red-500 hover:text-red-700 hover:scale-125 transition-transform"
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
              className="border border-black rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors"
              placeholder="Trigger phrase (e.g., pinaka magandang babae)"
              maxLength={100}
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
              className="border border-black rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors"
              placeholder="Response (e.g., That would be Girlie Marie! 💕)"
              maxLength={300}
            />
          </div>
          <Buttons
            buttonName="Add Special Response"
            onClick={addSpecialResponse}
            icon={<FiPlus />}
            className="w-fit px-4 py-2 bg-purple-500 hover:bg-purple-600"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Buttons
            buttonType="submit"
            isLoading={isPending}
            loadingText="Saving..."
            buttonName="Save Settings"
            icon={<FiSave />}
            className="flex-1 py-3"
          />
        </div>
      </form>
    </div>
  );
}
