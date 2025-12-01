import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  createTxnApiSignV2,
  getSignatureV2DebugInfo,
} from "@/lib/utils/txn-api-sign-v2";

import { Button } from "@/components/shadcn/ui/button";
import { useState } from "react";
import copy from "copy-to-clipboard";

export default function V2SignatureGeneratorPage() {
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        channel: 1000,
        merchant_id: "",
        order_id: "",
        amt: "",
        name: "",
        email: "",
        phone: "",
        notify_url: "",
        redirect_url: "",
      },
      null,
      2
    )
  );

  const [apiKey, setApiKey] = useState("");
  const [generatedSignature, setGeneratedSignature] = useState("");
  const [debugInfo, setDebugInfo] = useState<{
    filteredBody: Record<string, any>;
    sortedStringifiedBody: string;
    stringToSign: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const showCopyFeedback = (field: string) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyToClipboard = (text: string, field: string) => {
    copy(text);
    showCopyFeedback(field);
  };

  const formatRequestBodyJson = () => {
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      setError("無效的 JSON 格式");
    }
  };

  const generateSignature = async () => {
    try {
      setIsGenerating(true);
      setError("");
      setGeneratedSignature("");
      setDebugInfo(null);

      const bodyObj = JSON.parse(requestBody);
      const signature = await createTxnApiSignV2(bodyObj, apiKey);
      const debug = getSignatureV2DebugInfo(bodyObj, apiKey);

      setGeneratedSignature(signature);
      setDebugInfo(debug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成簽名失敗");
    } finally {
      setIsGenerating(false);
    }
  };

  const getFinalSignedBody = () => {
    try {
      const bodyObj = JSON.parse(requestBody);
      return {
        ...bodyObj,
        signature: generatedSignature,
      };
    } catch {
      return {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            V2 API 簽名生成器
          </h1>
          <p className="text-sm text-gray-600">為 V2 交易 API 請求生成簽名</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-white rounded-t-xl">
              <CardTitle className="text-base font-medium text-gray-900">
                輸入
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    請求體 (JSON)
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={formatRequestBodyJson}
                    className="text-xs h-7"
                  >
                    格式化
                  </Button>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full h-80 p-3 border border-gray-300 rounded font-mono text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="輸入 JSON 請求體..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API 密鑰 (Secret Key)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                  placeholder="輸入您的 API 密鑰..."
                />
              </div>

              <Button
                onClick={generateSignature}
                disabled={isGenerating || !apiKey.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "生成中..." : "生成簽名"}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-white rounded-t-xl">
              <CardTitle className="text-base font-medium text-gray-900">
                輸出
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {generatedSignature ? (
                <>
                  {debugInfo && (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            過濾後的請求體 (已移除空欄位)
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(debugInfo.filteredBody, null, 2),
                                "filtered"
                              )
                            }
                            className="text-xs h-7"
                          >
                            {copiedField === "filtered" ? "已複製" : "複製"}
                          </Button>
                        </div>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto max-h-40 overflow-y-auto border border-gray-700">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(debugInfo.filteredBody, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            待簽名字串 (字典序排序 + JSON 序列化 + 串接
                            secretKey)
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(debugInfo.stringToSign, "string")
                            }
                            className="text-xs h-7"
                          >
                            {copiedField === "string" ? "已複製" : "複製"}
                          </Button>
                        </div>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs break-all border border-gray-700">
                          {debugInfo.stringToSign}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        生成的簽名 (SHA-256)
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(generatedSignature, "signature")
                        }
                        className="text-xs h-7"
                      >
                        {copiedField === "signature" ? "已複製" : "複製"}
                      </Button>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded font-mono text-sm break-all">
                      {generatedSignature}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        最終簽名後的請求體
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(getFinalSignedBody(), null, 2),
                            "final"
                          )
                        }
                        className="text-xs h-7"
                      >
                        {copiedField === "final" ? "已複製" : "複製"}
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto border border-gray-700">
                      <pre>{JSON.stringify(getFinalSignedBody(), null, 2)}</pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">
                    輸入請求體和 API 密鑰，然後點擊「生成簽名」
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
