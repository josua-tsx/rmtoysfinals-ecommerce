import { useState } from "react";
import ProfileComponent from "../components/ProfileComponent";

// import SettingComponent from "../components/SettingComponent";
import ChangeInfoComponent from "../components/ChangeInfoComponent";
import ShippingAddressComponent from "../components/ShippingAddressComponent";
// import WishListComponent from "../components/WishListComponent";
import OrderHistory from "../components/OrderHistory";
import FooterSection from "../components/FooterSection";

const MENU_ITEMS = [
  { name: "profile", label: "Profile", component: ProfileComponent },

  { name: "orderhistory", label: "Order History", component: OrderHistory },
  // { name: "mywishlist", label: "My Wishlist", component: WishListComponent },
  {
    name: "shippingaddress",
    label: "Shipping Address",
    component: ShippingAddressComponent,
  },
  {
    name: "changeinformation",
    label: "Change Information",
    component: ChangeInfoComponent,
  },
  // { name: "setting", label: "SETTING", component: SettingComponent },
];

export default function ProfilePage() {
  const [activeComponent, setActiveComponent] = useState("profile");

  const ActiveComponent =
    MENU_ITEMS.find((item) => item.name === activeComponent).component ||
    ProfileComponent;

  return (
    <section className="pt-[130px]  h-full bg-yellow p-3 font-main">
      <div className="max-w-[1280px]  mx-auto">
        <h1 className="text-4xl mb-5">MY PROFILE</h1>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="border h-full md:w-[300px] border-black p-2 bg-card rounded-[5px]">
            <ul className="flex flex-col gap-2 ">
              {MENU_ITEMS.map(({ name, label }) => (
                <li
                  key={name}
                  onClick={() => setActiveComponent(name)}
                  className={`cursor-pointer ${
                    activeComponent === name ? "bg-gray-300" : ""
                  } p-1`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <main className="flex-1 bg-card border rounded-[5px]  border-black p-4">
            <ActiveComponent setActiveComponent={setActiveComponent} />
          </main>
        </div>
      </div>
    </section>
  );
}
