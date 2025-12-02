import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { flattenOrganizations } from "./flattenOrganizations";
import { sortOrganizationTree } from "./sortOrganizationsByHierarchy";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { useState } from "react";

export function OrganizationSearchBar({
  selectedOrganizationId,
  setSelectedOrganizationId,
  organizationType,
}: {
  selectedOrganizationId?: string;
  setSelectedOrganizationId: (id: string) => void;
  organizationType?: OrgType;
}) {
  const { organization } = useOrganizationWithChildren({
    organizationId: getApplicationCookies().organizationId,
  });
  // Sort the organization tree before flattening to ensure children appear after parents
  const sortedOrganization = organization
    ? sortOrganizationTree(organization)
    : organization;
  const organizations = organizationType
    ? flattenOrganizations(sortedOrganization).filter(
        (org) => org.type === organizationType
      )
    : flattenOrganizations(sortedOrganization);

  const [query, setQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  // Filter based on both name and id
  const filteredOrganizations =
    query === "" || isComposing
      ? organizations
      : organizations.filter((org) => {
          return (
            org.name.toLowerCase().includes(query.toLowerCase()) ||
            org.id.toString().toLowerCase().includes(query.toLowerCase())
          );
        });

  return (
    <Combobox
      value={selectedOrganizationId}
      onChange={(organizationId) => {
        setQuery("");
        setSelectedOrganizationId(organizationId || "");
      }}
      className="w-full lg:w-[400px]"
      as="div"
      immediate
    >
      <div className="relative">
        <ComboboxInput
          className="w-full rounded-md border bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm sm:text-sm sm:leading-6 focus:outline-none"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          onCompositionStart={() => setIsComposing(true)} // Start IME composition
          onCompositionEnd={(event) => {
            setIsComposing(false); // End IME composition
            setQuery(event.data); // Set query to final composed value
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isComposing) {
              e.preventDefault(); // Prevent Enter from triggering selection while composing
            }
          }}
          displayValue={() => {
            const name = organizations.find(
              (organization) => organization.id === selectedOrganizationId
            )?.name;

            if (name) return `${name} (${selectedOrganizationId})`;
            else return "";
          }}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-700"
            aria-hidden="true"
          />
        </ComboboxButton>

        <ComboboxOptions className="absolute z-10 mt-1 max-h-[480px] w-full overflow-auto rounded-md bg-white py-1 text-base sm:text-sm border">
          {query === "" && (
            <ComboboxOption
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-purple-700 data-[focus]:text-white"
              value={""}
            >
              <span className="block truncate group-data-[selected]:font-bold">
                全選
              </span>
              <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-purple-700 group-data-[selected]:flex group-data-[focus]:text-white">
                <CheckIcon className="h-5 w-5" aria-hidden="true" />
              </span>
            </ComboboxOption>
          )}
          {filteredOrganizations.length > 0 ? (
            filteredOrganizations.map((organization) => (
              <ComboboxOption
                key={`searchBarOptions-${organization.id}`}
                value={organization.id}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-purple-700 data-[focus]:text-white"
              >
                <span className="block truncate group-data-[selected]:font-bold">
                  {organization.name} ({organization.id})
                </span>

                <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-purple-700 group-data-[selected]:flex group-data-[focus]:text-white">
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </ComboboxOption>
            ))
          ) : (
            <ComboboxOption
              className="cursor-default select-none py-2 pl-3 pr-9 text-gray-900"
              disabled
              value={""}
            >
              沒有符合的單位
            </ComboboxOption>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
