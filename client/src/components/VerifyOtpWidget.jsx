import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useUserStore } from "../stores/useUserStore";

/**
 * Reusable OTP verification widget.
 *
 * @param {Object} props
 * @param {string} props.identifier - The email or phone number to verify.
 * @param {"email"|"sms"} props.channel - Which channel to send OTP through.
 * @param {boolean} props.isVerified - Whether this identifier is already verified.
 * @param {() => void} props.onVerified - Callback after successful verification.
 * @param {string} [props.className] - Optional wrapper className.
 */
export default function VerifyOtpWidget({
  identifier,
  channel,
  isVerified,
  onVerified,
  className = "",
}) {
  const queryClient = useQueryClient();
  const checkAuth = useUserStore((state) => state.checkAuth);

  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const expiryRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (expiryRef.current) clearInterval(expiryRef.current);
    };
  }, []);

  // Reset OTP state if identifier changes
  useEffect(() => {
    setOtpSent(false);
    setOtpCode("");
    setOtpExpiry(0);
    if (expiryRef.current) clearInterval(expiryRef.current);
  }, [identifier]);

  const startExpiry = useCallback(() => {
    setOtpExpiry(300);
    if (expiryRef.current) clearInterval(expiryRef.current);
    expiryRef.current = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(expiryRef.current);
          setOtpSent(false);
          toast.error("OTP expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Send OTP ──
  const { mutate: sendOtpMutation, isPending: isSending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/otp/send", {
        identifier,
        channel,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        channel === "sms"
          ? "OTP sent to your phone!"
          : "OTP sent to your email!",
      );
      setOtpSent(true);
      setOtpSent(true);
      startExpiry();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to send OTP.");
    },
  });

  // ── Verify OTP ──
  const { mutate: verifyOtpMutation, isPending: isVerifying } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/otp/verify", {
        identifier,
        otp: otpCode,
      });
      return res.data;
    },
    onSuccess: async (data) => {
      // Now confirm identity with the server
      confirmIdentityMutation({ otpToken: data.otpToken });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Invalid OTP.");
    },
  });

  // ── Confirm Identity (sets isEmailVerified / isPhoneVerified) ──
  const { mutate: confirmIdentityMutation, isPending: isConfirming } =
    useMutation({
      mutationFn: async ({ otpToken }) => {
        const res = await axiosInstance.post("/otp/confirm-identity", {
          otpToken,
          channel,
        });
        return res.data;
      },
      onSuccess: (data) => {
        toast.success(data.message);
        setOtpSent(false);
        setOtpCode("");
        if (expiryRef.current) clearInterval(expiryRef.current);
        onVerified?.();
        // Update user state after successful verification
        checkAuth();
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to confirm verification.",
        );
      },
    });

  const handleSend = () => {
    if (!identifier) {
      toast.error(
        channel === "sms"
          ? "Please enter a phone number first."
          : "Please enter an email first.",
      );
      return;
    }
    sendOtpMutation();
  };

  const handleVerify = () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    verifyOtpMutation();
  };

  const isWorking = isSending || isVerifying || isConfirming;

  // Already verified — show badge
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <RiVerifiedBadgeFill className="text-green-600" size={14} />
        Verified
      </span>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Send OTP Button */}
      {!otpSent && (
        <button
          type="button"
          disabled={isSending || !identifier}
          onClick={handleSend}
          className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 border border-black px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSending
            ? "Sending..."
            : `Verify ${channel === "sms" ? "Phone" : "Email"}`}
        </button>
      )}

      {/* OTP Input Section */}
      {otpSent && (
        <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-700">
                Enter verification code
              </span>
              <span className="text-orange-600 font-medium">
                Expires: {Math.floor(otpExpiry / 60)}:
                {String(otpExpiry % 60).padStart(2, "0")}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                placeholder="6-digit code"
                className="flex-1 border border-gray-300 rounded-[5px] p-2 text-center tracking-[0.4em] font-mono text-sm"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={isWorking || otpCode.length < 6}
                className="bg-green-600 text-white px-3 py-1 rounded-[5px] text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isVerifying || isConfirming ? "Verifying..." : "Verify"}
              </button>
            </div>
            {/* Resend */}
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline self-start"
            >
              Resend code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
