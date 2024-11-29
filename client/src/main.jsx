import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AdminLayout, RequiredAuth, RequiredAuthGcashPage, RootLayout } from "./layout/RootLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SignIn from "./routes/SignIn.jsx";
import SignUp from "./routes/SignUp.jsx";
import Shop from "./routes/Shop.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Reviews from "./pages/Reviews.jsx";
import PopularPage from "./pages/PopularPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CartPage from "./pages/CartPage.jsx";
import WishListPage from "./pages/WishListPage.jsx";

// react query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProtectedAdminRoute } from "./routes/ProtectedRoutes/ProtectedAdminRoute.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminAddProducts from "./pages/admin/AdminAddProducts.jsx";
import AdminFilter from "./pages/admin/AdminFilter.jsx";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PublicRoute } from "./routes/PurblicRoute.jsx";
import { ProtectedCustomerRoute } from "./routes/ProtectedRoutes/ProtectedCustomerRoute.jsx";
import AdminEditProducts from "./pages/admin/AdminEditProduct.jsx";
import AdminAddSupplier from "./pages/admin/AdminAddSupplier.jsx";
import AdminSupplier from "./pages/admin/AdminSupplier.jsx";
import AdminCategory from "./pages/admin/AdminCategory.jsx";
import AdminAddCategory from "./pages/admin/AdminAddCategory.jsx";
import AdminCategoryEdit from "./pages/admin/AdminCategoryEdit.jsx";
import AdminEditSupplier from "./pages/admin/AdminEditSupplier.jsx";
import AdminStocks from "./pages/admin/AdminStocks.jsx";
import AdminAddStocks from "./pages/admin/AdminAddStocks.jsx";
import AdminEditStocks from "./components/admin/AdminEditStocks.jsx";
import AdminUser from "./pages/admin/AdminUser.jsx";

import AdminDraftProduct from "./pages/admin/AdminDraftProduct.jsx";
import AdminWorker from "./pages/admin/AdminWorker.jsx";
import AdminAddWorker from "./pages/admin/AdminAddWorker.jsx";
import OrderSummaryModal from "./components/OrderSummaryModal.jsx";
import SingleOrderList from "./components/SingleOrderList.jsx";
import AdminOrderStatus from "./pages/admin/AdminOrderStatus.jsx";
import GcashCheckOut from "./pages/GcashCheckOut.jsx";
import AdminGcash from "./pages/admin/AdminGcash.jsx";
import AdminAddGcash from "./pages/admin/AdminAddGcash.jsx";
import AdminOrderTransact from "./pages/admin/AdminOrderTransact.jsx";
import AdminAuditTrailLogs from "./pages/admin/AdminAuditTrailLogs.jsx";
import AdminProductReviewsTable from "./components/admin/AdminProductReviewsTable.jsx";
import AdminProductReviews from "./pages/admin/AdminProductReviews.jsx";



const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: (
      <ProtectedCustomerRoute>
        <RequiredAuthGcashPage/>
      </ProtectedCustomerRoute>
    ),
    children: [
      {
        path: `/gcashPage`,
        element: <GcashCheckOut />,
      },
    ],
  },

  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: `/`,
        element: <LandingPage />,
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
        path: `/product/:productId`,
        element: <ProductDetails />,
      },
      {
        path: `/reviews`,
        element: <Reviews />,
      },
      {
        path: `/popular`,
        element: <PopularPage />,
      },
    ],
  },

  {
    element: (
      <ProtectedCustomerRoute>
        <RequiredAuth />
      </ProtectedCustomerRoute>
    ),
    children: [
      {
        path: `/profile`,
        element: <ProfilePage />,
      },
      {
        path: `/cart`,
        element: <CartPage />,
      },
      {
        path: `/wishlist`,
        element: <WishListPage />,
      },
      {
        path: `/order`,
        element: <OrderSummaryModal />,
      },
      {
        path: `/orderSingle`,
        element: <SingleOrderList />,
      },
    ],
  },

  {
    path: "admin",
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

      // OVERVIEW

      {
        path: "/admin/overview",
        element: <AdminOverview />,
      },

      // status
      {
        path: "/admin/orderStatus",
        element: <AdminOrderStatus />,
      },

      // FILTER

      // {
      //   path: "/admin/filter",
      //   element: <AdminFilter />,
      // },

      // PRODUCTS

      {
        path: "/admin/products",
        element: <AdminProducts />,
      },

      {
        path: "/admin/addProducts",
        element: <AdminAddProducts />,
      },
      {
        path: "/admin/editProduct/:editProductId",
        element: <AdminEditProducts />,
      },
      {
        path: "/admin/draftProducts",
        element: <AdminDraftProduct />,
      },

      {
        path: "/admin/productReviews",
        element: <AdminProductReviews/> ,
      },

      // SUPPLIER

      {
        path: "/admin/supplier",
        element: <AdminSupplier />,
      },
      {
        path: "/admin/addSupplier",
        element: <AdminAddSupplier />,
      },
      {
        path: "/admin/editSupplier/:editSupplierId",
        element: <AdminEditSupplier />,
      },

      // CATEGORY

      {
        path: "/admin/category",
        element: <AdminCategory />,
      },
      {
        path: "/admin/addCategory",
        element: <AdminAddCategory />,
      },
      {
        path: "/admin/editCategory/:editCategoryId",
        element: <AdminCategoryEdit />,
      },

      // STOCKS

      {
        path: "/admin/stocks",
        element: <AdminStocks />,
      },

      {
        path: "/admin/addStocks",
        element: <AdminAddStocks />,
      },
      {
        path: "/admin/editStocks/:stockId",
        element: <AdminEditStocks />,
      },

      // USER MAINTENANCE

      {
        path: "/admin/user",
        element: <AdminUser />,
      },
      {
        path: "/admin/worker",
        element: <AdminWorker />,
      },
      {
        path: "/admin/addWorker",
        element: <AdminAddWorker />,
      },


      // GCASH

      {
        path: "/admin/gcash",
        element: <AdminGcash/>
      },

      {
        path: "/admin/addGcash",
        element: <AdminAddGcash/>
      },


      // AUDIT

      {
        path: `/admin/audit`,
        element: <AdminAuditTrailLogs/>
      },

      {
        path: `/admin/orderTransact`,
        element: <AdminOrderTransact/>
      }

    ],
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
