import { forwardRef } from "react";
import { FaExclamationCircle } from "react-icons/fa";

/**
 * ValidatedInput
 *
 * A reusable input component that validates against a Zod schema in real-time.
 */
const ValidatedInput = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      value,
      onChange,
      // schema is no longer needed here as validation is handled by parent form
      placeholder,
      className = "",
      error, // Error object from react-hook-form
      required = false,
      ...props
    },
    ref,
  ) => {
    const errorMessage = error?.message;
    const hasError = !!errorMessage;
    // We can consider it valid if there's no error and the field is dirty/touched (handled by RHF usually, but here we can just check if value exists for visual cue if needed, or rely on RHF formState in parent)
    // For simplicity: Green check if no error and value is present (controlled or uncontrolled)
    // Note: In uncontrolled RHF, 'value' prop might not be passed unless watched.
    // We'll rely on hasError for red state. Green state might need 'isValid' prop if strictly needed, or we just show error state.

    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && (
          <label
            htmlFor={name}
            className="uppercase text-[10px] font-black tracking-widest text-gray-500 flex items-center gap-1"
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={name}
            name={name}
            type={type}
            // Only pass value/onChange if provided (controlled), else let RHF handle
            {...(value !== undefined && { value })}
            {...(onChange && { onChange })}
            placeholder={placeholder}
            className={`w-full outline-none p-3 bg-white border rounded-[5px] transition-all duration-200 ${
              hasError
                ? "border-red-500 focus:ring-1 focus:ring-red-200"
                : "border-[#313031] focus:ring-1 focus:ring-indigo-200"
            }`}
            {...props}
          />

          {/* Icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300">
            {hasError && (
              <FaExclamationCircle className="text-red-500 animate-in shake duration-300" />
            )}
          </div>
        </div>

        {/* Error Message */}
        <div className="min-h-[1.25rem]">
          {hasError && (
            <p className="text-[10px] text-red-600 font-bold uppercase tracking-tighter">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  },
);

ValidatedInput.displayName = "ValidatedInput";

export default ValidatedInput;
