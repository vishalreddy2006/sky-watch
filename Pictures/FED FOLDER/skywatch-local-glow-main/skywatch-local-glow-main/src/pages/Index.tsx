import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MapPin, Search, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import { useTheme } from "next-themes";
import { WeatherCard } from "@/components/WeatherCard";
import { HourlyForecast } from "@/components/HourlyForecast";
import { DailyForecast } from "@/components/DailyForecast";
import { useWeather } from "@/hooks/useWeather";
import ExportMenu from "@/components/ExportMenu";
import { indianCities } from "@/data/indianCitiesWeather";
import { cn } from "@/lib/utils";
import AITips from "@/components/AITips";

const Index = () => {
  const [city, setCity] = useState("");
  const [units, setUnits] = useState("metric");
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const { theme, setTheme } = useTheme();
  const [showAITips, setShowAITips] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showAnalyze, setShowAnalyze] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  const {
    loading,
    weatherData,
    location,
    loadWeatherByCity,
    getCurrentLocation,
    accuracyLabel,
  } = useWeather();

  useEffect(() => {
    // Load default city on mount
    loadWeatherByCity("Hyderabad", units);
  }, []);

  // Auto-refresh every 5 minutes when tab is visible and enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const REFRESH_MS = 5 * 60 * 1000;
    let timer: number | undefined;
    const refresh = () => {
      if (document.visibilityState === "visible") {
        if (location?.startsWith("📍") || location?.startsWith("🎯")) {
          // If location-based, refresh current location
          getCurrentLocation(units);
        } else if (selectedCity) {
          loadWeatherByCity(selectedCity, units);
        }
      }
    };
    timer = window.setInterval(refresh, REFRESH_MS);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [selectedCity, units, location, autoRefreshEnabled]);

  const handleSearch = () => {
    if (city.trim()) {
      loadWeatherByCity(city, units);
    }
  };

  const handleRefresh = () => {
    if (location) {
      if (location === "Your Location") {
        getCurrentLocation(units);
      } else {
        loadWeatherByCity(city || "Paris", units);
      }
    }
  };

  const handleUnitsChange = (newUnits: string) => {
    setUnits(newUnits);
    if (selectedCity) {
      loadWeatherByCity(selectedCity, newUnits);
    }
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setCity(cityName);
    loadWeatherByCity(cityName, units);
    setOpen(false);
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkyWatch
            </h1>
            <div className="ml-3 h-9 px-3 flex items-center gap-2">
              <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle buttons for features */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={showAITips ? "default" : "outline"}
                  onClick={() => setShowAITips((s) => !s)}
                >
                  AI Tips
                </Button>
                <Button
                  size="sm"
                  variant={showForecast ? "default" : "outline"}
                  onClick={() => setShowForecast((s) => !s)}
                >
                  Forecast
                </Button>
                <Button
                  size="sm"
                  variant={showAnalyze ? "default" : "outline"}
                  onClick={() => setShowAnalyze((s) => !s)}
                >
                  Analyze
                </Button>
                <Button
                  size="sm"
                  variant={autoRefreshEnabled ? "default" : "outline"}
                  onClick={() => setAutoRefreshEnabled((s) => !s)}
                >
                  Auto-refresh
                </Button>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Your Personal Weather Companion - Real-time data with smart location search
          </p>
        </header>

  <div className="flex flex-wrap gap-3 justify-center items-center">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-64 justify-between"
              >
                {selectedCity || "Select city..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
              <Command>
                <CommandInput placeholder="Search Indian cities..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {indianCities.map((cityData) => (
                      <CommandItem
                        key={`${cityData.name}-${cityData.state}`}
                        value={cityData.name}
                        onSelect={() => handleCitySelect(cityData.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCity === cityData.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{cityData.name}</span>
                          <span className="text-xs text-muted-foreground">{cityData.state}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Or type city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-48"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => getCurrentLocation(units)}
            disabled={loading}
            className="bg-green-50 hover:bg-green-100 border-green-200"
          >
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            📍 Live Location
          </Button>

          <Select value={units} onValueChange={handleUnitsChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">°C / m/s</SelectItem>
              <SelectItem value="imperial">°F / mph</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <ExportMenu data={weatherData as any} disabled={!weatherData} />
        </div>

        {weatherData && (
          <div className="space-y-8">
            {accuracyLabel && (
              <div className="flex justify-center">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {accuracyLabel}
                </span>
              </div>
            )}
            <div className="flex justify-center">
              <WeatherCard
                place={location}
                temp={weatherData.current.temp}
                description={weatherData.current.weather[0]?.description || ""}
                icon={weatherData.current.weather[0]?.icon || "01d"}
                humidity={weatherData.current.humidity}
                windSpeed={weatherData.current.wind_speed}
                pressure={weatherData.current.pressure}
                uvi={weatherData.current.uvi}
                units={units}
              />
            </div>

            {showAITips && <AITips data={weatherData as any} units={units} />}

            {showForecast && (
              <>
                <HourlyForecast
                  hourly={weatherData.hourly}
                  units={units}
                  timezoneOffset={weatherData.timezone_offset}
                />

                <DailyForecast
                  daily={weatherData.daily}
                  units={units}
                  timezoneOffset={weatherData.timezone_offset}
                />
              </>
            )}

            {showAnalyze && (
              <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
                <h3 className="font-semibold mb-2">Analysis</h3>
                <p className="text-sm text-muted-foreground">Quick analysis and trends will appear here.</p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center text-muted-foreground">Loading weather data...</div>
        )}

        <footer className="text-center py-8 border-t border-border mt-16">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Built with ❤️ using React, TypeScript, and Tailwind CSS</p>
            <p className="text-xs">© 2025 SkyWatch. Made by Vishal Reddy</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
