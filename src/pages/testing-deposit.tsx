import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function TestingDepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!transactionId) {
      setStatus("failed");
      setMessage("Transaction ID is required");
      return;
    }

    // Simulate a successful payment after a short delay
    const timer = setTimeout(() => {
      setStatus("success");
      setMessage("Test payment completed successfully");
    }, 2000);

    return () => clearTimeout(timer);
  }, [transactionId]);

  if (status === "failed") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Blue Section */}
        <div className="bg-[#0057E6] pt-16 pb-[6.75rem]">
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
            <div className="w-full px-6 flex justify-center">
              <div className="w-full max-w-[360px] md:max-w-[480px] lg:max-w-[560px] bg-white rounded-md shadow-sm">
                <div className="bg-[#F8F9FD] rounded-t-md">
                  <div className="max-w-[360px] mx-auto w-full p-4">
                    <div className="text-[#8E96A6] text-base mb-1">
                      Testing Account Deposit
                    </div>
                  </div>
                </div>

                <div className="max-w-[360px] mx-auto w-full">
                  <div className="p-6 space-y-4">
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

                    <h2 className="text-[#1A1C21] text-xl font-bold text-center">
                      Error
                    </h2>

                    <p className="text-[#6B7280] text-base text-center">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Blue Section */}
        <div className="bg-[#0057E6] pt-16 pb-[6.75rem]">
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
            <div className="w-full px-6 flex justify-center">
              <div className="w-full max-w-[360px] md:max-w-[480px] lg:max-w-[560px] bg-white rounded-md shadow-sm">
                <div className="bg-[#F8F9FD] rounded-t-md">
                  <div className="max-w-[360px] mx-auto w-full p-4">
                    <div className="text-[#8E96A6] text-base mb-1">
                      Testing Account Deposit
                    </div>
                    <div className="text-[#0057E6] text-xl font-medium">
                      Transaction ID: {transactionId}
                    </div>
                  </div>
                </div>

                <div className="max-w-[360px] mx-auto w-full">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0057E6]"></div>
                    </div>

                    <h2 className="text-[#1A1C21] text-xl font-bold text-center">
                      Processing Test Payment
                    </h2>

                    <p className="text-[#6B7280] text-base text-center">
                      This is a testing account. The payment will be
                      automatically completed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex flex-col">
      {/* Blue Section */}
      <div className="bg-[#0057E6] pt-16 pb-[6.75rem]">
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
          <div className="w-full px-6 flex justify-center">
            <div className="w-full max-w-[360px] md:max-w-[480px] lg:max-w-[560px] bg-white rounded-md shadow-sm">
              <div className="bg-[#F8F9FD] rounded-t-md">
                <div className="max-w-[360px] mx-auto w-full p-4">
                  <div className="text-[#8E96A6] text-base mb-1">
                    Testing Account Deposit
                  </div>
                  <div className="text-[#0057E6] text-xl font-medium">
                    Transaction ID: {transactionId}
                  </div>
                </div>
              </div>

              <div className="max-w-[360px] mx-auto w-full">
                <div className="p-6 space-y-4">
                  <div className="text-green-500 flex justify-center">
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
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-[#1A1C21] text-xl font-bold text-center">
                    Test Payment Successful
                  </h2>

                  <p className="text-[#6B7280] text-base text-center">
                    {message}
                  </p>

                  <p className="text-[#6B7280] text-sm text-center mt-4">
                    This is a testing account. No actual payment was processed.
                  </p>

                  <button
                    onClick={() => {
                      window.close();
                    }}
                    className="w-full mt-6 bg-[#0057E6] text-white py-3 rounded-md font-medium hover:bg-[#0047B3] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
