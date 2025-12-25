import { HiShoppingBag } from "react-icons/hi2";
import { AiFillFire } from "react-icons/ai";
import { IoMdContacts } from "react-icons/io";
import { MdReviews } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";


export const navItems = [
    { name: "Shop", path: "/shop", icon: HiShoppingBag },
    { name: "Popular", path: "/popular", icon: AiFillFire },
    { name: "Contacts", path: "/contact", icon: IoMdContacts },
    { name: "Reviews", path: "/reviews", icon: MdReviews },
    { name: "Tracker", path: "/tracker", icon: TbTruckDelivery },
    { name: "Support", path: "/my-tickets", icon: BiSupport },
];