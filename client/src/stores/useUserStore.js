import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../lib/axios';

// Custom storage wrapper to handle dynamic switching based on rememberMe
const customStorage = {
    getItem: (name) => {
        const item = localStorage.getItem(name) || sessionStorage.getItem(name);
        return item; // Return string (Zustand persist handles JSON parsing)
    },
    setItem: (name, value) => {
        // Ensure value is a string (JSON stringify if it's an object)
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        const rememberMe = localStorage.getItem("rememberMe") === "true";
        if (rememberMe) {
            localStorage.setItem(name, stringValue);
            sessionStorage.removeItem(name);
        } else {
            sessionStorage.setItem(name, stringValue);
            localStorage.removeItem(name);
        }
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
    }
};

// Get initial user synchronously from storage to avoid redirect on fresh page load
const getInitialUser = () => {
    try {
        const stored = localStorage.getItem("user-store") || sessionStorage.getItem("user-store");
        console.log("🔍 Raw stored value:", stored);
        if (stored) {
            const parsed = JSON.parse(stored);
            console.log("🔍 Parsed value:", parsed);
            // Zustand persist stores state under "state" key
            const user = parsed?.state?.currentUser || parsed?.currentUser || null;
            console.log("🔍 Found user:", user);
            return user;
        }
    } catch (e) {
        console.log("🔍 Error reading storage:", e);
        return null;
    }
    return null;
};

export const useUserStore = create(persist(
    (set) => ({
        currentUser: getInitialUser(), // Initialize synchronously from storage
        isCheckingAuth: false,
        setCurrentUser: (user) => set({ currentUser: user }),
        clearUser: () => {
            set({ currentUser: null });
            localStorage.removeItem("user-store");
            sessionStorage.removeItem("user-store");
            localStorage.removeItem("rememberMe");
            sessionStorage.removeItem("snoozeOnboarding"); // Clear snoozing preference on logout
        },
        checkAuth: async () => {
            set({ isCheckingAuth: true });
            try {
                const response = await axiosInstance.get('/auth/getMe');
                set({ currentUser: response.data });
            } catch (error) {
                console.error('Authentication check failed:', error);
                set({ currentUser: null });
            } finally {
                set({ isCheckingAuth: false });
            }
        },
    }),
    {
        name: 'user-store',
        storage: customStorage,
    }
));
