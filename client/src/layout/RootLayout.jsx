import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminSideBar from "../components/admin/AdminSideBar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

const RootLayout = () => {
  const { checkAuth } = useUserStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { clearUser } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  const {
    data: stocks = [],
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/get-stocks`);
      return res.data;
    },
  });

  console.log(stocks)

  

  // Mutation for sign-out
  const { mutate: signOut } = useMutation({
    mutationFn: async () => await axiosInstance.post("auth/signout"),
    onSuccess: () => {
      clearUser(); // Clear the user from the store
    },
  });

  // UseEffect to trigger sign-out when status is "blocked"
  useEffect(() => {
    if (currentUser && currentUser.status === "blocked") {
      signOut(); // Trigger sign-out
    }
  }, [currentUser, signOut]);

  // If the user is blocked, redirect to sign-in page
  if (currentUser?.status === "blocked") {
    return <Navigate to="/sign-in" />;
  }


  return (
    <div className="font-main-text bg-yellow">
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="bg-yellow">
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
      <main className="bg-yellow">
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
