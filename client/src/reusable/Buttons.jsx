
export default function Buttons({buttonType, buttonName, icon}) {
  return (
    <button type={buttonType || "button"} className="flex relative hover:opacity-95  justify-center items-center w-full border border-black p-2 rounded-[5px] bg-primary text-card" 
    >
    
    {buttonName}

    <span className="absolute right-2">{icon}</span>
    
    </button>
  )
}
