import { Navigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useEffect } from "react";

export const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, isCheckingAuth, checkAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={"/sign-in"} replace />;
  }

  return currentUser.role === "admin" ? children : <Navigate to="/" />;
};
