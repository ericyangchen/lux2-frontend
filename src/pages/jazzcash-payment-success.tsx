import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function JazzCashPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const statusParam = searchParams.get("status");
  const message = searchParams.get("message");
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    // Determine status from query parameter
    const normalizedStatus = statusParam?.toLowerCase();
    if (normalizedStatus === "success" || normalizedStatus === "completed") {
      setStatus("success");
    } else if (normalizedStatus === "failed") {
      setStatus("failed");
    } else {
      setStatus("pending");
    }
  }, [orderId, statusParam]);

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-white text-3xl font-bold mb-2">JazzCash</div>
            {orderId && (
              <div className="text-white/60 text-sm">Order ID: {orderId}</div>
            )}
          </div>

          <div className="bg-black border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-12 h-12 text-red-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-white text-2xl font-bold text-center">
                Payment Failed
              </h2>
              <p className="text-white/70 text-center text-sm leading-relaxed">
                {message ||
                  "Your payment could not be processed. Please try again or contact support."}
              </p>
            </div>

            <button
              onClick={() => {
                window.close();
              }}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors mt-6"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-white text-3xl font-bold mb-2">JazzCash</div>
            {orderId && (
              <div className="text-white/60 text-sm">Order ID: {orderId}</div>
            )}
          </div>

          <div className="bg-black border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
            </div>

            <div className="space-y-3">
              <h2 className="text-white text-2xl font-bold text-center">
                Processing Payment
              </h2>
              <p className="text-white/70 text-center text-sm leading-relaxed">
                Your payment is being processed. Please wait...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-white text-3xl font-bold mb-2">JazzCash</div>
          {orderId && (
            <div className="text-white/60 text-sm">Order ID: {orderId}</div>
          )}
        </div>

        <div className="bg-black border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#00A859]/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-12 h-12 text-[#00A859]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-white text-2xl font-bold text-center">
              Payment Successful
            </h2>
            <p className="text-white/70 text-center text-sm leading-relaxed">
              {message || "Your payment has been processed successfully."}
            </p>
          </div>

          <button
            onClick={() => {
              window.close();
            }}
            className="w-full bg-[#00A859] text-white py-3 rounded-lg font-semibold hover:bg-[#009048] transition-colors mt-6"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
