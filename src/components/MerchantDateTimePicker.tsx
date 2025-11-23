"use client";

import * as moment from "moment-timezone";
import { CalendarIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/ui/popover";
import { useEffect, useState } from "react";
import { MerchantCalendar } from "./MerchantCalendar";
import { Clock } from "lucide-react";
import { Input } from "./shadcn/ui/input";
import { Button } from "./shadcn/ui/button";
import { PHILIPPINES_TIMEZONE } from "@/lib/utils/timezone";
import { cn } from "@/lib/utils/classname-utils";

export function MerchantDateTimePicker({
  date,
  setDate,
  placeholder,
  onChange,
}: {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder: string;
  onChange?: (date?: Date) => void;
}) {
  const [inputValue, setInputValue] = useState<string>(
    date
      ? moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
      : ""
  );
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(date);
  const [timeInputValue, setTimeInputValue] = useState<string>(
    date ? moment.tz(date, PHILIPPINES_TIMEZONE).format("HH:mm:ss") : ""
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    try {
      const parsedDate = moment
        .tz(inputValue, "YYYY/MM/DD HH:mm:ss", PHILIPPINES_TIMEZONE)
        .toDate();
      if (moment.tz(parsedDate, PHILIPPINES_TIMEZONE).isValid()) {
        setDate(parsedDate);
        setCalendarDate(parsedDate);
        if (onChange) onChange(parsedDate);
        setInputValue(
          moment
            .tz(parsedDate, PHILIPPINES_TIMEZONE)
            .format("YYYY/MM/DD HH:mm:ss")
        );
      } else {
        if (date) {
          setInputValue(
            moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
          );
        } else {
          setInputValue("");
        }
      }
    } catch (error) {
      if (date) {
        setInputValue(
          moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
        );
      } else {
        setInputValue("");
      }
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    setTimeInputValue(timeValue);
    
    if (calendarDate) {
      const [hours, minutes, seconds] = timeValue.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        const newDate = moment.tz(calendarDate, PHILIPPINES_TIMEZONE);
        newDate.hours(hours);
        newDate.minutes(minutes);
        newDate.seconds(seconds);
        const updatedDate = newDate.toDate();
        setDate(updatedDate);
        if (onChange) onChange(updatedDate);
        setInputValue(
          moment.tz(updatedDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
        );
      }
    }
  };

  const handleTimeBlur = () => {
    if (!timeInputValue || !calendarDate) return;

    const [hours, minutes, seconds] = timeInputValue.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return;

    const newDate = moment.tz(calendarDate, PHILIPPINES_TIMEZONE);
    newDate.hours(hours);
    newDate.minutes(minutes);
    newDate.seconds(seconds);
    const updatedDate = newDate.toDate();
    setDate(updatedDate);
    if (onChange) onChange(updatedDate);
    setInputValue(
      moment.tz(updatedDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
    );
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

  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined);
      setCalendarDate(undefined);
      setInputValue("");
      setTimeInputValue("");
      if (onChange) onChange(undefined);
      return;
    }

    // Extract year/month/day from the selected date (local date from calendar)
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const day = newDate.getDate();
    
    // Create date in Philippines timezone using those date parts
    let phDate = moment.tz(
      { year, month, day, hour: 0, minute: 0, second: 0 },
      PHILIPPINES_TIMEZONE
    );
    
    // Preserve existing time if available
    if (date) {
      const existingTime = moment.tz(date, PHILIPPINES_TIMEZONE);
      phDate.hours(existingTime.hours());
      phDate.minutes(existingTime.minutes());
      phDate.seconds(existingTime.seconds());
    } else if (timeInputValue) {
      const [hours, minutes, seconds] = timeInputValue.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        phDate.hours(hours);
        phDate.minutes(minutes);
        phDate.seconds(seconds);
      }
    }

    const finalDate = phDate.toDate();
    setDate(finalDate);
    // Update calendarDate to the local date representation for proper display
    setCalendarDate(newDate);
    setInputValue(
      moment.tz(finalDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
    );
    setTimeInputValue(
      moment.tz(finalDate, PHILIPPINES_TIMEZONE).format("HH:mm:ss")
    );
    if (onChange) onChange(finalDate);
  };

  useEffect(() => {
    if (date) {
      setInputValue(
        moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
      );
      setTimeInputValue(
        moment.tz(date, PHILIPPINES_TIMEZONE).format("HH:mm:ss")
      );
      // Convert stored date to calendar display date (local date with same Y/M/D)
      setCalendarDate(getCalendarDate(date));
    } else {
      setInputValue("");
      setTimeInputValue("");
      setCalendarDate(undefined);
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-9 px-3 border border-gray-200 bg-white text-left font-normal flex items-center gap-2 hover:bg-gray-50 transition-colors",
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
                setTimeInputValue("");
                if (onChange) onChange(undefined);
              }}
              className="p-1 hover:bg-gray-100 cursor-pointer"
            >
              <XCircleIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 border border-gray-200 rounded-none shadow-none" align="start">
        <div className="p-4 space-y-4">
          <MerchantCalendar
            mode="single"
            selected={calendarDate || getCalendarDate(date)}
            onSelect={handleCalendarSelect}
            initialFocus
            className="border-0"
          />
          
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">時間</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  step="1"
                  value={timeInputValue}
                  onChange={handleTimeChange}
                  onBlur={handleTimeBlur}
                  className="flex-1 h-9 text-sm font-mono tracking-wider border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 border border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    const input = document.querySelector(
                      'input[type="time"]'
                    ) as HTMLInputElement;
                    if (input && typeof input.showPicker === "function") {
                      input.showPicker();
                    }
                  }}
                >
                  <Clock className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-mono text-xs border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none h-8"
              onClick={() => {
                if (calendarDate) {
                  const newDate = moment.tz(calendarDate, PHILIPPINES_TIMEZONE);
                  newDate.hours(0).minutes(0).seconds(0);
                  const finalDate = newDate.toDate();
                  setDate(finalDate);
                  if (onChange) onChange(finalDate);
                  setInputValue(
                    moment.tz(finalDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
                  );
                  setTimeInputValue("00:00:00");
                }
              }}
            >
              00:00:00
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-mono text-xs border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none h-8"
              onClick={() => {
                if (calendarDate) {
                  const newDate = moment.tz(calendarDate, PHILIPPINES_TIMEZONE);
                  newDate.hours(23).minutes(59).seconds(59);
                  const finalDate = newDate.toDate();
                  setDate(finalDate);
                  if (onChange) onChange(finalDate);
                  setInputValue(
                    moment.tz(finalDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
                  );
                  setTimeInputValue("23:59:59");
                }
              }}
            >
              23:59:59
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

