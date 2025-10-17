import { Card } from "@/components/ui/card";

interface DailyData {
  dt: number;
  temp: { max: number; min: number };
  weather: Array<{ icon: string; description: string }>;
}

interface DailyForecastProps {
  daily: DailyData[];
  units: string;
  timezoneOffset: number;
}

export const DailyForecast = ({
  daily,
  units,
  timezoneOffset,
}: DailyForecastProps) => {
  const tempUnit = units === "metric" ? "°C" : "°F";

  const formatDay = (dt: number) => {
    const date = new Date((dt + timezoneOffset) * 1000);
    return date.toLocaleDateString([], { weekday: "short" });
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Next 7 Days</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {daily.slice(0, 7).map((day, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-bold">{formatDay(day.dt)}</p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0]?.icon}@2x.png`}
                alt={day.weather[0]?.description}
                className="w-12 h-12"
              />
              <p className="text-lg font-bold">
                {Math.round(day.temp.max)}
                {tempUnit}
              </p>
              <p className="text-sm text-muted-foreground">
                Low {Math.round(day.temp.min)}
                {tempUnit}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
