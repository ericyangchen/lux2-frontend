/**
 * Filters out null, undefined, and empty strings from a flat object (no nested objects/arrays)
 */
function filterEmptyFieldsForSigning(
  obj: Record<string, any>
): Record<string, any> {
  const filtered: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip null, undefined, or empty strings
    if (value === null || value === undefined || value === "") {
      continue;
    }

    // Keep all other values (strings, numbers, booleans, etc.)
    filtered[key] = value;
  }

  return filtered;
}

/**
 * Creates a transaction API signature (v2) using SHA256 hash.
 * This version filters out null, undefined, and empty strings before generating the signature.
 * Assumes flat object structure (no nested objects or arrays).
 *
 * Browser-compatible implementation using Web Crypto API.
 *
 * @param originalBody - The request body object (flat key-value pairs only)
 * @param secretKey - The secret key for signing
 * @returns The SHA256 hash signature as a hex string
 */
export async function createTxnApiSignV2(
  originalBody: Record<string, any>,
  secretKey: string
): Promise<string> {
  // Remove signature field if present (not included in signature calculation)
  const { signature: _, ...bodyWithoutSignature } = originalBody;

  // Filter out empty fields before signing
  const filteredBody = filterEmptyFieldsForSigning(bodyWithoutSignature);

  // Sort keys alphabetically and stringify
  // Note: Matching backend implementation exactly
  const sortedStringifiedBody = JSON.stringify(
    filteredBody,
    Object.keys(filteredBody).sort()
  );

  // Add secret key to the sorted stringified body
  const stringToSign = `${sortedStringifiedBody}${secretKey}`;

  // Use Web Crypto API for browser compatibility
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Helper function to get the filtered body, sorted stringified body, and string to sign
 * for debugging purposes.
 */
export function getSignatureV2DebugInfo(
  originalBody: Record<string, any>,
  secretKey: string
): {
  filteredBody: Record<string, any>;
  sortedStringifiedBody: string;
  stringToSign: string;
} {
  // Remove signature field if present
  const { signature: _, ...bodyWithoutSignature } = originalBody;

  // Filter out empty fields
  const filteredBody = filterEmptyFieldsForSigning(bodyWithoutSignature);

  // Sort keys alphabetically and stringify
  // Note: Matching backend implementation exactly
  const sortedStringifiedBody = JSON.stringify(
    filteredBody,
    Object.keys(filteredBody).sort()
  );

  // Create string to sign
  const stringToSign = `${sortedStringifiedBody}${secretKey}`;

  return {
    filteredBody,
    sortedStringifiedBody,
    stringToSign,
  };
}
