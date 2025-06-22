import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import React, { useState } from "react";

import { ApiLogin } from "@/lib/apis/auth/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import CopyText from "@/modules/common/CopyText";
import Head from "next/head";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Organization } from "@/lib/types/organization";
import { User } from "@/lib/types/user";
import { getCompanyName } from "@/lib/constants/common";
import { getOrganizationBaseUrl } from "@/lib/utils/routes";
import { setApplicationCookies } from "@/lib/utils/cookie";
import { useRouter } from "next/router";
import { useToast } from "@/components/shadcn/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [unauthorizedIp, setUnauthorizedIp] = useState("");

  const handleLoginRedirect = ({
    accessToken,
    user,
  }: {
    accessToken: string;
    user: User;
  }) => {
    setApplicationCookies({
      userId: user.id,
      organizationId: user.organizationId,
      accessToken,
    });

    const organizationBaseUrl = getOrganizationBaseUrl(user.orgType);

    if (!organizationBaseUrl) {
      throw new ApplicationError({
        statusCode: 400,
        message: "Invalid organization type",
      });
    }

    router.push(organizationBaseUrl);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setUnauthorizedIp("");

      if (!email || !password) {
        toast({
          title: "400 - Login failed",
          description: "Email and password are required",
          variant: "destructive",
        });
        return;
      }

      const response = await ApiLogin({
        email,
        password,
        totpCode: twoFactorCode,
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new ApplicationError(errorData);
      }

      // response ok
      const data = await response.json();

      const { accessToken, user, totpRequired } = data;

      // Check if the response is valid
      if (!accessToken || !user) {
        toast({
          title: "500 - Login failed",
          description: "No accessToken or user",
          variant: "destructive",
        });

        return;
      }

      // successful login, redirect
      handleLoginRedirect({ accessToken, user });

      return;
    } catch (error) {
      const errorData = error as ApplicationError;

      // store unauthorized IP
      if (
        errorData.statusCode === 401 &&
        typeof errorData.message === "string" &&
        errorData.message.startsWith("Auth Error: IP not whitelisted for Login")
      ) {
        const ip = errorData.message
          .split("Auth Error: IP not whitelisted for Login:")[1]
          .split(" - (version:")[0]
          .trim();
        setUnauthorizedIp(ip);
      }

      toast({
        title: `${errorData.statusCode} - Login failed`,
        description: errorData.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>
          {getCompanyName() ? `Login - ${getCompanyName()}` : "Login"}
        </title>
      </Head>
      <div className="flex justify-center items-center w-full h-screen">
        <Card className="mx-auto w-[400px] max-w-md rounded-none md:rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex justify-center gap-2 items-center">
              <div className="px-2 py-1 bg-blue-900 text-white rounded-lg">
                {getCompanyName()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>帳號</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>密碼</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>驗證碼</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  required
                />
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={handleLogin}
                disabled={loading}
              >
                登入
              </Button>
              <div hidden={!unauthorizedIp}>
                <Label className="font-bold text-red-500">登入 IP 未授權</Label>
                <CopyText text={unauthorizedIp} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
