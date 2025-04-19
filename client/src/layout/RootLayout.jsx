import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminSideBar from "../components/admin/AdminSideBar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import useOrderStore from "../stores/useOrderStore";

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
 }, [currentOrder]);

 // 🔁 Query: fetch stocks
 const {
   data: stocks = [],
 } = useQuery({
   queryKey: ["stocks"],
   queryFn: async () => {
     const res = await axiosInstance.get("/stocks/get-stocks");
     return res.data;
   },
 });

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
    <div className="font-main-text h-screen bg-yellow">
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="">
        <Outlet />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
};

const RequiredAuth = () => {
  const currentUser = useUserStore((state) => state.currentUser);

  return !currentUser ? (
    <Navigate to={`/sign-in`} />
  ) : (
    <div className="font-main-text">
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="bg-yellow h-screen">
        <Outlet />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
};

const RequiredAuthGcashPage = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  return !currentUser ? (
    <Navigate to={`/sign-in`} />
  ) : (
    <div className="font-main-text">
      {/* Main Content */}
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

const AdminLayout = () => {
  return (
    <div className="flex">
      <div className="">
        <AdminSideBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-yellow">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

const ValidatorStaffLayout = () => {
  return (
    <div className="flex">
      <div className="">
        <AdminSideBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-yellow">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}

export { RootLayout, AdminLayout, RequiredAuth,  ValidatorStaffLayout, RequiredAuthGcashPage };
