// Enhanced Weather API with multiple sources for accurate weather data
export interface WeatherSource {
  name: string;
  baseUrl: string;
  requiresAuth: boolean;
}

export class EnhancedWeatherAPI {
  private static readonly WEATHER_SOURCES: WeatherSource[] = [
    {
      name: 'OpenWeatherMap',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      requiresAuth: true
    },
    {
      name: 'WeatherAPI',
      baseUrl: 'https://api.weatherapi.com/v1',
      requiresAuth: true
    },
    {
      name: 'Open-Meteo',
      baseUrl: 'https://api.open-meteo.com/v1',
      requiresAuth: false
    }
  ];

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
    
    return {
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
    };
  }

  // Enhanced weather fetching with multiple sources
  static async getAccurateWeather(lat: number, lon: number, units: string = 'metric', apiKey?: string) {
    console.log(`🌍 Getting accurate weather for coordinates: ${lat}, ${lon}`);
    
    // Try Open-Meteo first (free, no API key required)
    try {
      const weather = await this.getOpenMeteoWeather(lat, lon, units);
      console.log('✅ Successfully got live weather from Open-Meteo');
      return { data: weather, source: 'Open-Meteo (Live)' };
    } catch (error) {
      console.log('⚠️ Open-Meteo failed, trying other sources...');
    }
    
    // Try OpenWeatherMap if API key is available
    if (apiKey && apiKey !== 'your_api_key_here' && apiKey !== 'YOUR_API_KEY') {
      try {
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,alerts&appid=${apiKey}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully got weather from OpenWeatherMap API');
          return { data, source: 'OpenWeatherMap (Live)' };
        }
      } catch (error) {
        console.log('⚠️ OpenWeatherMap API failed:', error);
      }
    }
    
    throw new Error('All weather sources failed. Please check your internet connection.');
  }
}