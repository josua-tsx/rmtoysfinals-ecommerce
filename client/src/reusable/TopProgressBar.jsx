import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";

export default function TopProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let interval;
    if (navigation.state === "loading") {
      setIsVisible(true);
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + (100 - prev) * 0.1;
        });
      }, 200);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => clearInterval(interval);
  }, [navigation.state]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none">
      <div
        className="h-1 bg-indigo-600 transition-all duration-300 ease-out shadow-[0_0_10px_2px_rgba(79,70,229,0.5)]"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute right-0 top-0 h-1 w-[100px] bg-indigo-400 blur-md animate-pulse opacity-50" />
    </div>
  );
}
