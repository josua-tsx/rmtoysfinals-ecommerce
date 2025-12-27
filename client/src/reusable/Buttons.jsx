export default function Buttons({
  buttonType,
  buttonName,
  icon,
  onClick,
  disabled,
  isLoading,
  loadingText,
  className,
  animateIcon = false,
}) {
  return (
    <button
      onClick={onClick}
      type={buttonType || "button"}
      disabled={disabled || isLoading}
      className={`flex group relative justify-center items-center border border-black p-3 rounded-[5px] bg-[#22c55e] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black uppercase tracking-widest text-sm active:scale-95 disabled:opacity-70 disabled:pointer-events-none disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px] ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{loadingText || "Processing..."}</span>
        </div>
      ) : (
        <>
          {buttonName}
          {icon && (
            <span
              className={`ml-2 inline-block transition-transform duration-300 ${
                animateIcon
                  ? "group-hover:translate-x-1 group-hover:-translate-y-1"
                  : ""
              }`}
            >
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
