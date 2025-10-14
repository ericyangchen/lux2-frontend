import { NextRouter } from "next/router";
import { clearApplicationCookies } from "./cookie";
import { refreshAccessToken } from "./tokenRefresh";
import { toast } from "@/components/shadcn/ui/use-toast";

export const handleAuthError = async (
  router: NextRouter,
  retry?: () => Promise<void>
) => {
  // Try to refresh the token first
  const newAccessToken = await refreshAccessToken();

  if (newAccessToken) {
    // Token refreshed successfully, retry the original request if provided
    if (retry) {
      try {
        await retry();
        return;
      } catch (error) {
        // Retry failed, continue with logout
      }
    } else {
      // Token refreshed, no retry needed
      return;
    }
  }

  // Token refresh failed or retry failed, logout user
  toast({
    title: "權限驗證失敗",
    description: "請重新登入",
    duration: 2500,
    variant: "destructive",
  });

  clearApplicationCookies();

  router.push("/login");
};
