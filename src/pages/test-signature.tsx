import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  createTxnApiSign,
  getSignatureDebugInfo,
} from "@/lib/utils/txn-api-sign";

import { Button } from "@/components/shadcn/ui/button";
import { useState } from "react";

export default function TestSignaturePage() {
  const [requestBody, setRequestBody] = useState("{}");

  const [secretKey, setSecretKey] = useState("");
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
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatRequestBodyJson = () => {
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
      showToast("JSON formatted successfully!", "success");
    } catch (err) {
      showToast("Invalid JSON format");
    }
  };

  const formatCallbackBodyJson = () => {
    try {
      const parsed = JSON.parse(callbackBody);
      setCallbackBody(JSON.stringify(parsed, null, 2));
      showToast("JSON formatted successfully!", "success");
    } catch (err) {
      showToast("Invalid JSON format");
    }
  };

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
    <div className="w-full p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Transaction API Signature Test
        </h1>
        <p className="text-gray-600">
          Generate and validate transaction API signatures
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signature Generation Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Generate Signature for transaction API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Request Body (JSON)
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={formatRequestBodyJson}
                  className="text-xs"
                >
                  Format JSON
                </Button>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-80 p-3 border border-gray-300 rounded-md font-mono text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter JSON request body..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your secret key..."
              />
            </div>

            <Button
              onClick={generateSignature}
              disabled={isGenerating}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isGenerating ? "Generating..." : "Generate Signature"}
            </Button>

            {/* Results */}
            {generatedSignature && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Signature
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm break-all">
                    {generatedSignature}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sorted Stringified Body
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm break-all">
                    {debugInfo.sortedStringifiedBody}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    String to Sign
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm break-all">
                    {debugInfo.stringToSign}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Signed Request Body
                  </label>
                  <pre className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(
                      {
                        ...JSON.parse(requestBody),
                        sign: generatedSignature,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature Validation Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Validate Callback Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Callback Request Body (JSON with signature)
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={formatCallbackBodyJson}
                  className="text-xs"
                >
                  Format JSON
                </Button>
              </div>
              <textarea
                value={callbackBody}
                onChange={(e) => setCallbackBody(e.target.value)}
                className="w-full h-80 p-3 border border-gray-300 rounded-md font-mono text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder='Enter callback body with signature field, e.g. {"id":"123","signature":"abc..."}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key for Validation
              </label>
              <input
                type="text"
                value={validationSecretKey}
                onChange={(e) => setValidationSecretKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your secret key..."
              />
            </div>

            <Button
              onClick={validateSignature}
              disabled={isValidating}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {isValidating ? "Validating..." : "Validate Signature"}
            </Button>

            {/* Validation Results */}
            {validationResult && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provided Signature in callback request body
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm break-all">
                    {validationResult.providedSignature}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sorted Stringified Body
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm break-all">
                    {validationResult.debugInfo.sortedStringifiedBody}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    String to Sign
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm break-all">
                    {validationResult.debugInfo.stringToSign}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculated Signature
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-sm break-all">
                    {validationResult.calculatedSignature}
                  </div>
                </div>

                <Card
                  className={`${
                    validationResult.isValid
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <p
                      className={`font-semibold ${
                        validationResult.isValid
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {validationResult.isValid
                        ? "✅ Signature Valid"
                        : "❌ Signature Invalid"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
