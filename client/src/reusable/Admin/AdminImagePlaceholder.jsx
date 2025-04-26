import { FaImage } from "react-icons/fa";

export default function AdminImagePlaceholder({size, bgColor}) {
  return (
    <div className='inset-0 rounded-[5px] flex justify-center flex-col items-center text-[150px] text-green-700 opacity-80 absolute' 
    style={{backgroundColor: `${bgColor}`}}
    >
        +
    </div>
  )
}
