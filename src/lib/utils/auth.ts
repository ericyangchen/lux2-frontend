import { NextRouter } from "next/router";
import { clearApplicationCookies } from "./cookie";
import { toast } from "@/components/shadcn/ui/use-toast";

export const handleAuthError = (router: NextRouter) => {
  toast({
    title: "權限驗證失敗",
    description: "請重新登入",
    duration: 2500,
    variant: "destructive",
  });

  clearApplicationCookies();

  router.push("/login");
};
