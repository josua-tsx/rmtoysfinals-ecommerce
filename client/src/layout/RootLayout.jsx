import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminSideBar from "../components/admin/AdminSideBar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import useOrderStore from "../stores/useOrderStore";
import FooterSection from "../components/FooterSection";
import TopProgressBar from "../reusable/TopProgressBar";
import ChatWidget from "../components/ChatWidget";

const RootLayout = () => {
  // 🧠 User store
  const { checkAuth } = useUserStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // 📦 Order store
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  // 🔍 Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🧹 Clear order if exists
  useEffect(() => {
    if (currentOrder) {
      clearOrder();
    }
  }, [currentOrder, clearOrder]);

  // ❌ Mutation: sign-out user
  const { mutate: signOut } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/signout"),
    onSuccess: clearUser,
  });

  // 🚫 Sign out if user is blocked
  useEffect(() => {
    if (currentUser?.status === "blocked") {
      signOut();
    }
  }, [currentUser, signOut]);

  // ⛔️ Redirect blocked users to sign-in
  if (currentUser?.status === "blocked") {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="font-main-text h-full flex flex-col justify-between bg-yellow">
      <TopProgressBar />
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="bg-yellow">
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
            right: "0", // Move left/right
            bottom: "-60px", // Move up/down
            transform: "translateY(20px)", // Fine adjustment
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

const RequiredAuthGcashPage = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  return !currentUser ? (
    <Navigate to={`/sign-in`} />
  ) : (
    <div className="font-main-text">
      <TopProgressBar />
      {/* Main Content */}
      <main>
        <Outlet />
      </main>
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
  return (
    <div className="flex bg-yellow h-full">
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
