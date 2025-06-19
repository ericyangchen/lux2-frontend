import { useEffect, useState } from "react";

import { allNavigation } from "../utils/routes";
import { useRouter } from "next/router";

export const useNavigation = () => {
  const router = useRouter();

  const [currentNavigation, setCurrentNavigation] =
    useState<Record<any, any>>();

  useEffect(() => {
    const currentPathname = router.pathname;

    const currentNavigation = allNavigation.find((item) =>
      currentPathname.startsWith(item.href)
    );

    setCurrentNavigation(currentNavigation);
  }, [currentNavigation, router.pathname]);

  return {
    currentNavigation,
  };
};
