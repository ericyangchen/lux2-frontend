import {
  ArrowRightCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrgTypeDisplayNames } from "@/lib/constants/organization";
import { Organization } from "@/lib/types/organization";
import { classNames } from "@/lib/utils/classname-utils";

function flattenOrganizations(org: Organization, depth = 0) {
  let flatList = [{ ...org, depth }];
  if (org?.children) {
    org.children.forEach((child) => {
      flatList = flatList.concat(flattenOrganizations(child, depth + 1));
    });
  }
  return flatList;
}

export function OrganizationList({
  organization,
  selectedOrganizationId,
  setSelectedOrganizationId,
}: {
  organization: Organization;
  selectedOrganizationId?: string;
  setSelectedOrganizationId: (id: string) => void;
}) {
  const [expandedOrganizations, setExpandedOrganizations] = useState<
    Set<string>
  >(new Set());
  const [selectedType, setSelectedType] = useState<string | undefined>();

  const flatOrganizations = flattenOrganizations(organization);

  const toggleExpand = (id: string) => {
    setExpandedOrganizations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value);
    expandAll();
  };

  const expandAll = () => {
    const allIds = flatOrganizations.map((org) => org.id);
    const allIdsSet = new Set(allIds);

    if (expandedOrganizations != allIdsSet) {
      setExpandedOrganizations(allIdsSet);
    }
  };

  const shrinkAll = () => {
    setExpandedOrganizations(new Set());
  };

  // Filter organizations by type and expansion state
  const filteredOrganizations = flatOrganizations.filter((org) => {
    // Filter by selected type
    if (selectedType && org.type !== selectedType) {
      return false;
    }

    // Only display if the parent organization is expanded
    const parentIsExpanded = (id: string) => {
      const parent = flatOrganizations.find(
        (o) => o.children && o.children.some((child) => child.id === id)
      );
      if (!parent) return true;
      if (expandedOrganizations.has(parent.id)) {
        return parentIsExpanded(parent.id);
      }
      return false;
    };

    return parentIsExpanded(org.id);
  });

  // expand all initially
  useEffect(() => {
    if (!organization) {
      return;
    }

    if (selectedType === undefined) {
      const allIds = flatOrganizations.map((org) => org.id);
      const allIdsSet = new Set(allIds);

      if (expandedOrganizations != allIdsSet) {
        setExpandedOrganizations(allIdsSet);
        setSelectedType("");
      }
    }
  }, [expandedOrganizations, flatOrganizations, organization, selectedType]);

  if (!organization) {
    return;
  }

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {/* Type */}
        <div className="max-w-xs">
          <select
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
            value={selectedType || ""}
            onChange={handleTypeChange}
          >
            <option value="">所有單位</option>
            <option value={OrgType.ADMIN}>
              {OrgTypeDisplayNames[OrgType.ADMIN]}
            </option>
            <option value={OrgType.AGENT}>
              {OrgTypeDisplayNames[OrgType.AGENT]}
            </option>
            <option value={OrgType.MERCHANT}>
              {OrgTypeDisplayNames[OrgType.MERCHANT]}
            </option>
          </select>
        </div>
        {/* Expand/Collapse All */}
        <Button
          onClick={expandAll}
          variant="outline"
          className="h-8 text-gray-900 border-gray-300"
        >
          展開全部
        </Button>
        <Button
          onClick={shrinkAll}
          variant="outline"
          className="h-8 text-gray-900 border-gray-300"
        >
          收合全部
        </Button>
      </div>

      <ul className="divide-y xl:w-[400px] max-h-[450px] xl:max-h-[calc(100vh-132px)] overflow-y-auto border rounded-lg">
        {filteredOrganizations &&
          filteredOrganizations.map((org) => (
            <li
              key={org.id}
              style={{ paddingLeft: `${org.depth * 20 + 16}px` }}
              className={classNames(
                selectedOrganizationId === org.id ? "bg-gray-100" : "bg-white",
                "relative flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              )}
              onClick={() => setSelectedOrganizationId(org.id)}
            >
              <button onClick={() => toggleExpand(org.id)}>
                {org.children?.length > 0 ? (
                  expandedOrganizations.has(org.id) ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  )
                ) : (
                  <div className="h-5 w-5"></div>
                )}
              </button>

              <div className="flex flex-1 items-center justify-start gap-2">
                <span className="text-lg font-semibold truncate xl:max-w-[210px]">
                  {org.name}
                </span>
                <div>
                  {org.children?.length > 0 && (
                    <Badge variant="outline">{org.children.length}</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                {org.type === OrgType.ADMIN && (
                  <Badge
                    className="border-purple-800 bg-purple-800 text-white"
                    variant="outline"
                  >
                    總
                  </Badge>
                )}
                {org.type === OrgType.AGENT && (
                  <Badge
                    className="border-gray-800 text-gray-800"
                    variant="outline"
                  >
                    代
                  </Badge>
                )}
                {org.type === OrgType.MERCHANT && (
                  <Badge variant="outline" className="bg-black text-white">
                    商
                  </Badge>
                )}
              </div>

              <ArrowRightCircleIcon
                className="h-5 w-5 text-gray-600 ml-auto cursor-pointer"
                onClick={() => setSelectedOrganizationId(org.id)}
              />
            </li>
          ))}
      </ul>
    </div>
  );
}
