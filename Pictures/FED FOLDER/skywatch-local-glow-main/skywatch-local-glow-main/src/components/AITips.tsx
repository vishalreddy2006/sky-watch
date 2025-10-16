import React from "react";

type WeatherData = {
  current: {
    temp: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    uvi: number;
    weather: Array<{ icon: string; description: string }>;
  };
};

interface Props {
  data: WeatherData;
  units: "metric" | "imperial" | string;
}

export const AITips: React.FC<Props> = ({ data, units }) => {
  const tips: string[] = [];
  const celsius = units === "imperial" ? (data.current.temp - 32) * (5 / 9) : data.current.temp;
  const windKph = units === "imperial" ? data.current.wind_speed * 1.60934 : data.current.wind_speed * 3.6;
  const desc = (data.current.weather[0]?.description || "").toLowerCase();

  // Temperature-based
  if (celsius >= 35) tips.push("Very hot today—stay hydrated and avoid peak sun.");
  else if (celsius >= 30) tips.push("Warm day—carry water and wear light clothing.");
  else if (celsius <= 10) tips.push("Chilly conditions—wear layers to stay warm.");

  // UV
  if (data.current.uvi >= 7) tips.push("High UV—use sunscreen and a cap outdoors.");
  else if (data.current.uvi >= 3) tips.push("Moderate UV—sunscreen recommended.");

  // Rain / Clouds
  if (/rain|drizzle|thunder/.test(desc)) tips.push("Chance of rain—carry an umbrella or raincoat.");
  else if (/cloud/.test(desc)) tips.push("Cloudy skies—pleasant for outdoor walks.");

  // Wind
  if (windKph >= 30) tips.push("Windy conditions—secure loose items and drive carefully.");

  // Humidity
  if (data.current.humidity >= 85) tips.push("High humidity—expect a muggy feel; ventilate indoor spaces.");

  // Fallback
  if (tips.length === 0) tips.push("Weather looks fine—enjoy your day and stay prepared.");

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
      <h3 className="font-semibold mb-2">AI Tips</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
};

export default AITips;
