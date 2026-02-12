import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

/**
 * React Query hook to fetch the current session user via /auth/getMe.
 * Automatically re-fetches when the "currentUser" query is invalidated.
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/getMe");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};
