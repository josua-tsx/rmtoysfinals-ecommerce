import { Navigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";
// Make sure this import is correct

export default function ProtectedValidatorStaffRoute({ children }) {
  const currentUser = useUserStore(state => state.currentUser); 

  // Check if the currentUser is loaded and contains the role
  if (!currentUser) {
    return <Navigate to="/sign-in" />; // Redirect to sign-in if no currentUser is found
  }

  return currentUser.role === "validatorStaff" ? children : <Navigate to="/" />;
}
