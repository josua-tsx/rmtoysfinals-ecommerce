import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminSideBar from "../components/admin/AdminSideBar";
import AdminNotificationPanel from "../components/admin/AdminNotificationPanel";
import CustomerNotificationPanel from "../components/CustomerNotificationPanel";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useEffect, useState } from "react";
import useOrderStore from "../stores/useOrderStore";
import FooterSection from "../components/FooterSection";
import TopProgressBar from "../reusable/TopProgressBar";
import ChatWidget from "../components/ChatWidget";
import { useSocketNotifications } from "../hooks/useSocketNotifications";
import UserOnboardingModal from "../components/modals/UserOnboardingModal";

const RootLayout = () => {
  // 🧠 User store — keep checkAuth to populate Zustand for other components
  const { checkAuth } = useUserStore();
  // ⚡ React Query — reactive user data for this component
  const { data: currentUser } = useCurrentUser();

  // State for onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 🔔 Enable real-time notifications for customers (and admins if they use this layout)
  useSocketNotifications(currentUser);

  // 🔍 Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check onboarding status
  useEffect(() => {
    // Check if user exists and is a customer (not admin/staff)
    // Adjust logic based on your actual User model structure
    const isCustomer =
      currentUser && (currentUser.role === "customer" || !currentUser.role);
    const isNotComplete = currentUser && !currentUser.isOnboardingComplete;

    if (isCustomer && isNotComplete) {
      // Check if user has "snoozed" onboarding this session
      const hasSnoozed = sessionStorage.getItem("snoozeOnboarding");
      if (!hasSnoozed) {
        setShowOnboarding(true);
      } else {
        console.log("Onboarding Snoozed");
      }
    }
  }, [currentUser]);

  // Handle "Update Later" logic
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem("snoozeOnboarding", "true");
  };

  // ... rest of existing code

  return (
    <div className="font-main-text h-full flex flex-col justify-between bg-yellow">
      <TopProgressBar />
      {/* Onboarding Modal */}
      <UserOnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="bg-yellow relative">
        {/* Customer Notification Bell - only for logged-in customers */}
        {currentUser && !currentUser.isAdmin && (
          <div className="fixed top-20 right-6 z-50">
            <CustomerNotificationPanel />
          </div>
        )}
        <Outlet />
        <ChatWidget />
      </main>
      <footer className="bg-yellow">
        <FooterSection />
      </footer>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            width: "300px",
            position: "relative",
            right: "0",
            bottom: "-60px",
            transform: "translateY(20px)",
          },
        }}
      />
    </div>
  );
};

const RequiredAuth = () => {
  const currentUser = useUserStore((state) => state.currentUser);

  return !currentUser ? (
    <Navigate to={`/sign-in`} />
  ) : (
    <div className="font-main-text h-screen bg-yellow">
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="">
        <Outlet />
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            width: "300px",
            position: "relative",
            right: "0", // Move left/right
            bottom: "-60px", // Move up/down
            transform: "translateY(20px)", // Fine adjustment
          },
        }}
      />
    </div>
  );
};

const RequiredAuthGcashPage = ({ children }) => {
  const { checkAuth } = useUserStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const currentOrder = useOrderStore((state) => state.currentOrder);

  // Check localStorage immediately for guest orders
  const backupOrder = JSON.parse(localStorage.getItem("manual-order-backup"));
  const canAccessImmediately =
    currentUser || currentOrder?.isGuest || backupOrder?.isGuest;

  useEffect(() => {
    // Only check auth if not a guest order
    if (!canAccessImmediately) {
      checkAuth();
    }
  }, [checkAuth, canAccessImmediately]);

  return !canAccessImmediately ? (
    <Navigate to={`/sign-in`} />
  ) : (
    <div className="font-main-text">
      <TopProgressBar />
      {/* Main Content */}
      <main>{children}</main>
      <Toaster
        toastOptions={{
          style: {
            width: "300px",
            position: "relative",
            right: "0", // Move left/right
            bottom: "-60px", // Move up/down
            transform: "translateY(20px)", // Fine adjustment
          },
        }}
      />
    </div>
  );
};

const AdminLayout = () => {
  // Enable real-time notifications for admins
  const { data: currentUser } = useCurrentUser();
  useSocketNotifications(currentUser);

  return (
    <div className="flex bg-yellow h-full">
      <TopProgressBar />
      <div className="">
        <AdminSideBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Notification Bell - Fixed Position */}
        <div className="fixed top-40 right-8 z-50">
          <AdminNotificationPanel />
        </div>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

const ValidatorStaffLayout = () => {
  return (
    <div className="flex h-screen bg-yellow">
      <TopProgressBar />
      <div className="">
        <AdminSideBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export {
  RootLayout,
  AdminLayout,
  RequiredAuth,
  ValidatorStaffLayout,
  RequiredAuthGcashPage,
};
