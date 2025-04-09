import { useUserStore } from "../stores/useUserStore";
import CreditsPoints from "./CreditsPoints";

export default function Profile() {

  const currentUser = useUserStore(state => state.currentUser)

  return (
    <div className="flex items-center gap-2">
      <div>
        <img
          src={currentUser.avatar}
          alt="avatar"
          className="w-[45px] h-[45px] border border-black rounded-full object-cover"
        />
      </div> 
      <CreditsPoints/>
    </div>
  );
}
