import {create} from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set) => ({
      currentOrder: null,

      setCurrentOrder: (order) => set({ currentOrder: order }),
      clearOrder: () => {
        set({ currentOrder: null });
        localStorage.removeItem("order-store");
      },
    }),
    {
      name: "order-store", // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export default useOrderStore;
