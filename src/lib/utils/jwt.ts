/**
 * Decode JWT without verification (client-side only, for checking expiry)
 */
export const decodeJwt = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if JWT is expired
 * Returns true if expired or invalid
 */
export const isJwtExpired = (token: string): boolean => {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expiryTime = decoded.exp * 1000;
  const now = Date.now();

  // Consider expired if within 30 seconds of expiry (buffer for network latency)
  return now >= expiryTime - 30000;
};
