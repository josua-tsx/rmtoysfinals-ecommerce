import Hero from "../components/Hero";
import Faq from "../components/Faq";
import EmailSubscriptionComponent from "../components/EmailSubscriptionComponent";
import OrderHistory from "../components/OrderHistory";

export default function LandingPage() {
  return (
    <div className="flex flex-col h-full ">
      <Hero />
      <Faq />
      <EmailSubscriptionComponent />
    </div>
  );
}
