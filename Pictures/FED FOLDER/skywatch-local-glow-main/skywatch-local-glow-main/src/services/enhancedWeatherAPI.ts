// Enhanced Weather API with multiple sources for accurate weather data
export interface WeatherSource {
  name: string;
  baseUrl: string;
  requiresAuth: boolean;
}

export class EnhancedWeatherAPI {
  private static readonly WEATHER_SOURCES: WeatherSource[] = [
    { name: 'OpenWeatherMap', baseUrl: 'https://api.openweathermap.org/data/2.5', requiresAuth: true },
    { name: 'WeatherAPI', baseUrl: 'https://api.weatherapi.com/v1', requiresAuth: true },
    { name: 'Open-Meteo', baseUrl: 'https://api.open-meteo.com/v1', requiresAuth: false },
  ];

  // Normalized helpers for unit conversion and shape coercion
  private static normalizeUnits(value: number, from: 'c' | 'f', to: 'metric' | 'imperial') {
    if (from === 'c' && to === 'imperial') return (value * 9) / 5 + 32;
    if (from === 'f' && to === 'metric') return ((value - 32) * 5) / 9;
    return value;
  }

  private static toNormalizedShape(input: {
    current: { dt: number; temp: number; humidity: number; pressure: number; wind_speed: number; uvi: number; weather: Array<{ icon: string; description: string }> };
    hourly: Array<{ dt: number; temp: number; weather: Array<{ icon: string; description: string }>; pop: number }>;
    daily: Array<{ dt: number; temp: { max: number; min: number }; weather: Array<{ icon: string; description: string }> }>;
    timezone_offset: number;
  }) {
    return input;
  }

  // Get weather from Open-Meteo (free, no API key required)
  static async getOpenMeteoWeather(lat: number, lon: number, units: string = 'metric') {
    try {
      const tempUnit = units === 'metric' ? 'celsius' : 'fahrenheit';
      const windUnit = units === 'metric' ? 'kmh' : 'mph';
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`;
      
      console.log('🌤️ Fetching live weather from Open-Meteo API...');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.current_weather) {
        throw new Error('No current weather data available');
      }
      
      // Convert Open-Meteo format to our standard format
  return this.convertOpenMeteoData(data, units);
      
    } catch (error) {
      console.error('Open-Meteo weather failed:', error);
      throw error;
    }
  }

  // Convert Open-Meteo weather codes to readable descriptions and icons
  static convertWeatherCode(code: number): {description: string, icon: string} {
    const weatherCodes: Record<number, {description: string, icon: string}> = {
      0: { description: 'Clear sky', icon: '01d' },
      1: { description: 'Mainly clear', icon: '02d' },
      2: { description: 'Partly cloudy', icon: '03d' },
      3: { description: 'Overcast', icon: '04d' },
      45: { description: 'Foggy', icon: '50d' },
      48: { description: 'Depositing rime fog', icon: '50d' },
      51: { description: 'Light drizzle', icon: '09d' },
      53: { description: 'Moderate drizzle', icon: '09d' },
      55: { description: 'Dense drizzle', icon: '09d' },
      61: { description: 'Slight rain', icon: '10d' },
      63: { description: 'Moderate rain', icon: '10d' },
      65: { description: 'Heavy rain', icon: '10d' },
      71: { description: 'Slight snow', icon: '13d' },
      73: { description: 'Moderate snow', icon: '13d' },
      75: { description: 'Heavy snow', icon: '13d' },
      80: { description: 'Slight rain showers', icon: '09d' },
      81: { description: 'Moderate rain showers', icon: '09d' },
      82: { description: 'Violent rain showers', icon: '09d' },
      95: { description: 'Thunderstorm', icon: '11d' },
      96: { description: 'Thunderstorm with hail', icon: '11d' },
      99: { description: 'Thunderstorm with heavy hail', icon: '11d' }
    };
    
    return weatherCodes[code] || { description: 'Unknown weather', icon: '02d' };
  }

  // Convert Open-Meteo response to our standard weather format
  static convertOpenMeteoData(data: unknown, units: string) {
    // Define minimal types for the Open-Meteo response we use
    type OpenMeteoHourly = {
      time: string[];
      temperature_2m: number[];
      relative_humidity_2m: number[];
      precipitation_probability: number[];
      weather_code: number[];
      wind_speed_10m: number[];
    };
    type OpenMeteoDaily = {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max?: number[];
    };
    type OpenMeteoCurrent = {
      temperature: number;
      windspeed: number;
      weathercode: number;
    };
    type OpenMeteoResponse = {
      current_weather?: OpenMeteoCurrent;
      hourly?: OpenMeteoHourly;
      daily?: OpenMeteoDaily;
      utc_offset_seconds?: number;
      temperature_unit?: string;
    };

    const d = (data as OpenMeteoResponse) || {};
    const current = d.current_weather;
    const hourly = d.hourly || { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], weather_code: [], wind_speed_10m: [] } as OpenMeteoHourly;
    const daily = d.daily || { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [] } as OpenMeteoDaily;
    
    const currentWeatherInfo = this.convertWeatherCode(current.weathercode);
    
    // Convert temperature if needed
    let currentTemp = current.temperature;
    if (units === 'imperial' && d.temperature_unit === 'celsius') {
      currentTemp = (currentTemp * 9/5) + 32;
    }
    
    // Build hourly forecast (next 24 hours)
    const hourlyForecast = [];
    const currentTime = new Date().getTime();
    
    for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
      const hourTime = new Date(hourly.time[i]).getTime();
      if (hourTime >= currentTime) {
        const weatherInfo = this.convertWeatherCode(hourly.weather_code[i]);
        hourlyForecast.push({
          dt: Math.floor(hourTime / 1000),
          temp: hourly.temperature_2m[i],
          weather: [{ 
            icon: weatherInfo.icon, 
            description: weatherInfo.description 
          }],
          pop: (hourly.precipitation_probability[i] || 0) / 100
        });
      }
    }
    
    // Build daily forecast (next 7 days)
    const dailyForecast = [];
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const weatherInfo = this.convertWeatherCode(daily.weather_code[i]);
      dailyForecast.push({
        dt: Math.floor(new Date(daily.time[i]).getTime() / 1000),
        temp: {
          max: daily.temperature_2m_max[i],
          min: daily.temperature_2m_min[i]
        },
        weather: [{
          icon: weatherInfo.icon,
          description: weatherInfo.description
        }]
      });
    }
    
    return this.toNormalizedShape({
      current: {
        dt: Math.floor(currentTime / 1000),
        temp: Math.round(currentTemp),
        humidity: hourly.relative_humidity_2m[0] || 65,
        pressure: 1013, // Standard atmospheric pressure as fallback
        wind_speed: current.windspeed,
        uvi: 5, // Moderate UV as fallback
        weather: [currentWeatherInfo]
      },
      hourly: hourlyForecast,
      daily: dailyForecast,
      timezone_offset: d.utc_offset_seconds || 0
    });
  }

  // Convert OpenWeather OneCall (2.5/3.0) to normalized shape
  static convertOpenWeatherData(data: any, units: string) {
    try {
      const current = data.current || {};
      const hourly = Array.isArray(data.hourly) ? data.hourly : [];
      const daily = Array.isArray(data.daily) ? data.daily : [];

      const hourlyNorm = hourly.slice(0, 24).map((h: any) => ({
        dt: h.dt,
        temp: h.temp,
        weather: [{ icon: h.weather?.[0]?.icon || '02d', description: h.weather?.[0]?.description || 'Unknown' }],
        pop: typeof h.pop === 'number' ? h.pop : 0,
      }));

      const dailyNorm = daily.slice(0, 7).map((d: any) => ({
        dt: d.dt,
        temp: { max: d.temp?.max, min: d.temp?.min },
        weather: [{ icon: d.weather?.[0]?.icon || '02d', description: d.weather?.[0]?.description || 'Unknown' }],
      }));

      return this.toNormalizedShape({
        current: {
          dt: current.dt || Math.floor(Date.now() / 1000),
          temp: Math.round(current.temp ?? 0),
          humidity: current.humidity ?? 65,
          pressure: current.pressure ?? 1013,
          wind_speed: current.wind_speed ?? 0,
          uvi: current.uvi ?? 5,
          weather: [{ icon: current.weather?.[0]?.icon || '02d', description: current.weather?.[0]?.description || 'Unknown' }],
        },
        hourly: hourlyNorm,
        daily: dailyNorm,
        timezone_offset: data.timezone_offset ?? 0,
      });
    } catch (e) {
      throw new Error('Failed to convert OpenWeather data');
    }
  }

  // Merge two normalized datasets: prefer live temperature average, max precip prob, and pick best icons/descriptions
  static mergeWeatherData(primary: any, secondary: any) {
    if (!secondary) return primary;
    const merged = JSON.parse(JSON.stringify(primary));

    // Current: average temperature, choose higher wind, take non-empty weather description/icon
    if (secondary.current) {
      const temps = [primary.current?.temp, secondary.current?.temp].filter((v) => typeof v === 'number');
      if (temps.length === 2) merged.current.temp = Math.round((temps[0] + temps[1]) / 2);
      merged.current.wind_speed = Math.max(primary.current?.wind_speed || 0, secondary.current?.wind_speed || 0);
      merged.current.humidity = Math.round(((primary.current?.humidity ?? 65) + (secondary.current?.humidity ?? 65)) / 2);
      merged.current.pressure = primary.current?.pressure || secondary.current?.pressure || 1013;
      const desc = primary.current?.weather?.[0]?.description || secondary.current?.weather?.[0]?.description;
      const icon = primary.current?.weather?.[0]?.icon || secondary.current?.weather?.[0]?.icon;
      merged.current.weather = [{ description: desc || 'Updated conditions', icon: icon || '02d' }];
    }

    // Hourly: merge by dt; prefer higher precip prob and average temps
    const byDt: Record<number, any> = {};
    for (const h of primary.hourly || []) byDt[h.dt] = { ...h };
    for (const h of secondary.hourly || []) {
      const ex = byDt[h.dt];
      if (!ex) byDt[h.dt] = { ...h };
      else {
        const t1 = typeof ex.temp === 'number' ? ex.temp : undefined;
        const t2 = typeof h.temp === 'number' ? h.temp : undefined;
        byDt[h.dt].temp = t1 !== undefined && t2 !== undefined ? Math.round((t1 + t2) / 2) : (t1 ?? t2);
        byDt[h.dt].pop = Math.max(ex.pop ?? 0, h.pop ?? 0);
        byDt[h.dt].weather = [ex.weather?.[0] || h.weather?.[0] || { icon: '02d', description: 'Forecast' }];
      }
    }
    merged.hourly = Object.values(byDt).sort((a: any, b: any) => a.dt - b.dt).slice(0, 24);

    // Daily: merge by dt; average temps and keep description
    const byDtD: Record<number, any> = {};
    for (const d of primary.daily || []) byDtD[d.dt] = { ...d };
    for (const d of secondary.daily || []) {
      const ex = byDtD[d.dt];
      if (!ex) byDtD[d.dt] = { ...d };
      else {
        const maxes = [ex.temp?.max, d.temp?.max].filter((v) => typeof v === 'number') as number[];
        const mins = [ex.temp?.min, d.temp?.min].filter((v) => typeof v === 'number') as number[];
        if (maxes.length === 2) byDtD[d.dt].temp.max = Math.round((maxes[0] + maxes[1]) / 2);
        if (mins.length === 2) byDtD[d.dt].temp.min = Math.round((mins[0] + mins[1]) / 2);
        byDtD[d.dt].weather = [ex.weather?.[0] || d.weather?.[0] || { icon: '02d', description: 'Forecast' }];
      }
    }
    merged.daily = Object.values(byDtD).sort((a: any, b: any) => a.dt - b.dt).slice(0, 7);

    return merged;
  }

  // Enhanced weather fetching with multiple sources
  static async getAccurateWeather(lat: number, lon: number, units: string = 'metric', apiKey?: string) {
    console.log(`🌍 Getting accurate weather for coordinates: ${lat}, ${lon}`);

    // If we have API key, try to combine Open-Meteo + OpenWeather concurrently
    if (apiKey && apiKey !== 'your_api_key_here' && apiKey !== 'YOUR_API_KEY') {
      const [meteoRes, owmRes] = await Promise.allSettled([
        this.getOpenMeteoWeather(lat, lon, units),
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,alerts&appid=${apiKey}`).then((r) => r.ok ? r.json() : Promise.reject(new Error('OWM bad response')))
      ]);

      const meteo = meteoRes.status === 'fulfilled' ? meteoRes.value : null;
      const owmRaw = owmRes.status === 'fulfilled' ? owmRes.value : null;
      const owm = owmRaw ? this.convertOpenWeatherData(owmRaw, units) : null;

      if (meteo && owm) {
        const merged = this.mergeWeatherData(meteo, owm);
        return { data: merged, source: 'Merged (Open-Meteo + OpenWeather)' };
      }
      if (meteo) return { data: meteo, source: 'Open-Meteo (Live)' };
      if (owm) return { data: owm, source: 'OpenWeatherMap (Live)' };
    } else {
      // No API key: fall back to Open-Meteo only
      try {
        const meteo = await this.getOpenMeteoWeather(lat, lon, units);
        return { data: meteo, source: 'Open-Meteo (Live)' };
      } catch (e) {
        // fall through to error
      }
    }

    throw new Error('All weather sources failed. Please check your internet connection.');
  }
}