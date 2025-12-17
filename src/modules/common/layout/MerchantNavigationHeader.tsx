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

import Image from "next/image";
import Link from "next/link";
import { User } from "@/lib/types/user";
import { Role } from "@/lib/apis/roles/get";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { getCompanyName } from "@/lib/constants/common";
import { merchantNavigation } from "@/lib/utils/routes";
import { useNavigation } from "@/lib/hooks/useNavigation";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useRolesByOrganization } from "@/lib/hooks/swr/roles";
import { useUserRoles } from "@/lib/hooks/swr/user-roles";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUser } from "@/lib/hooks/swr/user";

const UserDropdown = ({ user }: { user?: User }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { organizationId } = getApplicationCookies();
  const { roles: userRoles } = useUserRoles({ userId: user?.id });

  const handleLogout = () => {
    clearApplicationCookies();
    router.push("/login");
  };

  const roleNames = useMemo(() => {
    if (!userRoles) return [];
    return userRoles.map((r: Role) => r.name);
  }, [userRoles]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
      >
        <UserIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900 hidden sm:block">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 z-50">
          <div className="p-4 space-y-4">
            <div className="space-y-2 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                </span>
                {roleNames.length > 0 && (
                  <span className="text-xs text-gray-500 px-2 py-0.5 border border-gray-200 rounded">
                    {roleNames.join(", ")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <EnvelopeIcon className="h-3.5 w-3.5" />
                <span className="max-w-[228px] truncate">{user.email}</span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard({
                    toast,
                    copyingText: user.id,
                    title: "已複製用戶 ID",
                  })
                }
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
              >
                <IdentificationIcon className="h-3.5 w-3.5" />
                <span>{user.id}</span>
              </button>
            </div>

            <div className="space-y-2 pb-4 border-b border-gray-200">
              <div className="text-xs font-medium text-gray-500">客服支援</div>
              <button
                onClick={() => {
                  // TODO: add telegram customer service account
                  // window.open("https://t.me/");
                }}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
              >
                <Image src="/telegram.png" width={14} height={14} alt="" />
                <span>客訴專線</span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-gray-900 hover:bg-gray-50 flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 rounded transition-colors"
            >
              <ArrowLeftStartOnRectangleIcon
                aria-hidden="true"
                className="text-gray-600 h-4 w-4"
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
  const { roles: userRoles } = useUserRoles({ userId: user?.id });

  const roleNames = useMemo(() => {
    if (!userRoles) return [];
    return userRoles.map((r: Role) => r.name);
  }, [userRoles]);

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="text-gray-900">
                {/* <span className="text-lg font-semibold tracking-tight">
                  {getCompanyName()}
                </span> */}
                <div className="h-12 flex items-center justify-center w-[100px]">
                  <Image
                    src="/luxpay-logo-horizontal.jpg"
                    alt="Logo"
                    width={1024}
                    height={552}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              </div>
              {organization && (
                <div className="hidden sm:block border-l border-gray-200 pl-6">
                  <span className="text-sm text-gray-600">
                    {organization.name}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {merchantNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    currentNavigation?.href === item.href
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900",
                    "inline-flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 border-transparent"
                  )}
                >
                  <item.icon
                    className={classNames(
                      currentNavigation?.href === item.href
                        ? "text-gray-900"
                        : "text-gray-500",
                      "h-4 w-4 mr-2"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* User dropdown for desktop */}
              <div className="hidden md:block">
                <UserDropdown user={user} />
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded transition-colors"
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

            <div className="flex grow flex-col overflow-y-auto bg-white px-4 py-6">
              <div className="flex h-16 shrink-0 items-center mb-6">
                {/* <span className="text-lg font-semibold text-gray-900">
                  {getCompanyName()}
                </span> */}

                <div className="px-2 py-1 bg-white text-white rounded-lg w-full h-full">
                  {/* <span className="font-bold text-xl">{getCompanyName()}</span> */}
                  <div className="w-full h-full br-green-500">
                    <Image
                      src="/luxpay-logo-horizontal.jpg"
                      alt="Logo"
                      width={1024}
                      height={552}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {organization && (
                <div className="text-xs text-gray-500 mb-6 pb-6 border-b border-gray-200">
                  {organization.name}
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
                            ? "text-gray-900 bg-gray-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            currentNavigation?.href === item.href
                              ? "text-gray-900"
                              : "text-gray-400",
                            "h-5 w-5"
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
                <div className="flex flex-col gap-4 pt-6 mt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                      {roleNames.length > 0 && (
                        <span className="text-xs text-gray-500 px-2 py-0.5 border border-gray-200 rounded">
                          {roleNames.join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <EnvelopeIcon className="h-3.5 w-3.5" />
                      <span className="max-w-[228px] truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500">
                      客服支援
                    </div>
                    <button
                      onClick={() => {
                        // TODO: add telegram customer service account
                        // window.open("https://t.me/");
                      }}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
                    >
                      <Image
                        src="/telegram.png"
                        width={14}
                        height={14}
                        alt=""
                      />
                      <span>客訴專線</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      clearApplicationCookies();
                      router.push("/login");
                    }}
                    className="w-full text-gray-900 hover:bg-gray-50 flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 rounded transition-colors"
                  >
                    <ArrowLeftStartOnRectangleIcon
                      aria-hidden="true"
                      className="text-gray-600 h-4 w-4"
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
