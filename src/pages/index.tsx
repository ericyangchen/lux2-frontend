import Head from "next/head";
import { companyName } from "@/lib/constants";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return null;
}
