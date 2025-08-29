"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Holiday } from "./MonthCalendar";

export function PanchangDetails({
  date,
  holidays,
}: {
  date: Date;
  holidays: Holiday[];
}) {
  const [loading, setLoading] = useState(true);
  const [panchang, setPanchang] = useState<null | {
    tithi: string;
    nakshatra: string;
  }>(null);
  const [location, setLocation] = useState<{
    latitude: null | number;
    longitude: null | number;
  }>({ latitude: null, longitude: null });
  const [userDenied, setUserDenied] = useState(false);
  const [holiday, setHoliday] = useState<string | null>(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Latitude: " + position.coords.latitude);
          console.log("Longitude: " + position.coords.longitude);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setLocation({ latitude: null, longitude: null });
          if (error.code === error.PERMISSION_DENIED) {
            setUserDenied(true);
          }
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  const getPanchang = async () => {
    try {
      setLoading(true);
      const date = new Date();
      const body = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: date.getTimezoneOffset() / -60,
        config: {
          observation_point: "topocentric",
          ayanamsha: "lahiri",
        },
      };
      const options = {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_PANCHANG_API_KEY,
        },
      };
      const [parsedTithi, parsedNakshatra] = await Promise.all([
        axios.post(
          "https://json.freeastrologyapi.com/tithi-durations",
          body,
          options
        ),
        axios.post(
          "https://json.freeastrologyapi.com/nakshatra-durations",
          body,
          options
        ),
      ]);
      const tithi = JSON.parse(JSON.parse(parsedTithi.data?.output) || "{}");
      const nakshatra = JSON.parse(parsedNakshatra.data?.output || "{}");
      console.log(tithi);
      setPanchang({
        tithi: tithi.name || "",
        nakshatra: nakshatra.name || "",
      });
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message;
      }
      toast.error(message);
      setPanchang(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.latitude && !location.longitude) {
      getLocation();
    } else {
      getPanchang();
    }
  }, [location]);

  useEffect(() => {
    const foundHoliday = holidays.find(
      (item) =>
        item.date.getDate() === date.getDate() &&
        item.date.getMonth() === date.getMonth() &&
        item.date.getFullYear() === date.getFullYear()
    );

    setHoliday(foundHoliday ? foundHoliday.name : null);
  }, [date, holidays]);

  return (
    <Card className="p-4 md:p-6 space-y-2">
      <div className="space-y-1">
        <h3 className="text-xl md:text-2xl font-semibold">
          {date.toLocaleDateString("en-IN", {
            weekday: "long",
          })}
        </h3>
        <h1 className="text-3xl font-extrabold tracking-tighter">
          {date.toLocaleDateString("en-IN", {
            day: "numeric",
          })}
          <p className="text-muted-foreground font-semibold text-lg tracking-tight inline ml-2">
            {date.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </h1>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Panchang</h3>
        {userDenied ? (
          <p className="text-muted-foreground text-sm">
            Please allow location permissions
          </p>
        ) : (
          <div className="flex justify-between gap-2">
            <div>
              <div className="text-sm text-muted-foreground">Tithi</div>
              {loading ? (
                <Skeleton className="w-20 h-4" />
              ) : (
                <div className="text-base">{panchang?.tithi ?? "—"}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Nakshatra</div>
              {loading ? (
                <Skeleton className="w-20 h-4" />
              ) : (
                <div className="text-base">{panchang?.nakshatra ?? "—"}</div>
              )}
            </div>
          </div>
        )}
      </div>
      {holiday && (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Festival</h3>
          <p>{holiday}</p>
        </div>
      )}
    </Card>
  );
}
