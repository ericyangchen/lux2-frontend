import {
  createTxnApiSign,
  getSignatureDebugInfo,
} from "@/lib/utils/txn-api-sign";

import { useState } from "react";

export default function TestSignaturePage() {
  const [requestBody, setRequestBody] = useState(`{}`);

  const [secretKey, setSecretKey] = useState(
    "abc123def456ghi789jkl012mno345pq"
  );
  const [generatedSignature, setGeneratedSignature] = useState("");
  const [debugInfo, setDebugInfo] = useState({
    sortedStringifiedBody: "",
    stringToSign: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Validation section
  const [callbackBody, setCallbackBody] = useState("");
  const [validationSecretKey, setValidationSecretKey] = useState("");
  const [validationResult, setValidationResult] = useState<{
    providedSignature: string;
    calculatedSignature: string;
    isValid: boolean;
    debugInfo: { sortedStringifiedBody: string; stringToSign: string };
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const generateSignature = async () => {
    try {
      setIsGenerating(true);
      setError("");

      const bodyObj = JSON.parse(requestBody);
      const signature = await createTxnApiSign(bodyObj, secretKey);
      const debug = getSignatureDebugInfo(bodyObj, secretKey);

      setGeneratedSignature(signature);
      setDebugInfo(debug);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate signature"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const validateSignature = async () => {
    try {
      setIsValidating(true);
      setError("");

      const bodyObj = JSON.parse(callbackBody);
      const providedSignature = bodyObj.signature || "";

      // Remove signature field for calculation
      const { signature, ...bodyWithoutSignature } = bodyObj;

      const calculatedSignature = await createTxnApiSign(
        bodyWithoutSignature,
        validationSecretKey
      );
      const debugInfo = getSignatureDebugInfo(
        bodyWithoutSignature,
        validationSecretKey
      );

      setValidationResult({
        providedSignature,
        calculatedSignature,
        isValid: providedSignature === calculatedSignature,
        debugInfo,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate signature"
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Transaction API Signature Test
        </h1>
        <p className="text-gray-600">
          Generate and validate transaction API signatures
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signature Generation Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Signature</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-80 p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Enter JSON request body..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Secret Key
              </label>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter your secret key..."
              />
            </div>

            <button
              onClick={generateSignature}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Signature"}
            </button>
          </div>

          {/* Results */}
          {generatedSignature && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Generated Signature
                </label>
                <div className="bg-gray-50 p-3 rounded-md border font-mono text-sm break-all">
                  {generatedSignature}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sorted Stringified Body
                </label>
                <div className="bg-gray-50 p-3 rounded-md border font-mono text-sm break-all">
                  {debugInfo.sortedStringifiedBody}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  String to Sign
                </label>
                <div className="bg-gray-50 p-3 rounded-md border font-mono text-sm break-all">
                  {debugInfo.stringToSign}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Final Signed Request Body
                </label>
                <pre className="bg-gray-50 p-3 rounded-md border font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(
                    {
                      ...JSON.parse(requestBody),
                      signature: generatedSignature,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Signature Validation Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Validate Callback Signature
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Callback Request Body (JSON with signature)
              </label>
              <textarea
                value={callbackBody}
                onChange={(e) => setCallbackBody(e.target.value)}
                className="w-full h-80 p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder='Enter callback body with signature field, e.g. {"id":"123","signature":"abc..."}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Secret Key for Validation
              </label>
              <input
                type="text"
                value={validationSecretKey}
                onChange={(e) => setValidationSecretKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter your secret key..."
              />
            </div>

            <button
              onClick={validateSignature}
              disabled={isValidating}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isValidating ? "Validating..." : "Validate Signature"}
            </button>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Provided Signature in callback request body
                </label>
                <div className="bg-gray-50 p-3 rounded-md border font-mono text-sm break-all">
                  {validationResult.providedSignature}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sorted Stringified Body
                </label>
                <div className="bg-gray-50 p-3 rounded-md border font-mono text-sm break-all">
                  {validationResult.debugInfo.sortedStringifiedBody}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  String to Sign
                </label>
                <div className="bg-gray-50 p-3 rounded-md border font-mono text-sm break-all">
                  {validationResult.debugInfo.stringToSign}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Calculated Signature
                </label>
                <div className="bg-gray-50 p-3 rounded-md border font-mono text-sm break-all">
                  {validationResult.calculatedSignature}
                </div>
              </div>

              <div
                className={`p-4 rounded-md ${
                  validationResult.isValid
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-semibold ${
                    validationResult.isValid ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {validationResult.isValid
                    ? "✅ Signature Valid"
                    : "❌ Signature Invalid"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
