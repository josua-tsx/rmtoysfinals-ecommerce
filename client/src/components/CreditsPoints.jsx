import { useUserStore } from "../stores/useUserStore";

export default function CreditsPoints() {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <div className="text-xs md:text-sm flex items-center gap-2 bg-white border border-black px-3 py-1 rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ">
      <div className="font-black uppercase tracking-tighter">Credits:</div>
      <div className="text-blue-700 font-bold">{currentUser?.credits}</div>
    </div>
  );
}
