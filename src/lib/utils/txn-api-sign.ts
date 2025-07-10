// Browser-compatible signature generation using Web Crypto API
export async function createTxnApiSign(
  originalBody: Record<string, any>,
  secretKey: string
): Promise<string> {
  const sortedStringifiedBody = JSON.stringify(
    originalBody,
    Object.keys(originalBody).sort()
  );

  const stringToSign = `${sortedStringifiedBody}${secretKey}`;

  // Use Web Crypto API for browser compatibility
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to get the sorted stringified body and string to sign
export function getSignatureDebugInfo(
  originalBody: Record<string, any>,
  secretKey: string
): { sortedStringifiedBody: string; stringToSign: string } {
  const sortedStringifiedBody = JSON.stringify(
    originalBody,
    Object.keys(originalBody).sort()
  );
  const stringToSign = `${sortedStringifiedBody}${secretKey}`;

  return { sortedStringifiedBody, stringToSign };
}
