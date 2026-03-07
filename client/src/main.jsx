import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AdminLayout,
  RequiredAuthGcashPage,
  RootLayout,
  ValidatorStaffLayout,
} from "./layout/RootLayout.jsx";

// Lazy load components
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const SignIn = lazy(() => import("./routes/SignIn.jsx"));
const SignUp = lazy(() => import("./routes/SignUp.jsx"));
const Shop = lazy(() => import("./routes/Shop.jsx"));
const ProductDetails = lazy(() => import("./pages/ProductDetails.jsx"));
const Reviews = lazy(() => import("./pages/Reviews.jsx"));
const PopularPage = lazy(() => import("./pages/PopularPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));

// react query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProtectedAdminRoute } from "./routes/ProtectedRoutes/ProtectedAdminRoute.jsx";
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminAddProducts = lazy(
  () => import("./pages/admin/AdminAddProducts.jsx"),
);
const AdminBatchUpload = lazy(
  () => import("./pages/admin/AdminBatchUpload.jsx"),
);
const AdminBatchStock = lazy(() => import("./pages/admin/AdminBatchStock.jsx"));
const AdminBatchCategory = lazy(
  () => import("./pages/admin/AdminBatchCategory.jsx"),
);
const AdminBatchSupplier = lazy(
  () => import("./pages/admin/AdminBatchSupplier.jsx"),
);
const AdminBatchRider = lazy(() => import("./pages/admin/AdminBatchRider.jsx"));
const AdminBatchFaq = lazy(() => import("./pages/admin/AdminBatchFaq.jsx"));

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PublicRoute } from "./routes/PurblicRoute.jsx";
import { ProtectedCustomerRoute } from "./routes/ProtectedRoutes/ProtectedCustomerRoute.jsx";
const AdminEditProducts = lazy(
  () => import("./pages/admin/AdminEditProduct.jsx"),
);

const AdminSupplier = lazy(() => import("./pages/admin/AdminSupplier.jsx"));
const AdminCategory = lazy(() => import("./pages/admin/AdminCategory.jsx"));

const AdminStocks = lazy(() => import("./pages/admin/AdminStocks.jsx"));
const AdminUser = lazy(() => import("./pages/admin/AdminUser.jsx"));

const AdminWorker = lazy(() => import("./pages/admin/AdminWorker.jsx"));

const AdminOrderStatus = lazy(
  () => import("./pages/admin/AdminOrderStatus.jsx"),
);
const AdminSubscribedUser = lazy(
  () => import("./pages/admin/AdminSubscribedUser.jsx"),
);
const AdminOrderTransact = lazy(
  () => import("./pages/admin/AdminOrderTransact.jsx"),
);
const AdminAuditTrailLogs = lazy(
  () => import("./pages/admin/AdminAuditTrailLogs.jsx"),
);
const AdminArchives = lazy(() => import("./pages/admin/AdminArchives.jsx"));
const AdminProductReviews = lazy(
  () => import("./pages/admin/AdminProductReviews.jsx"),
);
import ProtectedValidatorStaffRoute from "./routes/ProtectedRoutes/ProtectedValidatorStaffRoute.jsx";

const Contact = lazy(() => import("./pages/Contact.jsx"));

const AdminOrderStocks = lazy(
  () => import("./pages/admin/AdminOrderStocks.jsx"),
);
const PurchaseCancelPage = lazy(() => import("./pages/PurchaseCancelPage.jsx"));
const PurchaseSuccessPage = lazy(
  () => import("./pages/PurchaseSuccessPage.jsx"),
);

const AdminVat = lazy(() => import("./pages/admin/AdminVat.jsx"));
const AdminPoints = lazy(() => import("./pages/admin/AdminPoints.jsx"));

const GcashPaymentPage = lazy(() => import("./pages/GcashPaymentPage.jsx"));

const AdminStockHistory = lazy(
  () => import("./pages/admin/AdminStockHistory.jsx"),
);
const RecoverPassword = lazy(() => import("./routes/RecoverPassword.jsx"));
const ResetPassword = lazy(() => import("./routes/ResetPassword.jsx"));

const GuestCartPage = lazy(
  () => import("./components/Guestt/GuestCartPage.jsx"),
);
const AdminFaqs = lazy(() => import("./components/admin/AdminFaqs.jsx"));
const AdminRider = lazy(() => import("./components/admin/AdminRider.jsx"));
const TrackerPage = lazy(() => import("./pages/TrackerPage.jsx"));

const AdminTicketDetail = lazy(
  () => import("./pages/admin/AdminTicketDetail.jsx"),
);
const AdminTicket = lazy(() => import("./pages/admin/AdminTicket.jsx"));
const AdminStoreSettings = lazy(
  () => import("./pages/admin/AdminStoreSettings.jsx"),
);
const CustomerTicketsPage = lazy(
  () => import("./pages/CustomerTicketsPage.jsx"),
);

import GlobalErrorBoundary from "./reusable/GlobalErrorBoundary.jsx";

// Auto-reload on stale dynamic import chunks (e.g. after a new deployment)
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  window.location.reload();
});

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
        path: `/my-tickets/:ticketId`,
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
        path: "/reset-password",
        element: <ResetPassword />,
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
        element: <PublicRoute element={<GuestCartPage />} />,
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
        path: "addProducts",
        element: <AdminAddProducts />,
      },
      {
        path: "batch-upload",
        element: <AdminBatchUpload />,
      },
      {
        path: "editProduct/:productid",
        element: <AdminEditProducts />,
      },
      {
        path: "category",
        element: <AdminCategory />,
      },
      {
        path: "batch-category",
        element: <AdminBatchCategory />,
      },

      // SUPPLIER
      {
        path: "supplier",
        element: <AdminSupplier />,
      },
      {
        path: "batch-supplier",
        element: <AdminBatchSupplier />,
      },

      {
        path: "user",
        element: <AdminUser />,
      },

      // STOCKS
      {
        path: "stocks",
        element: <AdminStocks />,
      },
      {
        path: "batch-stock",
        element: <AdminBatchStock />,
      },

      {
        path: "orderStocks",
        element: <AdminOrderStocks />,
      },

      {
        path: "stockHistory",
        element: <AdminStockHistory />,
      },

      // WORKER
      {
        path: "worker",
        element: <AdminWorker />,
      },
      {
        path: "subscribed-users",
        element: <AdminSubscribedUser />,
      },

      {
        path: "orderStatus",
        element: <AdminOrderStatus />,
      },

      {
        path: "orderTransactions",
        element: <AdminOrderTransact />,
      },

      {
        path: "audit",
        element: <AdminAuditTrailLogs />,
      },
      {
        path: "archives",
        element: <AdminArchives />,
      },

      {
        path: "productReviews",
        element: <AdminProductReviews />,
      },

      //  RIDER
      {
        path: "rider",
        element: <AdminRider />,
      },
      {
        path: "batch-rider",
        element: <AdminBatchRider />,
      },
      {
        path: "batch-faq",
        element: <AdminBatchFaq />,
      },

      // VAT

      {
        path: "vat",
        element: <AdminVat />,
      },

      {
        path: "points",
        element: <AdminPoints />,
      },

      // FAQS
      {
        path: "faqs",
        element: <AdminFaqs />,
      },
      // TICKETS
      {
        path: "tickets",
        element: <AdminTicket />,
      },
      {
        path: "ticket/:ticketId",
        element: <AdminTicketDetail />,
      },

      // STORE SETTINGS (AI CHATBOT CONFIG)
      {
        path: "store-settings",
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
        path: "batch-stock",
        element: <AdminBatchStock />,
      },

      {
        path: "orderStocks",
        element: <AdminOrderStocks />,
      },
      {
        path: "stockHistory",
        element: <AdminStockHistory />,
      },
      // TICKETS
      {
        path: "tickets",
        element: <AdminTicket />,
      },
      {
        path: "ticket/:ticketId",
        element: <AdminTicketDetail />,
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
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <RouterProvider router={router} />
        </Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);
