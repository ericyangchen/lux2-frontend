"use client";

import * as moment from "moment-timezone";

import { CalendarIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/ui/popover";
import { useEffect, useState } from "react";

import { Button } from "./shadcn/ui/button";
import { Calendar } from "./shadcn/ui/calendar";
import { Clock } from "lucide-react";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { PHILIPPINES_TIMEZONE } from "@/lib/utils/timezone";
import { cn } from "@/lib/utils/classname-utils";
import { format } from "date-fns";

export function DateTimePicker({
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
    // Try to parse the input into a valid date in Philippines timezone
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
        // If invalid, revert to current date value
        if (date) {
          setInputValue(
            moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
          );
        } else {
          setInputValue("");
        }
      }
    } catch (error) {
      // If invalid, revert to current date value
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
  };

  const handleTimeBlur = () => {
    if (!timeInputValue || !calendarDate) return;

    const [hours, minutes, seconds] = timeInputValue.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return;

    const newDate = new Date(calendarDate);
    newDate.setHours(hours, minutes, seconds);
    setDate(newDate);
    if (onChange) onChange(newDate);
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

    // If there's an existing date, preserve the time
    if (date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      newDate.setHours(hours, minutes, seconds);
    }

    setDate(newDate);
    setCalendarDate(newDate);
    setInputValue(
      moment.tz(newDate, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
    );
    setTimeInputValue(
      moment.tz(newDate, PHILIPPINES_TIMEZONE).format("HH:mm:ss")
    );
    if (onChange) onChange(newDate);
  };

  useEffect(() => {
    if (date) {
      setInputValue(
        moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss")
      );
      setTimeInputValue(
        moment.tz(date, PHILIPPINES_TIMEZONE).format("HH:mm:ss")
      );
      setCalendarDate(date);
    } else {
      setInputValue("");
      setTimeInputValue("");
      setCalendarDate(undefined);
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start font-normal flex gap-2 p-0 cursor-pointer",
            !date && "text-muted-foreground"
          )}
        >
          <div className="pl-3 flex items-center w-full">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 shrink-0 text-gray-700" />
            </div>

            <input
              type="text"
              className={cn(
                "w-full bg-transparent border-none focus:outline-none px-2 cursor-pointer",
                date ? "text-gray-900" : "text-gray-500"
              )}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              onClick={(e) => e.stopPropagation()}
            />

            <div
              className="px-2 border-l h-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setDate(undefined);
                setInputValue("");
              }}
            >
              <XCircleIcon className="h-5 w-5 shrink-0 justify-self-end cursor-pointer text-red-500" />
            </div>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={handleCalendarSelect}
            initialFocus
            className="rounded-md border"
            classNames={{
              day_selected:
                "[&:not(hover)]:bg-black [&:not(hover)]:text-white hover:bg-black hover:text-white focus:bg-black focus:text-white font-medium",
              day_today: "bg-gray-100 text-gray-900 font-medium",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 rounded-md transition-colors cursor-pointer select-none",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
              nav_button:
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell:
                "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              caption_dropdowns: "flex justify-center gap-1",
            }}
          />
          <div className="mt-2">
            <div className="relative">
              <Input
                type="time"
                step="1"
                value={timeInputValue}
                onChange={handleTimeChange}
                onBlur={handleTimeBlur}
                className="h-8 text-sm w-full font-mono tracking-wider text-center rounded-md border focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-0 top-0 opacity-50 hover:opacity-100 px-1"
                onClick={() => {
                  const input = document.querySelector(
                    'input[type="time"]'
                  ) as HTMLInputElement;
                  if (input && typeof input.showPicker === "function") {
                    input.showPicker();
                  }
                }}
              >
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-mono text-xs"
              onClick={() => {
                if (calendarDate) {
                  const newDate = new Date(calendarDate);
                  newDate.setHours(0, 0, 0);
                  setDate(newDate);
                  if (onChange) onChange(newDate);
                }
              }}
            >
              00:00:00
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-mono text-xs"
              onClick={() => {
                if (calendarDate) {
                  const newDate = new Date(calendarDate);
                  newDate.setHours(23, 59, 59);
                  setDate(newDate);
                  if (onChange) onChange(newDate);
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
