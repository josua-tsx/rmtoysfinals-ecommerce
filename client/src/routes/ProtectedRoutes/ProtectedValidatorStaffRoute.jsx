import { Navigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";
import { useEffect } from "react";
// Make sure this import is correct
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function ProtectedValidatorStaffRoute({ children }) {
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

  // Check if the currentUser is loaded and contains the role
  if (!currentUser) {
    return <Navigate to="/sign-in" />; // Redirect to sign-in if no currentUser is found
  }

  return currentUser.role === "validatorStaff" ? children : <Navigate to="/" />;
}
