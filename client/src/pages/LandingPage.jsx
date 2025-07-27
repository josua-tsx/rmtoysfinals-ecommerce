import Hero from "../components/Hero";
import Faq from "../components/Faq";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Faq />
    </div>
  );
}
