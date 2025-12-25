import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AdminLayout,
  RequiredAuthGcashPage,
  RootLayout,
  ValidatorStaffLayout,
} from "./layout/RootLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SignIn from "./routes/SignIn.jsx";
import SignUp from "./routes/SignUp.jsx";
import Shop from "./routes/Shop.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Reviews from "./pages/Reviews.jsx";
import PopularPage from "./pages/PopularPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CartPage from "./pages/CartPage.jsx";

// react query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProtectedAdminRoute } from "./routes/ProtectedRoutes/ProtectedAdminRoute.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminAddProducts from "./pages/admin/AdminAddProducts.jsx";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PublicRoute } from "./routes/PurblicRoute.jsx";
import { ProtectedCustomerRoute } from "./routes/ProtectedRoutes/ProtectedCustomerRoute.jsx";
import AdminEditProducts from "./pages/admin/AdminEditProduct.jsx";

import AdminSupplier from "./pages/admin/AdminSupplier.jsx";
import AdminCategory from "./pages/admin/AdminCategory.jsx";

import AdminStocks from "./pages/admin/AdminStocks.jsx";
import AdminUser from "./pages/admin/AdminUser.jsx";

// import AdminDraftProduct from "./pages/admin/AdminDraftProduct.jsx";
import AdminWorker from "./pages/admin/AdminWorker.jsx";

import AdminOrderStatus from "./pages/admin/AdminOrderStatus.jsx";
import AdminOrderTransact from "./pages/admin/AdminOrderTransact.jsx";
import AdminAuditTrailLogs from "./pages/admin/AdminAuditTrailLogs.jsx";
import AdminProductReviews from "./pages/admin/AdminProductReviews.jsx";
import ProtectedValidatorStaffRoute from "./routes/ProtectedRoutes/ProtectedValidatorStaffRoute.jsx";

import Contact from "./pages/Contact.jsx";

import AdminStocksPending from "./pages/admin/AdminStocksPending.jsx";
import PurchaseCancelPage from "./pages/PurchaseCancelPage.jsx";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage.jsx";

import AdminVat from "./pages/admin/AdminVat.jsx";

import GcashPaymentPage from "./pages/GcashPaymentPage.jsx";

import AdminStockHistory from "./pages/admin/AdminStockHistory.jsx";
import RecoverPassword from "./routes/RecoverPassword.jsx";
import ResetPassword from "./routes/ResetPassword.jsx";

import GuestCartPage from "./components/Guestt/GuestCartPage.jsx";
import VerifyEmailComponent from "./components/VerifyEmailComponent.jsx";
import AdminFaqs from "./components/admin/AdminFaqs.jsx";
import AdminRider from "./components/admin/AdminRider.jsx";
import TrackerPage from "./pages/TrackerPage.jsx";

import AdminTicketDetail from "./pages/admin/AdminTicketDetail.jsx";
import AdminTicket from "./pages/admin/AdminTicket.jsx";
import AdminStoreSettings from "./pages/admin/AdminStoreSettings.jsx";
import CustomerTicketsPage from "./pages/CustomerTicketsPage.jsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: `/`,
        element: <LandingPage />,
      },
      {
        path: `/my-tickets`,
        element: <CustomerTicketsPage />,
      },
      {
        path: "/tracker",
        element: <TrackerPage />,
      },
      {
        path: `/sign-in`,
        element: <PublicRoute element={<SignIn />} />,
      },
      {
        path: `/sign-up`,
        element: <PublicRoute element={<SignUp />} />,
      },
      {
        path: `/shop`,
        element: <Shop />,
      },
      {
        path: `/popular`,
        element: <PopularPage />,
      },
      {
        path: `/product/details/:productId`,
        element: <ProductDetails />,
      },

      {
        path: `/reviews`,
        element: <Reviews />,
      },

      {
        path: `/contact`,
        element: <Contact />,
      },
      {
        path: "/recover-password",
        element: <RecoverPassword />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmailComponent />,
      },
      {
        path: "/tracker-orders",
        element: <TrackerPage />,
      },

      {
        path: "/cart",
        element: (
          <ProtectedCustomerRoute>
            <CartPage />
          </ProtectedCustomerRoute>
        ),
      },
      {
        path: "/guest-cart",
        element: <GuestCartPage />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedCustomerRoute>
            <ProfilePage />
          </ProtectedCustomerRoute>
        ),
        children: [],
      },
    ],
  },

  {
    path: `/payment-gcash`,
    element: (
      <RequiredAuthGcashPage>
        <GcashPaymentPage />
      </RequiredAuthGcashPage>
    ),
  },

  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        path: "",
        element: <AdminOverview />,
      },
      {
        path: "overview",
        element: <AdminOverview />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "/admin/addProducts",
        element: <AdminAddProducts />,
      },
      {
        path: "/admin/editProduct/:productid",
        element: <AdminEditProducts />,
      },
      {
        path: "/admin/category",
        element: <AdminCategory />,
      },

      // SUPPLIER
      {
        path: "/admin/supplier",
        element: <AdminSupplier />,
      },

      {
        path: "/admin/user",
        element: <AdminUser />,
      },

      // STOCKS
      {
        path: "/admin/stocks",
        element: <AdminStocks />,
      },

      {
        path: "/admin/pendingStocks",
        element: <AdminStocksPending />,
      },

      {
        path: "/admin/stockHistory",
        element: <AdminStockHistory />,
      },

      // WORKER
      {
        path: "/admin/worker",
        element: <AdminWorker />,
      },

      {
        path: "/admin/orderStatus",
        element: <AdminOrderStatus />,
      },

      {
        path: "/admin/orderTransactions",
        element: <AdminOrderTransact />,
      },

      {
        path: "/admin/audit",
        element: <AdminAuditTrailLogs />,
      },

      {
        path: "/admin/productReviews",
        element: <AdminProductReviews />,
      },

      //  RIDER
      {
        path: "/admin/rider",
        element: <AdminRider />,
      },

      // VAT

      {
        path: "/admin/vat",
        element: <AdminVat />,
      },

      // AUDIT

      {
        path: "/admin/audit",
        element: <AdminAuditTrailLogs />,
      },

      {
        path: "/admin/orderTransactions",
        element: <AdminOrderTransact />,
      },

      // FAQS
      {
        path: "/admin/faqs",
        element: <AdminFaqs />,
      },
      // TICKETS
      {
        path: "/admin/tickets",
        element: <AdminTicket />,
      },
      {
        path: "/admin/ticket/:ticketId",
        element: <AdminTicketDetail />,
      },

      // STORE SETTINGS (AI CHATBOT CONFIG)
      {
        path: "/admin/store-settings",
        element: <AdminStoreSettings />,
      },
    ],
  },

  {
    path: "validator",
    element: (
      <ProtectedValidatorStaffRoute>
        <ValidatorStaffLayout />
      </ProtectedValidatorStaffRoute>
    ),
    children: [
      {
        path: "",
        element: <AdminOverview />,
      },
      {
        path: "overview",
        element: <AdminOverview />,
      },
      {
        path: "orderStatus",
        element: <AdminOrderStatus />,
      },
      // {
      //   path: "audit",
      //   element: <AdminAuditTrailLogs />,
      // },

      {
        path: `orderTransactions`,
        element: <AdminOrderTransact />,
      },

      {
        path: "stocks",
        element: <AdminStocks />,
      },

      {
        path: "pendingStocks",
        element: <AdminStocksPending />,
      },
      {
        path: "stockHistory",
        element: <AdminStockHistory />,
      },
    ],
  },
  {
    path: `/purchase-cancel`,
    element: <PurchaseCancelPage />,
  },
  {
    path: `/purchase-success`,
    element: <PurchaseSuccessPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
