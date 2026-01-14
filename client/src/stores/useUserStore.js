import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../lib/axios';

// Custom storage wrapper to handle dynamic switching based on rememberMe
const customStorage = {
    getItem: (name) => {
        const item = localStorage.getItem(name) || sessionStorage.getItem(name);
        return item;
    },
    setItem: (name, value) => {
        const rememberMe = localStorage.getItem("rememberMe") === "true";
        if (rememberMe) {
            localStorage.setItem(name, value);
            sessionStorage.removeItem(name);
        } else {
            sessionStorage.setItem(name, value);
            localStorage.removeItem(name);
        }
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
    }
};

export const useUserStore = create(persist(
    (set) => ({
        currentUser: null,
        setCurrentUser: (user) => set({ currentUser: user }),
        clearUser: () => {
            set({ currentUser: null });
            localStorage.removeItem("user-store");
            sessionStorage.removeItem("user-store");
            localStorage.removeItem("rememberMe");
        },
        checkAuth: async () => {
            try {
                const response = await axiosInstance.get('/auth/getMe');
                set({ currentUser: response.data });
            } catch (error) {
                console.error('Authentication check failed:', error);
                set({ currentUser: null });
            }
        },
    }),
    {
        name: 'user-store',
        storage: customStorage,
    }
));
