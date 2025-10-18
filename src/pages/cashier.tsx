import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function CashierPage() {
  const searchParams = useSearchParams();
  const [isBlocked, setIsBlocked] = useState(false);
  const hasTriedRef = useRef(false);
  const error = searchParams.get("error");
  const amount = searchParams.get("amount");

  // Format amount to always show 2 decimal places
  const formattedAmount = amount ? Number(amount).toFixed(2) : "0.00";

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
    if (hasTriedRef.current) {
      return;
    }

    const paymentUrl = searchParams.get("paymentUrl");

    if (paymentUrl && !error) {
      hasTriedRef.current = true;
      const newWindow = window.open(paymentUrl, "_blank");

      if (!newWindow) {
        setIsBlocked(true);
      } else {
        tryClose();
      }
    }
  }, [searchParams, error]);

  // Show error page if error param is present
  if (error === "system-busy") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Blue Section */}
        <div className="bg-[#0057E6] pt-16 pb-[6.75rem]">
          {/* GCash Logo */}
          <div className="w-full flex justify-center">
            <Image
              src="/gcash_logo.png"
              alt="GCash"
              width={120}
              height={32}
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* White Section */}
        <div className="flex-1 bg-[#F8F9FD]">
          <div className="-mt-[5.5rem]">
            {/* Main Card */}
            <div className="w-full px-6 flex justify-center">
              <div className="w-full max-w-[360px] md:max-w-[480px] lg:max-w-[560px] bg-white rounded-md shadow-sm">
                {/* Amount Section with full-width background */}
                <div className="bg-[#F8F9FD] rounded-t-md">
                  <div className="max-w-[360px] mx-auto w-full p-4">
                    <div className="text-[#8E96A6] text-base mb-1">
                      Amount Due
                    </div>
                    <div className="text-[#0057E6] text-xl font-medium flex items-center gap-1">
                      <span>PHP</span>
                      <span>{formattedAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message Section - replaces NEXT button */}
                <div className="max-w-[360px] mx-auto w-full">
                  <div className="p-6 space-y-4">
                    {/* Error Icon */}
                    <div className="text-red-500 flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-16 h-16"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.174 3.35 1.9 3.35h13.713c1.726 0 2.766-1.85 1.9-3.35L13.713 2.25c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                    </div>

                    {/* Error Title */}
                    <h2 className="text-[#1A1C21] text-xl font-bold text-center">
                      系統繁忙 / System Busy
                    </h2>

                    {/* Error Message */}
                    <p className="text-[#6B7280] text-base text-center">
                      請稍後重新提交支付請求 / Please submit payment request
                      again
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-[#0057E6]">
            <span className="text-[#6B7280]">
              Don&apos;t have a GCash account?{" "}
            </span>
            <a
              href="https://www.gcash.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Register now
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Original redirect behavior for backward compatibility
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
