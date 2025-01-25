import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import React, { useState } from "react";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import CopyText from "@/modules/common/CopyText";
import Head from "next/head";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Organization } from "@/lib/types/organization";
import { User } from "@/lib/types/user";
import { companyName } from "@/lib/constants";
import { getOrganizationBaseUrl } from "@/lib/routes";
import { loginApi } from "@/lib/apis/auth/login";
import { setApplicationCookies } from "@/lib/cookie";
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
    organization,
  }: {
    accessToken: string;
    user: User;
    organization: Organization;
  }) => {
    setApplicationCookies({
      userId: user.id,
      organizationId: organization.id,
      accessToken,
    });

    const organizationBaseUrl = getOrganizationBaseUrl(organization.type);

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

      const payload = {
        email,
        password,
        totpCode: twoFactorCode,
      };
      const response = await loginApi(payload);

      if (!response.ok) {
        const errorData = await response.json();

        throw new ApplicationError(errorData);
      }

      // response ok
      const data = await response.json();

      const { accessToken, user, organization } = data;

      // Check if the response is valid
      if (!accessToken || !user || !organization) {
        const message = `Invalid server response: ${
          accessToken ? "" : "no accessToken"
        }${user ? "" : ", no user"}${organization ? "" : ", no organization"}`;

        toast({
          title: "500 - Login failed",
          description: message,
          variant: "destructive",
        });

        return;
      }

      // successful login, redirect
      handleLoginRedirect({ accessToken, user, organization });

      return;
    } catch (error) {
      const errorData = error as ApplicationError;

      // store unauthorized IP
      if (
        errorData.statusCode === 401 &&
        errorData.message.startsWith("Unauthorized Login IP")
      ) {
        const ip = errorData.message.split("Unauthorized Login IP:")[1].trim();
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
        <title>{companyName ? `Login - ${companyName}` : "Login"}</title>
      </Head>
      <div className="flex justify-center items-center w-full h-screen">
        <Card className="mx-auto w-[400px] max-w-md rounded-none md:rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex justify-center gap-2 items-center">
              <div className="px-2 py-1 bg-blue-900 text-white rounded-lg">
                {companyName}
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
