"use client";

import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";

export interface Holiday {
  name: string;
  date: Date;
}

export function MonthCalendar({
  date,
  setDate,
  currentMonth,
  setCurrentMonth,
  holidays = [],
}: {
  date: Date | undefined;
  setDate: (d: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;
  holidays: Holiday[];
}) {
  const holidayDates = useMemo(
    () => holidays.map((h) => new Date(h.date)),
    [holidays]
  );

  return (
    <Calendar
      mode="single"
      required={true}
      selected={date}
      onSelect={setDate}
      className="rounded-xl border shadow-sm w-full"
      captionLayout="dropdown"
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      modifiers={{
        holiday: holidayDates,
      }}
      modifiersClassNames={{
        holiday: "border-2 border-input hover:border-muted rounded-xl",
      }}
      startMonth={new Date(1900, 0)}
      endMonth={new Date(2099, 11)}
    />
  );
}
