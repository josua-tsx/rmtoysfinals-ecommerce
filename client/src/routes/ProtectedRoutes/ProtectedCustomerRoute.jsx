import { Navigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export const ProtectedCustomerRoute = ({ children }) => {
  const { currentUser, isCheckingAuth } = useUserStore();

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return currentUser ? children : <Navigate to={`/`} />;
};
