"use client";

import { CalendarIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/ui/popover";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";

import { Button } from "./shadcn/ui/button";
import { Calendar } from "./shadcn/ui/calendar";
import { cn } from "@/lib/utils";

export function DatePicker({
  date,
  setDate,
  placeholder,
}: {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState<string>(
    date ? format(date, "yyyy/MM/dd") : ""
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Try to parse the input into a valid date
    const parsedDate = parse(e.target.value, "yyyy/MM/dd", new Date());
    if (!isNaN(parsedDate.getTime())) {
      setDate(parsedDate);
    }
  };

  const handleInputBlur = () => {
    // Validate the input on blur, clear if it's invalid
    const parsedDate = parse(inputValue, "yyyy/MM/dd", new Date());

    if (!isNaN(parsedDate.getTime())) {
      // Update the input value to the parsed date
      setInputValue(parsedDate ? format(parsedDate, "yyyy/MM/dd") : "");
    } else {
      setInputValue("");
    }
  };

  useEffect(() => {
    if (!date) setInputValue("");
  }, [date]);

  return (
    <Popover>
      <Button
        variant={"outline"}
        className={cn(
          "w-[240px] justify-start font-normal flex gap-2 p-0 cursor-default",
          !date && "text-muted-foreground"
        )}
        asChild
      >
        <div className="pl-4">
          <PopoverTrigger asChild>
            <div className="flex-1 cursor-pointer">
              <CalendarIcon className="h-4 w-4 shrink-0 text-gray-700" />
            </div>
          </PopoverTrigger>

          <input
            type="text"
            className="w-full bg-transparent border-none focus:outline-none"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
          />

          <div
            className="px-2 border-l h-full flex items-center justify-center"
            onClick={(e) => {
              setDate(undefined);
              setInputValue("");
              e.preventDefault();
            }}
          >
            <XCircleIcon className="h-5 w-5 shrink-0 justify-self-end cursor-pointer text-red-500" />
          </div>
        </div>
      </Button>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate);
            setInputValue(
              selectedDate ? format(selectedDate, "yyyy/MM/dd") : ""
            );
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
