import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


export const useTrackOrderStore = create(
    persist(
        (set)=> ({
            currentTrackOrder: null,
            setCurrentTrackOrder: (order) => set({currentTrackOrder: order}),
            clearTrackOrder: (orders) => {
                const remainingitems  = orders.filter((order) => !order.isTracked)
                set({currentTrackOrder: null})
                localStorage.removeItem("track-store")
                return remainingitems
            },
        }),
        {
            name: "track-order",
            storage: createJSONStorage(() => localStorage)
        }
    )
)

export default useTrackOrderStore