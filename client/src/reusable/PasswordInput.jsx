import { useState, forwardRef } from "react";

const PasswordInput = forwardRef(
  (
    {
      label,
      name,
      id,
      value,
      onChange,
      placeholder = "••••••••",
      maxLength = 128,
      required = false,
      className = "",
      containerClassName = "",
      labelClassName = "",
      errorText = "",
      autoComplete = "current-password",
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={`flex flex-col gap-2 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id || name}
            className={`font-black uppercase text-[10px] tracking-widest text-gray-500 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <div className="flex flex-col gap-2 relative w-full">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            name={name}
            id={id || name}
            // Only pass value/onChange if they are provided (controlled mode), otherwise let react-hook-form handle it
            {...(value !== undefined && { value })}
            {...(onChange && { onChange })}
            maxLength={maxLength}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            className={`border border-black rounded-[5px] p-3 w-full outline-none bg-gray-50 focus:bg-white transition-colors ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-3.5 flex items-center gap-2 cursor-pointer bg-white border border-black px-2 py-1 rounded-[3px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <p className="text-[10px] uppercase">Show</p>
            <input
              type="checkbox"
              checked={showPassword}
              readOnly
              className="size-[10px] border border-black cursor-pointer"
            />
          </button>
          {errorText && (
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
              {errorText}
            </p>
          )}
        </div>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
