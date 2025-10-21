import { useUserStore } from "../stores/useUserStore";

export default function CreditsPoints() {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <div className="text-sm flex items-center gap-2">
      <div>Total Credits:</div>
      <div className="text-blue-700">{currentUser?.credits}</div>
    </div>
  );
}
