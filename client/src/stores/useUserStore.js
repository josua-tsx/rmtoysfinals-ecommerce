import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axiosInstance from '../lib/axios';

export const useUserStore = create(persist(
    (set) => ({
        currentUser: null,
        setCurrentUser: (user) => set({ currentUser: user }),
        clearUser: () => {
            set({ currentUser: null });
            localStorage.removeItem("user-store");
        },
        checkAuth: async () => {
            try {
                const response = await axiosInstance.get('/auth/getMe'); // Adjust the endpoint as necessary
                set({ currentUser: response.data }); // Set the user data if authenticated
            } catch (error) {
                console.error('Authentication check failed:', error);
                set({ currentUser: null }); // Clear user if authentication fails
            }
        },
    }),
    {
        name: 'user-store', // Unique name for localStorage key
        storage: createJSONStorage(() => localStorage),
    }
));
