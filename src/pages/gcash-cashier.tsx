import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function GCashCashierPage() {
  const searchParams = useSearchParams();
  const [isBlocked, setIsBlocked] = useState(false);
  const hasTriedRef = useRef(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const amount = searchParams.get("amount");

  // Format amount to always show 2 decimal places
  const formattedAmount = amount ? Number(amount).toFixed(2) : "0.00";

  // Validate phone number format
  const isValidPhoneNumber = (number: string) => {
    // Remove any spaces or non-digit characters
    const cleanNumber = number.replace(/\D/g, "");

    // Case 1: 10 digits starting with 9
    const isValid10Digit = /^9\d{9}$/.test(cleanNumber);

    // Case 2: 11 digits starting with 09
    const isValid11Digit = /^09\d{9}$/.test(cleanNumber);

    return isValid10Digit || isValid11Digit;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "");

    // If starts with 0, allow 11 digits max
    if (digitsOnly.startsWith("0")) {
      setMobileNumber(digitsOnly.slice(0, 11));
    }
    // If doesn't start with 0, allow 10 digits max
    else {
      setMobileNumber(digitsOnly.slice(0, 10));
    }
  };

  const isPhoneValid = isValidPhoneNumber(mobileNumber);

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

  const handleNext = () => {
    const paymentUrl = searchParams.get("paymentUrl");
    if (paymentUrl) {
      const newWindow = window.open(paymentUrl, "_blank");
      if (newWindow) {
        tryClose();
      }
    }
  };

  // Only show button if automatic open was blocked
  if (!isBlocked) {
    return null;
  }

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

              {/* Login Section */}
              <div className="max-w-[360px] mx-auto w-full">
                <div className="p-6 space-y-6">
                  {/* <h2 className="text-[#1A1C21] text-lg font-bold">
                    Login to pay with GCash
                  </h2> */}

                  {/* Phone Input */}
                  {/* <div className="border-b border-[#E5E7EB] flex items-center pb-2">
                    <span className="text-[#6B7280] pr-2 border-r border-[#E5E7EB]">
                      +63
                    </span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="Mobile number"
                      className="flex-1 ml-2 outline-none text-base text-[#1A1C21] placeholder:text-[#D1D5DB]"
                    />
                  </div> */}

                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    // disabled={!isPhoneValid}
                    // className={`w-full py-3 rounded-full text-base transition-colors ${
                    //   isPhoneValid
                    //     ? "bg-[#0057E6] text-white hover:bg-[#0046B8] cursor-pointer"
                    //     : "bg-[#9EC1FF] text-white cursor-not-allowed"
                    // }`}
                    className={
                      "w-full py-3 rounded-full text-base transition-colors bg-[#0057E6] text-white hover:bg-[#0046B8] cursor-pointer"
                    }
                  >
                    NEXT
                  </button>
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
