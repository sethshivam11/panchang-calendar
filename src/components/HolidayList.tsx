import React, { useEffect } from "react";
import { Holiday } from "./MonthCalendar";
import { Card } from "./ui/card";

function HolidayList({ date, holidays }: { date: Date; holidays: Holiday[] }) {
  const [monthHolidays, setMonthHolidays] = React.useState<string[]>([]);

  useEffect(() => {
    const filteredHolidays: string[] = [];
    holidays
      .filter(
        (h) =>
          h.date.getMonth() === date.getMonth() &&
          h.date.getFullYear() === date.getFullYear()
      )
      .map((h) =>
        filteredHolidays.push(`${h.date.toDateString()} – ${h.name}`)
      );
    setMonthHolidays(filteredHolidays);
  }, [date, holidays]);

  return monthHolidays.length > 0 ? (
    <Card className="p-4 gap-2">
      <h3 className="font-semibold text-xl">
        Holidays in {date.toLocaleString("default", { month: "long" })}
      </h3>
      <ul className="list-disc pl-5 text-sm">
        {monthHolidays.map((holiday, index) => (
          <li key={index}>{holiday}</li>
        ))}
      </ul>
    </Card>
  ) : null;
}

export default HolidayList;
