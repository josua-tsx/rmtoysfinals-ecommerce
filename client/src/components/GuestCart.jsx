import { FaShoppingCart } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function GuestCart() {
  const [cartCount, setCartCount] = useState(0)

  // Load and watch for changes in guest cart
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || { items: [] }
        setCartCount(guestCart.items?.length || 0)
      } catch (error) {
        console.error("Error reading guest cart:", error)
        setCartCount(0)
      }
    }

    // Initial load
    updateCartCount()

    // Listen for storage events (changes from other tabs)
    const handleStorageChange = () => updateCartCount()
    window.addEventListener('storage', handleStorageChange)

    // Cleanup
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className="font-main">
      <Link to={`/cart`} className="relative">
        <FaShoppingCart size={25} />
        
        {/* Show badge if items exist in cart */}
        {cartCount > 0 && (
          <span
            className={`absolute bg-red-600 p-2 h-[20px] flex w-[20px] text-sm text-white 
              items-center justify-center -bottom-2 -right-[9.5px] rounded-full`}
          >
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  )
}