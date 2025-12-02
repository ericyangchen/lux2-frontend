import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  EnvelopeIcon,
  IdentificationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  adminNavigation,
  developerNavigation,
  merchantNavigation,
} from "@/lib/utils/routes";
import {
  clearApplicationCookies,
  getApplicationCookies,
} from "@/lib/utils/cookie";

import { Badge } from "@/components/shadcn/ui/badge";
import Head from "next/head";
import Image from "next/image";
import { Label } from "@/components/shadcn/ui/label";
import Link from "next/link";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { User } from "@/lib/types/user";
import { UserRole } from "@/lib/enums/users/user-role.enum";
import { UserRoleDisplayNames } from "@/lib/constants/user";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { getCompanyName } from "@/lib/constants/common";
import { useNavigation } from "@/lib/hooks/useNavigation";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUser } from "@/lib/hooks/swr/user";

const UserInfo = ({ user }: { user?: User }) => {
  const { toast } = useToast();

  if (!user) return null;

  return (
    <div className="p-2 border rounded-md pb-0">
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Badge>
          <span className="max-w-[149px] truncate">{user.name}</span>
        </Badge>
        <Badge variant="outline">{UserRoleDisplayNames[user.role]}</Badge>
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
  );
};

const CustomerServiceSupportInfo = () => {
  return (
    <div className="p-2 border rounded-md">
      <div className="flex flex-wrap gap-2 items-center mb-1">
        <Label className="text-gray-500 text-sm">客服支援</Label>
      </div>
      {/* Telegram link */}
      <div className="flex flex-wrap gap-2 items-center">
        <Badge
          variant="outline"
          className="bg-none border-none cursor-pointer pl-0 flex gap-1"
          onClick={() => {
            // TODO: add telegram customer service account
            // window.open("https://t.me/");
          }}
        >
          <Image src="/telegram.png" width={16} height={16} alt="" />
          <span className="max-w-[216px] truncate">客訴專線</span>
        </Badge>
      </div>
    </div>
  );
};

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentNavigation } = useNavigation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { organizationId } = getApplicationCookies();
  const { organization } = useOrganization({ organizationId });
  const { user } = useUser();

  const isMerchant = organization?.type === OrgType.MERCHANT;
  const isAdmin = organization?.type === OrgType.ADMIN;
  const isDeveloper = isAdmin && user?.role === UserRole.DEVELOPER;

  const router = useRouter();

  const handleLogout = () => {
    clearApplicationCookies();
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>
          {currentNavigation?.name
            ? `${currentNavigation.name} - ${getCompanyName()}`
            : getCompanyName()}
        </title>
      </Head>
      <div className="h-screen">
        {/* Desktop: Sidebar */}
        <div className="h-full hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-2 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="flex h-14 shrink-0 items-center justify-center">
              <div className="px-8 py-1 bg-white text-white rounded-lg w-full h-full">
                {/* <span className="font-bold text-xl">{getCompanyName()}</span> */}
                <div className="w-full h-full br-green-500">
                  <Image
                    src="/aapay-logo-horizontal.jpg"
                    alt="AApay"
                    width={1024}
                    height={552}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                {/* merchant navigation */}
                <li hidden={!isMerchant}>
                  <div className="text-xs font-medium leading-6 text-gray-400">
                    單位: {organization?.name}
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
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
                </li>

                {/* admin navigation */}
                <li hidden={!isAdmin}>
                  <div className="text-xs font-medium leading-6 text-gray-400">
                    單位: {organization?.name}
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {adminNavigation.map((item, index) => {
                      if (item.type === "category") {
                        return (
                          <li
                            key={`category-${index}`}
                            className="mt-4 first:mt-0"
                          >
                            <div className="text-xs font-medium leading-6 text-gray-500 px-2">
                              {item.label}
                            </div>
                          </li>
                        );
                      }
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={classNames(
                              currentNavigation?.href === item.href
                                ? "bg-gray-100 text-blue-800"
                                : "text-gray-700 hover:bg-gray-100",
                              "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full"
                            )}
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
                      );
                    })}
                  </ul>
                </li>

                {/* developer navigation */}
                <li hidden={!isDeveloper}>
                  <div className="text-xs font-semibold leading-6 text-gray-400">
                    Developer
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {developerNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            currentNavigation?.href === item.href
                              ? "bg-gray-100 text-blue-800"
                              : "text-gray-700 hover:bg-gray-100",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full"
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              currentNavigation?.href === item.href
                                ? "text-blue-8000"
                                : "text-gray-400",
                              "h-6 w-6 shrink-0"
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-2 border-r border-gray-200 bg-white px-2 py-4 h-fit">
            <UserInfo user={user} />
            <div
              className="text-gray-700 hover:bg-gray-100 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full cursor-pointer border"
              onClick={handleLogout}
            >
              <ArrowLeftStartOnRectangleIcon
                aria-hidden="true"
                className={"text-gray-400 h-6 w-6 shrink-0"}
              />
              登出
            </div>
            {/* <CustomerServiceSupportInfo /> */}
          </div>
        </div>

        {/* Mobile: Sidebar Menu */}
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
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
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>

              <div className="flex grow flex-col gap-y-2 overflow-y-auto bg-white px-4 py-4">
                <div className="flex h-14 shrink-0 items-center justify-center">
                  <div className="px-2 py-1 bg-white text-white rounded-lg w-full h-full">
                    {/* <span className="font-bold text-xl">{getCompanyName()}</span> */}
                    <div className="w-full h-full br-green-500">
                      <Image
                        src="/aapay-logo-horizontal.jpg"
                        alt="AApay"
                        width={1024}
                        height={552}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    {/* merchant navigation */}
                    <li hidden={!isMerchant}>
                      <div className="text-xs font-medium leading-6 text-gray-400">
                        單位: {organization?.name}
                      </div>
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
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
                                onClick={() => {
                                  // router.push(item.href);
                                  setSidebarOpen(false);
                                }}
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
                      </li>
                    </li>

                    {/* admin navigation */}
                    <li hidden={!isAdmin}>
                      <div className="text-xs font-medium leading-6 text-gray-400">
                        單位: {organization?.name}
                      </div>
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {adminNavigation.map((item, index) => {
                            if (item.type === "category") {
                              return (
                                <li
                                  key={`category-${index}`}
                                  className="mt-4 first:mt-0"
                                >
                                  <div className="text-xs font-medium leading-6 text-gray-500 px-2">
                                    {item.label}
                                  </div>
                                </li>
                              );
                            }
                            return (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className={classNames(
                                    currentNavigation?.href === item.href
                                      ? "bg-gray-100 text-blue-800"
                                      : "text-gray-700 hover:bg-gray-100",
                                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full"
                                  )}
                                  onClick={() => {
                                    setSidebarOpen(false);
                                  }}
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
                            );
                          })}
                        </ul>
                      </li>
                    </li>

                    {/* developer navigation */}
                    <li hidden={!isDeveloper}>
                      <div className="text-xs font-semibold leading-6 text-gray-400">
                        Developer - {organization?.name}
                      </div>
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {developerNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={classNames(
                                  currentNavigation?.href === item.href
                                    ? "bg-gray-100 text-blue-800"
                                    : "text-gray-700 hover:bg-gray-100",
                                  "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full"
                                )}
                                onClick={() => {
                                  setSidebarOpen(false);
                                }}
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
                      </li>
                    </li>
                  </ul>
                </nav>

                <div className="flex flex-col gap-2 bg-white py-2 h-fit">
                  <UserInfo user={user} />
                  <div
                    className="text-gray-700 hover:bg-gray-100 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full cursor-pointer border"
                    onClick={handleLogout}
                  >
                    <ArrowLeftStartOnRectangleIcon
                      aria-hidden="true"
                      className={"text-gray-400 h-6 w-6 shrink-0"}
                    />
                    登出
                  </div>
                  {/* <CustomerServiceSupportInfo /> */}
                </div>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Mobile: Topbar */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>

          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            {currentNavigation?.name}
          </div>
        </div>

        {/* Main */}
        <main className="py-4 lg:pl-72 h-[calc(100vh-56px)] sm:min-h-full overflow-y-scroll ">
          <div className="px-2 lg:px-4 h-full w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
