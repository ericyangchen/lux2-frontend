"use client";

import * as moment from "moment-timezone";
import { CalendarIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/ui/popover";
import { useEffect, useState } from "react";
import { MerchantCalendar } from "./MerchantCalendar";
import { PHILIPPINES_TIMEZONE } from "@/lib/utils/timezone";
import { cn } from "@/lib/utils/classname-utils";

export function MerchantDatePicker({
  date,
  setDate,
  placeholder,
}: {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState<string>(
    date
      ? moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD")
      : ""
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    // Try to parse the input into a valid date in Philippines timezone
    try {
      const parsedDate = moment
        .tz(inputValue, "YYYY/MM/DD", PHILIPPINES_TIMEZONE)
        .toDate();
      if (moment.tz(parsedDate, PHILIPPINES_TIMEZONE).isValid()) {
        setDate(parsedDate);
        setInputValue(
          moment.tz(parsedDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD")
        );
      } else {
        // If invalid, revert to current date value
        if (date) {
          setInputValue(
            moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD")
          );
        } else {
          setInputValue("");
        }
      }
    } catch (error) {
      // If invalid, revert to current date value
      if (date) {
        setInputValue(
          moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD")
        );
      } else {
        setInputValue("");
      }
    }
  };

  // Convert stored date (in PH timezone) to calendar display date (local date with same Y/M/D)
  const getCalendarDate = (date?: Date): Date | undefined => {
    if (!date) return undefined;
    
    // Get the date parts as they appear in Philippines timezone
    const phMoment = moment.tz(date, PHILIPPINES_TIMEZONE);
    // Create a local date with the same year/month/day for calendar display
    return new Date(
      phMoment.year(), 
      phMoment.month(), 
      phMoment.date()
    );
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      setInputValue("");
      return;
    }

    // Extract year/month/day from the selected date (local date from calendar)
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    
    // Create date at start of day in Philippines timezone using those date parts
    const phDate = moment.tz(
      { year, month, day, hour: 0, minute: 0, second: 0 },
      PHILIPPINES_TIMEZONE
    );
    const finalDate = phDate.toDate();
    
    setDate(finalDate);
    setInputValue(
      moment.tz(finalDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD")
    );
  };

  useEffect(() => {
    if (date) {
      setInputValue(
        moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD")
      );
    } else {
      setInputValue("");
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-9 px-3 border border-gray-200 bg-white text-left font-normal flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-none",
            !date && "text-gray-500"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-gray-600" />
          <input
            type="text"
            className={cn(
              "flex-1 bg-transparent border-none focus:outline-none cursor-pointer text-sm",
              date ? "text-gray-900" : "text-gray-500"
            )}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            onClick={(e) => e.stopPropagation()}
            readOnly
          />
          {date && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setDate(undefined);
                setInputValue("");
              }}
              className="p-1 hover:bg-gray-100 cursor-pointer"
            >
              <XCircleIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 border border-gray-200 rounded-none shadow-none" align="start">
        <MerchantCalendar
          mode="single"
          selected={getCalendarDate(date)}
          onSelect={handleCalendarSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

