import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HourlyData {
  dt: number;
  temp: number;
  weather: Array<{ icon: string; description: string }>;
  pop: number;
}

interface HourlyForecastProps {
  hourly: HourlyData[];
  units: string;
  timezoneOffset: number;
}

export const HourlyForecast = ({
  hourly,
  units,
  timezoneOffset,
}: HourlyForecastProps) => {
  const tempUnit = units === "metric" ? "°C" : "°F";

  const formatTime = (dt: number) => {
    const date = new Date((dt + timezoneOffset) * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Next 12 Hours</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-4">
          {hourly.slice(0, 12).map((hour, idx) => (
            <Card key={idx} className="flex-shrink-0 p-4 min-w-[100px]">
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium">{formatTime(hour.dt)}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${hour.weather[0]?.icon}@2x.png`}
                  alt={hour.weather[0]?.description}
                  className="w-12 h-12"
                />
                <p className="text-lg font-bold">
                  {Math.round(hour.temp)}
                  {tempUnit}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(hour.pop * 100)}% rain
                </p>
              </div>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
