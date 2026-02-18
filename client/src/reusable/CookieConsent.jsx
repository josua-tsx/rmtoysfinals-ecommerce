import { useState, useEffect } from "react";
import { FaCookieBite } from "react-icons/fa";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-white border-t border-black flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-yellow-300 border border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <FaCookieBite size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-black text-lg uppercase">We use cookies!</h3>
          <p className="text-sm font-medium max-w-2xl">
            This website uses cookies to ensure you get the best experience and
            to keep you logged in. In Incognito mode, you must accept cookies to
            avoid authentication errors.
          </p>
        </div>
      </div>
      <button
        onClick={handleAccept}
        className="whitespace-nowrap px-6 py-3 bg-black text-white font-bold uppercase tracking-wider border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
      >
        I Understand
      </button>
    </div>
  );
}
