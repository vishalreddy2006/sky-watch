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
import AnalyzePanel from "@/components/AnalyzePanel";
import { requestNotificationPermission, notifyUser } from "@/utils/notifications";

type WeatherDataLocal = {
  current?: { temp?: number; humidity?: number; pressure?: number; wind_speed?: number; uvi?: number; weather?: Array<{ description?: string; icon?: string }>; };
  hourly?: Array<{ dt?: number; temp?: number; pop?: number; weather?: Array<{ description?: string }> }>;
  daily?: Array<{ dt?: number; temp?: { min?: number; max?: number }; weather?: Array<{ description?: string }> }>;
  timezone_offset?: number;
};

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
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(false);
  
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
    // Restore toggles from localStorage
    const ls = window.localStorage;
    const ai = ls.getItem('showAITips');
    const fc = ls.getItem('showForecast');
    const an = ls.getItem('showAnalyze');
  const ar = ls.getItem('autoRefreshEnabled');
  const ll = ls.getItem('liveLocationEnabled');
    if (ai !== null) setShowAITips(ai === 'true');
    if (fc !== null) setShowForecast(fc === 'true');
    if (an !== null) setShowAnalyze(an === 'true');
    if (ar !== null) setAutoRefreshEnabled(ar === 'true');
  // Request notification permission upfront (non-blocking)
    requestNotificationPermission().catch(() => {});

    // Load default city on mount. Include `units` and `loadWeatherByCity` in deps so
    // the effect re-runs if the unit system changes or the loader identity changes.
    loadWeatherByCity("Hyderabad", units);
    if (ll !== null) setLiveLocationEnabled(ll === 'true');
  }, [loadWeatherByCity, units]);

  // Auto-refresh every 5 minutes when tab is visible and enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const REFRESH_MS = 5 * 60 * 1000;

    // Define refresh before using it in setInterval
    const refresh = () => {
      if (document.visibilityState === "visible") {
        if (liveLocationEnabled) getCurrentLocation(units);
        else if (selectedCity) loadWeatherByCity(selectedCity, units);
      }
    };

    const timer = window.setInterval(refresh, REFRESH_MS);

    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [selectedCity, units, autoRefreshEnabled, liveLocationEnabled, getCurrentLocation, loadWeatherByCity]);

  const handleSearch = () => {
    if (city.trim()) {
      loadWeatherByCity(city, units);
    }
  };

  const handleRefresh = () => {
    if (liveLocationEnabled) {
      getCurrentLocation(units);
      return;
    }
    if (selectedCity) {
      loadWeatherByCity(selectedCity, units);
    } else if (city.trim()) {
      loadWeatherByCity(city.trim(), units);
    } else {
      loadWeatherByCity("Hyderabad", units);
    }
  };

  const handleUnitsChange = (newUnits: string) => {
    setUnits(newUnits);
    if (selectedCity) {
      loadWeatherByCity(selectedCity, newUnits);
    }
  };

  // Persist toggles when they change
  useEffect(() => { window.localStorage.setItem('showAITips', String(showAITips)); }, [showAITips]);
  useEffect(() => { window.localStorage.setItem('showForecast', String(showForecast)); }, [showForecast]);
  useEffect(() => { window.localStorage.setItem('showAnalyze', String(showAnalyze)); }, [showAnalyze]);
  useEffect(() => { window.localStorage.setItem('autoRefreshEnabled', String(autoRefreshEnabled)); }, [autoRefreshEnabled]);
  useEffect(() => { window.localStorage.setItem('liveLocationEnabled', String(liveLocationEnabled)); }, [liveLocationEnabled]);

  // Change detection for notifications – runs only when weatherData updates
  useEffect(() => {
    type Snapshot = {
      current?: { temp?: number; wind_speed?: number };
      hourly?: Array<{ pop?: number }>;
    } | null;

    // Keep previous snapshot across renders
    // Using closure over a ref-like variable stored on window to avoid re-init.
    // Safer approach would be useRef, but we avoid refactoring imports.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!('___lastSnap' in w)) w.___lastSnap = null as Snapshot;
    if (!('___lastNotify' in w)) w.___lastNotify = 0 as number;

    const lastSnapshot: Snapshot = w.___lastSnap;
    const now = Date.now();

    const significantChange = (oldData: Snapshot, newData: Snapshot) => {
      if (!oldData || !newData) return false as const;
      try {
        const oldTemp = oldData.current?.temp;
        const newTemp = newData.current?.temp;
        if (typeof oldTemp === 'number' && typeof newTemp === 'number' && Math.abs(newTemp - oldTemp) >= 2) {
          return { type: 'temp', delta: newTemp - oldTemp } as const;
        }
        const oldPop = Math.max(...(oldData.hourly?.slice(0, 6).map((h) => h.pop ?? 0) || [0]));
        const newPop = Math.max(...(newData.hourly?.slice(0, 6).map((h) => h.pop ?? 0) || [0]));
        if (newPop - oldPop >= 0.3) return { type: 'rain', from: oldPop, to: newPop } as const;
        const oldWind = oldData.current?.wind_speed || 0;
        const newWind = newData.current?.wind_speed || 0;
        if (newWind - oldWind >= 5) return { type: 'wind', delta: newWind - oldWind } as const;
      } catch {
        return false as const;
      }
      return false as const;
    };

    if (weatherData) {
      const sig = significantChange(lastSnapshot, weatherData as unknown as Snapshot);
      const THROTTLE_MS = 120000; // 2 minutes between notifications
      if (sig && now - w.___lastNotify > THROTTLE_MS) {
        if (sig.type === 'temp') {
          notifyUser('Temperature changed', `Now ${Math.round(weatherData.current?.temp ?? 0)}°, Δ ${Math.round(sig.delta)}°`);
        } else if (sig.type === 'rain') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const to = (sig as any).to ?? 0;
          notifyUser('Rain chance increased', `Precip chance ${Math.round(to * 100)}%`);
        } else if (sig.type === 'wind') {
          notifyUser('Windy now', `Wind up by ${Math.round((sig as any).delta)} ${units === 'metric' ? 'm/s' : 'mph'}`);
        }
        w.___lastNotify = now;
      }
      try { w.___lastSnap = JSON.parse(JSON.stringify(weatherData)); } catch { w.___lastSnap = weatherData; }
    }
  }, [weatherData, units]);

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
            variant={liveLocationEnabled ? "default" : "outline"}
            onClick={() => {
              const next = !liveLocationEnabled;
              setLiveLocationEnabled(next);
              if (next) getCurrentLocation(units);
            }}
            className={cn("border-green-200", liveLocationEnabled ? "bg-green-600 text-white hover:bg-green-700" : "bg-green-50 hover:bg-green-100")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {liveLocationEnabled ? 'Live Location: ON' : 'Live Location: OFF'}
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

          <ExportMenu data={(weatherData as unknown) as WeatherDataLocal} disabled={!weatherData} />
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

            {showAITips && <AITips data={(weatherData as unknown) as WeatherDataLocal} units={units} />}

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
