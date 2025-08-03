import { Navigate } from "react-router-dom"
import { useUserStore } from "../../stores/useUserStore"

export const ProtectedCustomerRoute = ({children}) => {
    const currentUser = useUserStore(state => state.currentUser)

    

    return currentUser ? children : <Navigate to={`/`}/>
}   