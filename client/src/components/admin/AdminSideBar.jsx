import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoMdArrowDropright,
  IoMdArrowDropleft,
  IoIosStats,
} from "react-icons/io";
import { MdCategory, MdKeyboardReturn } from "react-icons/md";
import {
  FaPuzzlePiece,
  FaBoxOpen,
  FaUsers,
  FaWarehouse,
  FaQuestionCircle,
  FaPercentage,
  FaMoneyBillWave,
  FaTruck,
  FaMotorcycle,
  FaArchive,
} from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { AiOutlineAudit } from "react-icons/ai";
import { useUserStore } from "../../stores/useUserStore";

import RMTOYSLOGO from "../../assets/RMTOYSLOGOFINAL.png";

export default function AdminSideBar() {
  // Define sidebar items with their allowed roles
  const adminSideBarItems = [
    {
      name: "Overview",
      path: "",
      icon: <IoIosStats size={20} />,
      allowedRoles: ["admin", "validatorStaff"],
    },
    {
      name: "Order Status",
      path: "/admin/orderStatus",
      icon: <FaBoxOpen size={20} />,
      allowedRoles: ["admin", "validatorStaff"],
    },
    {
      name: "Product Maintenance",
      path: "/admin/products",
      icon: <FaPuzzlePiece size={20} />,
      allowedRoles: ["admin"],
      inner: [
        {
          name: "Add Product",
          path: "/admin/addProducts",
        },
        {
          name: "Batch Upload",
          path: "/admin/batch-upload",
        },

        // {
        //   name: "Products Draft",
        //   path: "/admin/draftProducts",
        // },
        {
          name: "Products Reviews",
          path: "/admin/productReviews",
        },
      ],
    },
    {
      name: "Category Maintenance",
      icon: <MdCategory size={20} />,
      allowedRoles: ["admin"],
      path: "/admin/category",
      inner: [
        {
          name: "Batch Category",
          path: "/admin/batch-category",
        },
      ],
    },
    {
      name: "Supplier Maintenance",
      icon: <FaTruck size={20} />,
      allowedRoles: ["admin"],
      path: "/admin/supplier",
      inner: [
        {
          name: "Batch Supplier",
          path: "/admin/batch-supplier",
        },
      ],
    },
    {
      name: "User Maintenance",
      path: "/admin/user",
      icon: <FaUsers size={20} />,
      allowedRoles: ["admin"],
      inner: [
        {
          name: "Worker Table",
          path: "/admin/worker",
        },
      ],
    },

    {
      name: "Rider Maintenance",
      icon: <FaMotorcycle size={20} />,
      allowedRoles: ["admin"],
      path: "/admin/rider",
      inner: [
        {
          name: "Batch Rider",
          path: "/admin/batch-rider",
        },
      ],
    },

    {
      name: "Faqs Maintenance",
      path: "/admin/faqs",
      icon: <FaQuestionCircle size={20} />,
      allowedRoles: ["admin"],
      inner: [
        {
          name: "Batch FAQ",
          path: "/admin/batch-faq",
        },
      ],
    },

    {
      name: "Stocks",
      path: "/admin/stocks",
      icon: <FaWarehouse size={20} />,
      allowedRoles: ["admin", "validatorStaff"],
      inner: [
        {
          name: "Pending Stocks",
          path: "/admin/pendingStocks",
        },
        {
          name: "Batch Stock",
          path: "/admin/batch-stock",
        },
        {
          name: "Order Stock History",
          path: "/admin/stockHistory",
        },
      ],
    },

    {
      name: "Value added tax",
      icon: <FaPercentage size={20} />,
      allowedRoles: ["admin"],
      path: "/admin/vat",
    },

    {
      name: "Tickets",
      path: "/admin/tickets",
      icon: <BiSupport size={20} />,
      allowedRoles: ["admin"],
    },

    {
      name: "Order Transactions",
      path: "/admin/orderTransactions",
      icon: <FaMoneyBillWave size={20} />,
      allowedRoles: ["admin", "validatorStaff"],
    },

    {
      name: "Logs",
      path: "/admin/audit",
      icon: <AiOutlineAudit size={20} />,
      allowedRoles: ["admin"],
    },

    {
      name: "Archives",
      icon: <FaArchive size={20} />,
      allowedRoles: ["admin"],
      path: "/admin/archives",
    },

    {
      name: "Return to shop",
      path: "/shop",
      icon: <MdKeyboardReturn size={20} />,
      allowedRoles: ["admin", "validatorStaff"],
    },
  ];

  const [toggleSideBar, setToggleSideBar] = useState(true);
  const [active, setActive] = useState("dashboard");

  const currentUser = useUserStore((state) => state.currentUser);

  // Filter sidebar items based on user role

  const adjustedSideBarItems = adminSideBarItems
    .map((item) => {
      if (item.allowedRoles.includes(currentUser.role)) {
        const basePath =
          currentUser.role === "validatorStaff" ? "/validator" : "/admin"; // Adjust path based on role
        return {
          ...item,
          path: item?.path?.replace("/admin", basePath),
          inner: item.inner?.map((innerItem) => ({
            ...innerItem,
            path: innerItem?.path?.replace("/admin", basePath),
          })),
        };
      }
      return null;
    })
    .filter((item) => item !== null);

  // const filteredSideBarItems = adminSideBarItems.filter(item =>
  //   item.allowedRoles.includes(currentUser.role)
  // )

  // .map(item => {
  //   // If the item has inner items, filter those too
  //   if (item.inner) {
  //     return {
  //       ...item,
  //       inner: item.inner.filter(innerItem =>
  //         // If inner item doesn't specify roles, inherit from parent
  //         innerItem.allowedRoles
  //           ? innerItem.allowedRoles.includes(currentUser.role)
  //           : item.allowedRoles.includes(currentUser.role)
  //       )
  //     };
  //   }
  //   return item;
  // });

  return (
    <aside
      className={`z-50 text-sm md:text-[18px] border transition-all border-r-gray-500 p-3 bg-card h-full  ${
        toggleSideBar ? "w-44 md:w-52" : "w-16"
      } font-main`}
    >
      <div className="flex h-full flex-col gap-8">
        <div className="flex items-center pb-5 justify-between">
          <Link
            to="/"
            className={`text-xl py-2 ${toggleSideBar ? "block" : "hidden"}`}
          >
            <img src={RMTOYSLOGO} className="w-[90px]" alt="" />
          </Link>
          <button onClick={() => setToggleSideBar(!toggleSideBar)}>
            {toggleSideBar ? (
              <IoMdArrowDropright size={30} />
            ) : (
              <IoMdArrowDropleft size={30} />
            )}
          </button>
        </div>

        <nav className="flex-1">
          <ul className="flex flex-col gap-5">
            {adjustedSideBarItems.map((item) => (
              <li
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`relative group ${
                  active === item.name ? "bg-indigo-300" : "hover:bg-indigo-200"
                } border-b-gray-300 border-t-0 border-r-0 border-l-0 border rounded-[5px] p-1`}
              >
                <Link
                  to={item.path}
                  className=" w-full flex gap-4 justify-between items-center"
                >
                  <div>{item.icon}</div>
                  <p
                    className={`${
                      toggleSideBar ? "w-32" : "w-0"
                    } overflow-hidden`}
                  >
                    {item.name}
                  </p>

                  {toggleSideBar && item.inner && (
                    <div className="absolute flex flex-col gap-2 border z-50 transition-all w-[150px] md:w-[200px] left-[175px] md:left-[200px] invisible group-hover:visible text-center opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2  bg-card rounded-[5px] border-black p-3 top-1">
                      {item.inner.map((inner, index) => (
                        <Link
                          to={inner.path}
                          key={index}
                          className="hover:bg-black hover:text-card border p-1 rounded-[5px] border-black"
                        >
                          {inner.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </Link>

                {!toggleSideBar && (
                  <div
                    className={` absolute border z-50 transition-all left-[50px] invisible group-hover:visible text-center opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2 w-[120px] bg-card rounded-[5px] border-black p-1 top-1 uppercase`}
                  >
                    {item.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t-gray-300 border flex items-center gap-5  px-1 py-3">
          <img
            src={currentUser.avatar}
            alt="avatar.image"
            className={`w-[50px] border border-black rounded-full object-cover`}
          />
          <h1 className={` ${toggleSideBar ? "block" : "hidden"} `}>
            {currentUser.role} Dashboard
          </h1>
        </div>
      </div>
    </aside>
  );
}
