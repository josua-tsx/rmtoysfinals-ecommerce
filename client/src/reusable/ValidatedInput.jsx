import { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

/**
 * ValidatedInput
 *
 * A reusable input component that validates against a Zod schema in real-time.
 */
const ValidatedInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  schema, // Zod schema for this specific field (e.g., emailSchema)
  placeholder,
  className = "",
  errorText, // Optional override for error message
  required = false,
  ...props
}) => {
  const [error, setError] = useState("");
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    if (isTouched && schema) {
      const result = schema.safeParse(value);
      if (!result.success) {
        setError(result.error.issues[0].message);
      } else {
        setError("");
      }
    }
  }, [value, isTouched, schema]);

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleChange = (e) => {
    onChange(e);
    if (isTouched && schema) {
      const result = schema.safeParse(e.target.value);
      if (!result.success) {
        setError(result.error.issues[0].message);
      } else {
        setError("");
      }
    }
  };

  const hasError = isTouched && error;
  const isValid = isTouched && !error && value;

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
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full outline-none p-3 bg-white border rounded-[5px] transition-all duration-200 ${
            hasError
              ? "border-red-500 focus:ring-1 focus:ring-red-200"
              : isValid
              ? "border-green-500 focus:ring-1 focus:ring-green-200"
              : "border-[#313031] focus:ring-1 focus:ring-indigo-200"
          }`}
          {...props}
        />

        {/* Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300">
          {isValid && (
            <FaCheckCircle className="text-green-500 animate-in zoom-in duration-300" />
          )}
          {hasError && (
            <FaExclamationCircle className="text-red-500 animate-in shake duration-300" />
          )}
        </div>
      </div>

      {/* Error Message */}
      <div className="min-h-[1.25rem]">
        {hasError ? (
          <p className="text-[10px] text-red-600 font-bold uppercase tracking-tighter">
            {error}
          </p>
        ) : errorText ? (
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            {errorText}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ValidatedInput;
