"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import { DayFlag, DayPicker, SelectionState, UI } from "react-day-picker";
import { cn } from "@/lib/utils/classname-utils";

export type MerchantCalendarProps = React.ComponentProps<typeof DayPicker>;

const Chevron = ({ orientation = "left" }: { orientation?: "left" | "right" | "up" | "down" }) => {
  switch (orientation) {
    case "left":
      return <ChevronLeftIcon className="h-4 w-4" />;
    case "right":
      return <ChevronRightIcon className="h-4 w-4" />;
    case "up":
      return <ChevronUpIcon className="h-4 w-4" />;
    case "down":
      return <ChevronDownIcon className="h-4 w-4" />;
    default:
      return null;
  }
};

export const MerchantCalendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: MerchantCalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        [UI.Months]: "relative",
        [UI.Month]: "space-y-4 ml-0",
        [UI.MonthCaption]: "flex justify-center items-center h-7",
        [UI.CaptionLabel]: "text-sm font-medium text-gray-900",
        [UI.PreviousMonthButton]: cn(
          "h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 p-0 inline-flex items-center justify-center rounded-none opacity-50 hover:opacity-100 transition-opacity absolute left-1 top-0"
        ),
        [UI.NextMonthButton]: cn(
          "h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 p-0 inline-flex items-center justify-center rounded-none opacity-50 hover:opacity-100 transition-opacity absolute right-1 top-0"
        ),
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]: "flex",
        [UI.Weekday]:
          "text-gray-600 w-9 font-medium text-xs uppercase tracking-wide",
        [UI.Week]: "flex w-full mt-2",
        [UI.Day]: cn(
          "h-9 w-9 text-center text-sm p-0 relative"
        ),
        [UI.DayButton]: cn(
          "h-9 w-9 p-0 font-normal text-gray-900 inline-flex items-center justify-center border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-none"
        ),
        [SelectionState.selected]: cn(
          "bg-gray-900 text-white hover:bg-gray-900 hover:text-white border-gray-900 rounded-none"
        ),
        [DayFlag.today]: "bg-gray-50 text-gray-900 font-medium border-gray-200 rounded-none",
        [DayFlag.outside]: "text-gray-400 opacity-50",
        [DayFlag.disabled]: "text-gray-300 cursor-not-allowed opacity-50",
        [DayFlag.hidden]: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => <Chevron {...props} />,
      }}
      {...props}
    />
  );
};

