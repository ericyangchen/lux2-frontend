import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  EnvelopeIcon,
  IdentificationIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  clearApplicationCookies,
  getApplicationCookies,
} from "@/lib/utils/cookie";

import { Badge } from "@/components/shadcn/ui/badge";
import Image from "next/image";
import { Label } from "@/components/shadcn/ui/label";
import Link from "next/link";
import { User } from "@/lib/types/user";
import { UserRoleDisplayNames } from "@/lib/constants/user";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { getCompanyName } from "@/lib/constants/common";
import { merchantNavigation } from "@/lib/utils/routes";
import { useNavigation } from "@/lib/hooks/useNavigation";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUser } from "@/lib/hooks/swr/user";

const UserDropdown = ({ user }: { user?: User }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    clearApplicationCookies();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors"
      >
        <UserIcon className="h-5 w-5 text-slate-600" />
        <span className="text-sm font-medium text-slate-700 hidden sm:block">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="p-4">
            <div className="p-2 border rounded-md pb-0 mb-4">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Badge>
                  <span className="max-w-[149px] truncate">{user.name}</span>
                </Badge>
                <Badge variant="outline">
                  {UserRoleDisplayNames[user.role]}
                </Badge>
              </div>
              <Badge variant="outline" className="bg-none border-none pl-0">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                <span className="max-w-[228px] truncate">{user.email}</span>
              </Badge>
              <Badge
                variant="outline"
                className="bg-none border-none cursor-pointer pl-0"
                onClick={() =>
                  copyToClipboard({
                    toast,
                    copyingText: user.id,
                    title: "已複製用戶 ID",
                  })
                }
              >
                <IdentificationIcon className="h-4 w-4 mr-2" />
                <span>{user.id}</span>
              </Badge>
            </div>

            <div className="p-2 border rounded-md mb-4">
              <div className="flex flex-wrap gap-2 items-center mb-1">
                <Label className="text-gray-500 text-sm">客服支援</Label>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  variant="outline"
                  className="bg-none border-none cursor-pointer pl-0 flex gap-1"
                  onClick={() => {
                    window.open("https://t.me/smpay1688869");
                  }}
                >
                  <Image src="/telegram.png" width={16} height={16} alt="" />
                  <span className="max-w-[216px] truncate">客訴專線 1</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-none border-none cursor-pointer pl-0 flex gap-1"
                  onClick={() => {
                    window.open("https://t.me/SM_BOSS01");
                  }}
                >
                  <Image src="/telegram.png" width={16} height={16} alt="" />
                  <span className="max-w-[216px] truncate">客訴專線 2</span>
                </Badge>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-gray-700 hover:bg-gray-100 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer border"
            >
              <ArrowLeftStartOnRectangleIcon
                aria-hidden="true"
                className="text-gray-400 h-6 w-6 shrink-0"
              />
              登出
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default function MerchantNavigationHeader() {
  const { currentNavigation } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const { organizationId } = getApplicationCookies();
  const { organization } = useOrganization({ organizationId });
  const { user } = useUser();

  return (
    <>
      <header className="bg-white border-b border-gray-100">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-slate-900 text-white rounded-md">
                <span className="font-medium text-lg">{getCompanyName()}</span>
              </div>
              {organization && (
                <div className="hidden sm:block">
                  <span className="text-sm text-slate-600 font-medium">
                    {organization.name}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {merchantNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    currentNavigation?.href === item.href
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150"
                  )}
                >
                  <item.icon
                    className={classNames(
                      currentNavigation?.href === item.href
                        ? "text-slate-700"
                        : "text-slate-500",
                      "h-4 w-4 mr-2"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* User dropdown for desktop */}
              <div className="hidden md:block">
                <UserDropdown user={user} />
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden -m-2 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="relative z-50 md:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon
                    aria-hidden="true"
                    className="h-6 w-6 text-white"
                  />
                </button>
              </div>
            </TransitionChild>

            <div className="flex grow flex-col gap-y-2 overflow-y-auto bg-white px-4 py-4">
              <div className="flex h-14 shrink-0 items-center justify-center">
                <div className="px-4 py-1 bg-blue-900 text-white rounded-lg">
                  <span className="font-bold text-xl">{getCompanyName()}</span>
                </div>
              </div>

              {organization && (
                <div className="text-xs font-medium leading-6 text-gray-400 mb-4">
                  單位: {organization.name}
                </div>
              )}

              <nav className="flex flex-1 flex-col">
                <ul role="list" className="space-y-1">
                  {merchantNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          currentNavigation?.href === item.href
                            ? "bg-gray-100 text-blue-800"
                            : "text-gray-700 hover:bg-gray-100",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            currentNavigation?.href === item.href
                              ? "text-blue-800"
                              : "text-gray-400",
                            "h-6 w-6 shrink-0"
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Mobile user info and logout */}
              {user && (
                <div className="flex flex-col gap-2 py-2 border-t border-gray-200">
                  <div className="p-2 border rounded-md pb-0">
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <Badge>
                        <span className="max-w-[149px] truncate">
                          {user.name}
                        </span>
                      </Badge>
                      <Badge variant="outline">
                        {UserRoleDisplayNames[user.role]}
                      </Badge>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-none border-none pl-0"
                    >
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <span className="max-w-[228px] truncate">
                        {user.email}
                      </span>
                    </Badge>
                  </div>

                  <div className="p-2 border rounded-md">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <Label className="text-gray-500 text-sm">客服支援</Label>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge
                        variant="outline"
                        className="bg-none border-none cursor-pointer pl-0 flex gap-1"
                        onClick={() => {
                          window.open("https://t.me/smpay1688869");
                        }}
                      >
                        <Image
                          src="/telegram.png"
                          width={16}
                          height={16}
                          alt=""
                        />
                        <span className="max-w-[216px] truncate">
                          客訴專線 1
                        </span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-none border-none cursor-pointer pl-0 flex gap-1"
                        onClick={() => {
                          window.open("https://t.me/SM_BOSS01");
                        }}
                      >
                        <Image
                          src="/telegram.png"
                          width={16}
                          height={16}
                          alt=""
                        />
                        <span className="max-w-[216px] truncate">
                          客訴專線 2
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      clearApplicationCookies();
                      router.push("/login");
                    }}
                    className="text-gray-700 hover:bg-gray-100 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full cursor-pointer border"
                  >
                    <ArrowLeftStartOnRectangleIcon
                      aria-hidden="true"
                      className="text-gray-400 h-6 w-6 shrink-0"
                    />
                    登出
                  </button>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
