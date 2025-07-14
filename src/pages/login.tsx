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
import Image from "next/image";
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
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const [unauthorizedIp, setUnauthorizedIp] = useState("");

  // Handle verification code input
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits

    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
    setTwoFactorCode(newDigits.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newDigits = [...codeDigits];
        digits.forEach((digit, i) => {
          if (i < 6) newDigits[i] = digit;
        });
        setCodeDigits(newDigits);
        setTwoFactorCode(newDigits.join(""));

        // Focus the last filled input or next empty one
        const lastIndex = Math.min(digits.length - 1, 5);
        const targetInput = document.getElementById(`code-${lastIndex}`);
        targetInput?.focus();
      });
    }
  };

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
      <div className="min-h-screen bg-white flex justify-center items-center p-4">
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-white text-black pb-8 pt-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg">
                  <Image
                    src="/smpay-logo.jpg"
                    alt="SMPay Logo"
                    width={88}
                    height={88}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-black">
                  {getCompanyName()}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-black font-medium">帳號</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-gray-300 bg-white text-black placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400 rounded-lg transition-colors"
                    placeholder="請輸入您的電子郵件"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-medium">密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-300 bg-white text-black placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400 rounded-lg transition-colors"
                    placeholder="請輸入您的密碼"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-medium">驗證碼</Label>
                  <div className="flex gap-3 justify-center">
                    {codeDigits.map((digit, index) => (
                      <Input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(
                            index,
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-semibold border-gray-300 bg-white text-black focus:border-gray-400 focus:ring-gray-400 rounded-lg transition-colors"
                        required
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    請輸入6位驗證碼
                  </p>
                </div>
                <Button
                  type="button"
                  className="w-full h-12 bg-white border-2 border-purple-500 text-black hover:bg-purple-50 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>登入中...</span>
                    </div>
                  ) : (
                    "登入"
                  )}
                </Button>
                {unauthorizedIp && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    <Label className="font-semibold text-red-600 flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>登入 IP 未授權</span>
                    </Label>
                    <CopyText text={unauthorizedIp} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
