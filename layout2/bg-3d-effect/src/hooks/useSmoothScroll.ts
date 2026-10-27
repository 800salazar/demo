import { useEffect } from "react";
// @ts-ignore  // optional if you added the .d.ts file
import SmoothScroll from "smoothscroll-for-websites";

export default function useSmoothScroll(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    SmoothScroll({
      animationTime: 1500,
      stepSize: 100,
      accelerationDelta: 50,
      accelerationMax: 3,
      keyboardSupport: true,
      arrowScroll: 50,
      touchpadSupport: true,
    });

    return () => {
      document.body.style.scrollBehavior = "auto";
    };
  }, []);
}
