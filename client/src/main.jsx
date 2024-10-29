import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {AdminLayout, RequiredAuth, RootLayout} from './layout/RootLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import SignIn from './routes/SignIn.jsx'
import SignUp from './routes/SignUp.jsx'
import Shop from './routes/Shop.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Reviews from './pages/Reviews.jsx'
import PopularPage from './pages/PopularPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CartPage from './pages/CartPage.jsx'
import WishListPage from './pages/WishListPage.jsx'

// react query
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

import { ProtectedAdminRoute} from './routes/ProtectedRoutes/ProtectedAdminRoute.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminAddProducts from './pages/admin/AdminAddProducts.jsx'
import AdminFilter from './pages/admin/AdminFilter.jsx'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PublicRoute } from './routes/PurblicRoute.jsx'
import { ProtectedCustomerRoute } from './routes/ProtectedRoutes/ProtectedCustomerRoute.jsx'
import AdminEditProducts from './pages/admin/AdminEditProduct.jsx'
import AdminAddSupplier from './pages/admin/AdminAddSupplier.jsx'
import AdminSupplier from './pages/admin/AdminSupplier.jsx'
import AdminCategory from './pages/admin/AdminCategory.jsx'
import AdminAddCategory from './pages/admin/AdminAddCategory.jsx'
import AdminCategoryEdit from './pages/admin/AdminCategoryEdit.jsx'
import AdminEditSupplier from './pages/admin/AdminEditSupplier.jsx'
import AdminStocks from './pages/admin/AdminStocks.jsx'
import AdminAddStocks from './pages/admin/AdminAddStocks.jsx'
import AdminEditStocks from './components/admin/AdminEditStocks.jsx'
import AdminUser from './pages/admin/AdminUser.jsx'
import AdminDraftProductsTable from './components/admin/AdminDraftProductsTable.jsx'
import AdminDraftProduct from './pages/admin/AdminDraftProduct.jsx'
  
const queryClient = new QueryClient()


const router = createBrowserRouter([

  {
    path: "/",
    element: <RootLayout/>,
    children: [
      {
        path: `/`,
        element: <LandingPage/>
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
        element: <Shop/>
      },
      {
        path: `/product`,
        element: <ProductDetails/>
      },
      {
        path: `/reviews`,
        element: <Reviews/>
      },
      {
        path: `/popular`,
        element: <PopularPage/>
      },
     
    ]

  },

  {
    element: <ProtectedCustomerRoute><RequiredAuth/></ProtectedCustomerRoute>,
    children: [
      {
        path: `/profile`,
        element: <ProfilePage/>
      },
      {
        path: `/cart`,
        element: <CartPage/>
      },
      {
        path: `/wishlist`,
        element: <WishListPage/>
      },

    ]
  },

  {
    path: "admin",
    element: <ProtectedAdminRoute><AdminLayout/></ProtectedAdminRoute>,
    children: [
      {
        path: "",
        element: <AdminOverview/>
      },

      // OVERVIEW


      {
        path: "/admin/overview",
        element: <AdminOverview/>
      },

      // FILTER

      {
        path: "/admin/filter",
        element: <AdminFilter/>
      },

      // PRODUCTS

      {
        path: "/admin/products",
        element: <AdminProducts/>
      },
     
      {
        path: "/admin/addProducts",
        element: <AdminAddProducts/>
      },
      {
        path: "/admin/editProduct/:editProductId",
        element: <AdminEditProducts/>
      },
      {
        path: "/admin/draftProducts",
        element: <AdminDraftProduct/>
      },

       // SUPPLIER

      {
        path: "/admin/supplier",
        element: <AdminSupplier/>
      },
      {
        path: "/admin/addSupplier",
        element: <AdminAddSupplier/>
      },
      {
        path: "/admin/editSupplier/:editSupplierId",
        element: <AdminEditSupplier/>
      },

      // CATEGORY
      
      {
        path: "/admin/category",
        element: <AdminCategory/>
      },
      {
        path: "/admin/addCategory",
        element: <AdminAddCategory/>
      },
      {
        path: "/admin/editCategory/:editCategoryId",
        element: <AdminCategoryEdit/>
      },


      // STOCKS

      {
        path: "/admin/stocks",
        element: <AdminStocks/>
      },

      {
        path: "/admin/addStocks",
        element: <AdminAddStocks/>
      },
      {
        path: "/admin/editStocks/:stockId",
        element: <AdminEditStocks/>
      },


      // USER MAINTENANCE 

      {
        path: "/admin/user",
        element: <AdminUser/>
      }
    ]
  },
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
        <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
        <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
  </StrictMode>,
)
