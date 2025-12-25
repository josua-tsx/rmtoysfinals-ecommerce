export default function Buttons({ buttonType, buttonName, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      type={buttonType || "button"}
      className="flex relative hover:opacity-95 justify-center items-center w-full border border-black p-2 rounded-[5px] bg-primary text-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
    >
      {buttonName}

      <span className="absolute text-black right-2">{icon}</span>
    </button>
  );
}
