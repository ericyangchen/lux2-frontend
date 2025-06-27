import { useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

export default function RedirectPage() {
  const searchParams = useSearchParams();
  const [isBlocked, setIsBlocked] = useState(false);
  const hasTriedRef = useRef(false);

  const tryClose = () => {
    setTimeout(() => {
      window.close();
      self.close();
      const win = window.open("", "_self");
      if (win) win.close();
    }, 500);
  };

  // Try automatic open only once when component mounts
  useEffect(() => {
    console.log("Effect running, hasTriedRef:", hasTriedRef.current);

    if (hasTriedRef.current) {
      console.log("Already tried opening, skipping");
      return;
    }

    const paymentUrl = searchParams.get("paymentUrl");
    console.log("Got paymentUrl:", paymentUrl);

    if (paymentUrl) {
      hasTriedRef.current = true;
      const newWindow = window.open(paymentUrl, "_blank");
      console.log("Window open result:", newWindow ? "success" : "blocked");

      if (!newWindow) {
        setIsBlocked(true);
      } else {
        tryClose();
      }
    }
  }, [searchParams]);

  // Only show button if automatic open was blocked
  if (!isBlocked) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <button
        onClick={() => {
          const paymentUrl = searchParams.get("paymentUrl");
          if (paymentUrl) {
            const newWindow = window.open(paymentUrl, "_blank");
            if (newWindow) {
              tryClose();
            }
          }
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Open Payment Page
      </button>
    </div>
  );
}
