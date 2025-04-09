import { useUserStore } from "../stores/useUserStore"


export default function CreditsPoints() {

    const currentUser = useUserStore((state) => state.currentUser)
    console.log(currentUser)

  return (
    <div className="text-sm">
      Total Credits: {currentUser?.credits}
    </div>
  )
}
