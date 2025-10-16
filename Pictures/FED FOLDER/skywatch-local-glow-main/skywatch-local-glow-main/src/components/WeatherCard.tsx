import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Gauge, Sun, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeatherCardProps {
  place: string;
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvi: number;
  units: string;
}

export const WeatherCard = ({
  place,
  temp,
  description,
  icon,
  humidity,
  windSpeed,
  pressure,
  uvi,
  units,
}: WeatherCardProps) => {
  const tempUnit = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "metric" ? "m/s" : "mph";

  // Detect if this is an ultra-precise location
  const isUltraPrecise = place.includes('🎯');
  const isPreciseLocation = place.includes('📍');
  const isSearchResult = place.includes('🔍');
  
  return (
    <Card className="p-6 w-full max-w-md weather-card backdrop-blur-sm bg-white/90 shadow-xl border-0">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{place}</h2>
          
          {/* Precision indicators */}
          <div className="flex flex-wrap gap-1 justify-center">
            {isUltraPrecise && (
              <Badge variant="default" className="text-xs bg-green-600 text-white">
                <Target className="w-3 h-3 mr-1" />
                Village-Level Precision
              </Badge>
            )}
            {isPreciseLocation && !isUltraPrecise && (
              <Badge variant="secondary" className="text-xs">
                📍 GPS Location
              </Badge>
            )}
            {isSearchResult && (
              <Badge variant="outline" className="text-xs">
                🔍 Search Result
              </Badge>
            )}
          </div>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={description}
          className="w-24 h-24"
        />
        <div className="text-5xl font-bold text-foreground">
          {Math.round(temp)}
          {tempUnit}
        </div>
        <p className="text-lg text-muted-foreground capitalize">{description}</p>

        <div className="grid grid-cols-2 gap-4 w-full mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Humidity:</span>
            <span className="font-semibold">{humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wind className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Wind:</span>
            <span className="font-semibold">
              {Math.round(windSpeed)} {speedUnit}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Pressure:</span>
            <span className="font-semibold">{pressure} hPa</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sun className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">UV Index:</span>
            <span className="font-semibold">{uvi}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
