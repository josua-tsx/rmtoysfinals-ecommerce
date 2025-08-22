import Hero from "../components/Hero";
import Faq from "../components/Faq";
import EmailSubscriptionComponent from "../components/EmailSubscriptionComponent";
import OrderHistory from "../components/OrderHistory";
import FreeCredits from "../components/FreeCredits";

export default function LandingPage() {
  return (
    <div className="flex flex-col h-full relative">
      <Hero />
      <FreeCredits/>
      <Faq />
      <EmailSubscriptionComponent />
    </div>
  );
}
  