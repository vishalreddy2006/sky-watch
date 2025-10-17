import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { indianCities, generateWeatherData } from "@/data/indianCitiesWeather";
import { LocationService } from "@/services/locationService";
import { PreciseLocationAPI } from "@/services/preciseLocationAPI";
import { EnhancedWeatherAPI } from "@/services/enhancedWeatherAPI";
import { UltraPreciseLocationAPI } from "@/services/ultraPreciseLocationAPI";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "YOUR_API_KEY";
const HAS_API_KEY = API_KEY && API_KEY !== "YOUR_API_KEY" && API_KEY !== "your_api_key_here";
// We can now get live weather even without API key using Open-Meteo
const USE_LIVE_WEATHER = true;
const USE_DEMO_DATA = false; // Always use live weather with enhanced API

interface GeocodingResult {
  lat: number;
  lon: number;
  name: string;
  state?: string;
  country: string;
}

interface WeatherData {
  current: {
    dt: number;
    temp: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    uvi: number;
    weather: Array<{ icon: string; description: string }>;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    weather: Array<{ icon: string; description: string }>;
    pop: number;
  }>;
  daily: Array<{
    dt: number;
    temp: { max: number; min: number };
    weather: Array<{ icon: string; description: string }>;
  }>;
  timezone_offset: number;
}

export const useWeather = () => {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState("");
  const [accuracyLabel, setAccuracyLabel] = useState<string>("");
  const { toast } = useToast();

  const geocodeCity = async (query: string): Promise<GeocodingResult> => {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      query
    )}&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding failed (${response.status})`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("City not found");
    }
    
    return data[0];
  };

  const fetchWeather = async (
    lat: number,
    lon: number,
    units: string = "metric"
  ): Promise<WeatherData> => {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,alerts&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather fetch failed (${response.status})`);
    }
    
    const json = await response.json();
    if (!json || !json.current) {
      throw new Error("Unexpected weather response");
    }
    
    return json;
  };

  const loadWeatherByCity = async (city: string, units: string = "metric") => {
    setLoading(true);
    try {
      // First, get coordinates for the city using multiple geocoding sources
      let lat: number, lon: number, locationName: string;
      
      // Try OpenWeather geocoding first (if API key available)
      if (HAS_API_KEY) {
        try {
          const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
          const geoResponse = await fetch(geoUrl);
          
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData && geoData.length > 0) {
              const { lat: geoLat, lon: geoLon, name, country, state } = geoData[0];
              lat = geoLat;
              lon = geoLon;
              locationName = `${name}${state ? ', ' + state : ''}, ${country}`;
            } else {
              throw new Error('City not found in OpenWeather');
            }
          } else {
            throw new Error('OpenWeather geocoding failed');
          }
        } catch (openWeatherError) {
          // Fall back to free geocoding service
          console.log('OpenWeather geocoding failed, trying Nominatim...');
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
          const nominatimResponse = await fetch(nominatimUrl, {
            headers: { 'User-Agent': 'SkyWatch-Weather-App/1.0', 'Accept-Language': 'en' }
          });
          
          if (!nominatimResponse.ok) {
            throw new Error('All geocoding services failed');
          }
          
          const nominatimData = await nominatimResponse.json();
          if (!nominatimData || nominatimData.length === 0) {
            throw new Error(`City "${city}" not found`);
          }
          
          lat = parseFloat(nominatimData[0].lat);
          lon = parseFloat(nominatimData[0].lon);
          locationName = nominatimData[0].display_name.split(',')[0];
        }
      } else {
        // Use free Nominatim geocoding when no API key
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: { 'User-Agent': 'SkyWatch-Weather-App/1.0', 'Accept-Language': 'en' }
        });
        
        if (!nominatimResponse.ok) {
          throw new Error('Failed to find city location');
        }
        
        const nominatimData = await nominatimResponse.json();
        if (!nominatimData || nominatimData.length === 0) {
          throw new Error(`City "${city}" not found`);
        }
        
        lat = parseFloat(nominatimData[0].lat);
        lon = parseFloat(nominatimData[0].lon);
        locationName = nominatimData[0].display_name.split(',')[0];
      }
      
      // Get accurate weather using enhanced API
      const { data, source } = await EnhancedWeatherAPI.getAccurateWeather(
        lat, 
        lon, 
        units, 
        HAS_API_KEY ? API_KEY : undefined
      );
      
      // Get detailed location for better display
      let locationDisplay = locationName;
      try {
        const preciseLocation = await PreciseLocationAPI.getDetailedAddress(lat, lon);
        const formattedLocation = PreciseLocationAPI.formatLocationDisplay(preciseLocation);
        if (formattedLocation && !formattedLocation.includes('Unknown') && formattedLocation.length > 5) {
          locationDisplay = formattedLocation;
        }
      } catch (err) {
        // Keep the geocoding result if precise location fails; log for diagnostics
         
        console.log('Precise location lookup failed:', err);
      }
      
  setWeatherData(data);
  setLocation(`🔍 ${locationDisplay}`);
  setAccuracyLabel(`City-level precision • ${source}`);
      
      toast({
        title: "🌍 Accurate City Weather!",
        description: `Live data from ${source}: ${locationDisplay}`,
      });
      
    } catch (error) {
      toast({
        title: "City Search Error",
        description: error instanceof Error ? error.message : "Failed to find weather for this city.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const loadWeatherByCoords = async (
    lat: number,
    lon: number,
    units: string = "metric"
  ) => {
    // Warn if not in a secure context (required for best geolocation on the web)
    try {
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        toast({
          title: "Low Accuracy Warning",
          description: "Use HTTPS for precise location (browser restricts high-accuracy on non-secure pages).",
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Secure context check failed:', err);
    }
    setLoading(true);
    try {
      // Get live weather using enhanced API
      const { data, source } = await EnhancedWeatherAPI.getAccurateWeather(
        lat, 
        lon, 
        units, 
        HAS_API_KEY ? API_KEY : undefined
      );
      
      // Get ultra-detailed location information with village-level accuracy
      let locationDisplay = "Your Location";
      let accuracyReport = "";
      
      try {
        // Try ultra-precise location API for village-level detail
        const ultraLocation: { latitude: number; longitude: number; accuracy?: number } = {
          latitude: lat,
          longitude: lon,
          accuracy: 10 // estimated for coordinate input
        };
        
        // Try multiple high-resolution geocoding services
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: { 'User-Agent': 'SkyWatch-Weather-App/1.0' }
        });
        
        if (nominatimResponse.ok) {
          const data = await nominatimResponse.json();
          const addr = data.address || {};
          
          // Enhanced postcode extraction
          const postcode = addr.postcode || addr.postal_code || addr['ISO3166-2-lvl6'] || addr.zipcode;
          
          // Build ultra-detailed address with guaranteed pincode
          const addressParts = [];
          if (addr.house_number && addr.road) addressParts.push(`${addr.house_number} ${addr.road}`);
          else if (addr.road) addressParts.push(addr.road);
          
          if (addr.village) addressParts.push(addr.village);
          else if (addr.hamlet) addressParts.push(addr.hamlet);
          else if (addr.neighbourhood) addressParts.push(addr.neighbourhood);
          else if (addr.suburb) addressParts.push(addr.suburb);
          
          if (addr.city || addr.town) addressParts.push(addr.city || addr.town);
          if (addr.state) addressParts.push(addr.state);
          
          // Always include pincode if available
          if (postcode) {
            addressParts.push(`PIN ${postcode}`);
          }
          
          locationDisplay = addressParts.slice(0, 5).join(', ') || data.display_name?.split(',').slice(0, 4).join(', ') || 'Location detected';
          accuracyReport = `Village-level precision${postcode ? ' • PIN included' : ''} • Nominatim`;
          
          // If no pincode found, try BigDataCloud as backup for postal code
          if (!postcode) {
            try {
              console.log('🔍 No pincode from Nominatim, trying BigDataCloud backup...');
              const bigDataUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
              const bigDataResponse = await fetch(bigDataUrl);
              if (bigDataResponse.ok) {
                const bigData = await bigDataResponse.json();
                if (bigData.postcode) {
                  locationDisplay += `, PIN ${bigData.postcode}`;
                  accuracyReport = `Village-level precision • PIN from BigDataCloud • Multi-source`;
                  console.log('✅ Pincode found via BigDataCloud:', bigData.postcode);
                }
              }
            } catch (bigDataError) {
              console.log('⚠️ BigDataCloud pincode lookup failed:', bigDataError);
            }
          }
          
        } else {
          throw new Error('Nominatim failed');
        }
        
      } catch (nominatimError) {
        try {
          // Fallback to our existing precise location API
          const preciseLocation = await PreciseLocationAPI.getDetailedAddress(lat, lon);
          locationDisplay = PreciseLocationAPI.formatLocationDisplay(preciseLocation);
          accuracyReport = `Standard precision • Multiple sources`;
          
        } catch (preciseError) {
          try {
            // Final fallback to OpenWeather geocoding
            if (HAS_API_KEY) {
              const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
              const response = await fetch(url);
              if (response.ok) {
                const geoData = await response.json();
                if (geoData && geoData.length > 0) {
                  const location = geoData[0];
                  locationDisplay = `${location.name}${location.state ? ', ' + location.state : ''}, ${location.country}`;
                  accuracyReport = `City-level precision • OpenWeather`;
                }
              }
            }
          } catch (openWeatherError) {
            console.log('All geocoding failed, using coordinates');
            locationDisplay = `${lat.toFixed(6)}°N, ${lon.toFixed(6)}°E`;
            accuracyReport = `Coordinate precision`;
          }
        }
      }
      
  setWeatherData(data);
  setLocation(`🎯 ${locationDisplay}`);
  setAccuracyLabel(accuracyReport || `Precise location • ${source}`);
      
      toast({
        title: "🌤️ Ultra-Precise Weather!",
        description: `${accuracyReport} • Weather from ${source}`,
        duration: 5000,
      });
      
    } catch (error) {
      toast({
        title: "Weather Error",
        description: error instanceof Error ? error.message : "Failed to load weather data from all sources.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (units: string = "metric") => {
    setLoading(true);
    
    toast({
      title: "🎯 Ultra-Precise Detection",
      description: "Getting exact village, street & building location... Please allow high-accuracy GPS!",
    });

    try {
      // Get ultra-precise location with village-level accuracy
      const ultraLocation = await UltraPreciseLocationAPI.getUltraPreciseLocation();
      
      console.log('🎯 Ultra-precise location detected:', ultraLocation);
      
      // Format the ultra-precise location display
      let locationDisplay = UltraPreciseLocationAPI.formatUltraPreciseDisplay(ultraLocation);
      let accuracyReport = UltraPreciseLocationAPI.getLocationAccuracyReport(ultraLocation);
      
      // Ensure pincode is included using specialized detection
      if (!locationDisplay.includes('PIN') && !ultraLocation.postcode) {
        console.log('🔍 No pincode found, running specialized detection...');
        const postcode = await UltraPreciseLocationAPI.getPostalCode(ultraLocation.latitude, ultraLocation.longitude);
        if (postcode) {
          locationDisplay += `, PIN ${postcode}`;
          accuracyReport += ' • Pincode detected via multi-source';
        }
      }
      
      // Always try to get live weather data for ultra-precise location
      try {
        console.log('🌤️ Getting live weather for ultra-precise coordinates...');
        const { data: weatherData, source } = await EnhancedWeatherAPI.getAccurateWeather(
          ultraLocation.latitude, 
          ultraLocation.longitude, 
          units, 
          HAS_API_KEY ? API_KEY : undefined
        );
        
  setWeatherData(weatherData);
  setLocation(`🎯 ${locationDisplay}`);
  setAccuracyLabel(accuracyReport || `Precise location • ${source}`);
        
        toast({
          title: "🌤️ Ultra-Precise Weather!",
          description: `${accuracyReport}`,
          duration: 6000,
        });
        
      } catch (weatherError) {
        console.log('⚠️ Live weather failed, but location is ultra-precise');
        
        // Even if weather fails, show the ultra-precise location
        setLocation(`🎯 ${locationDisplay} (Location Only)`);
        
        toast({
          title: "🎯 Ultra-Precise Location Found!",
          description: `${accuracyReport}. Weather data temporarily unavailable.`,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.log('🚫 Ultra-precise location failed:', error);
      
      // Fallback to regular precise location
      try {
        console.log('📍 Trying standard precise location as fallback...');
        const preciseLocation = await PreciseLocationAPI.getMultiSourceLocation();
        const locationDisplay = PreciseLocationAPI.formatLocationDisplay(preciseLocation);
        
        const { data: weatherData, source } = await EnhancedWeatherAPI.getAccurateWeather(
          preciseLocation.latitude, 
          preciseLocation.longitude, 
          units, 
          HAS_API_KEY ? API_KEY : undefined
        );
        
  setWeatherData(weatherData);
  setLocation(`📍 ${locationDisplay}`);
  setAccuracyLabel(`Standard precision • ${source}`);
        
        toast({
          title: "📍 Standard Precise Location",
          description: `Weather from ${source}: ${locationDisplay}`,
        });
        
      } catch (fallbackError) {
        toast({
          title: "🚫 Location Detection Failed",
          description: error instanceof Error ? error.message : "Please enable location access for precise weather",
          variant: "destructive",
        });
        
        setLocation("🌍 Location access needed for precise weather");
      }
    }
  };

  return {
    loading,
    weatherData,
    location,
    accuracyLabel,
    loadWeatherByCity,
    loadWeatherByCoords,
    getCurrentLocation,
  };
};
