import {create} from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set) => ({
      currentOrder: null,
      isSummaryModalOpen: false,
      buyNowItems: null,

      setCurrentOrder: (order) => set({ currentOrder: order }),
      setSummaryModalOpen: (isOpen, items = null) =>
        set({ isSummaryModalOpen: isOpen, buyNowItems: items }),
      clearOrder: () => {
        set({ currentOrder: null, isSummaryModalOpen: false, buyNowItems: null });
        localStorage.removeItem("order-store");
      },
    }),
    {
      name: "order-store", // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentOrder: state.currentOrder }),
    }
  )
);
export default useOrderStore;
