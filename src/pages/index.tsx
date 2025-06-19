import Head from "next/head";
import { clearApplicationCookies } from "@/lib/utils/cookie";
import { companyName } from "@/lib/constants/common";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    clearApplicationCookies();
    router.push("/login");
  }, [router]);

  return null;
}
