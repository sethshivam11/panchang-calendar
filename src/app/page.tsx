"use client";

import { useEffect, useState } from "react";
import { PanchangDetails } from "@/components/PanchangDetails";
import { Holiday, MonthCalendar } from "@/components/MonthCalendar";
import axios, { AxiosError } from "axios";
import HolidayList from "@/components/HolidayList";
import { ModeToggle } from "@/components/ModeToggle";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [holidaysByYear, setHolidaysByYear] = useState<
    Record<number, Holiday[]>
  >({});

  const getHolidays = async (year: number) => {
    if (holidaysByYear[year]) return;

    try {
      const { data } = await axios.get(
        `https://calendarific.com/api/v2/holidays?api_key=${
          process.env.NEXT_PUBLIC_CALENDARIFIC_API_KEY
        }&country=IN&year=${currentMonth.getFullYear()}`
      );
      const response: Holiday[] = data.response.holidays.map(
        (item: { name: string; date: { iso: string } }) => ({
          name: item.name,
          date: new Date(item.date.iso),
        })
      );
      setHolidaysByYear((prev) => ({ ...prev, [year]: response }));
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message;
      }
      console.error("Failed to fetch holidays:", message);
    }
  };

  useEffect(() => {
    if (!currentMonth) return;
    const year = currentMonth.getFullYear();
    getHolidays(year);
  }, [currentMonth]);

  return (
    <main className="min-h-dvh px-4 md:px-6 py-6 md:py-10 max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-balance">
            Panchang Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            View daily Tithi, Nakshatra, and Festivals.
          </p>
        </div>
        <ModeToggle />
      </header>

      <section className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
          <MonthCalendar
            date={date}
            setDate={setDate}
            holidays={holidaysByYear[currentMonth.getFullYear()] || []}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <PanchangDetails
            date={date}
            holidays={holidaysByYear[date.getFullYear()] || []}
          />
          <HolidayList
            date={currentMonth}
            holidays={holidaysByYear[currentMonth.getFullYear()] || []}
          />
        </div>
      </section>
    </main>
  );
}
