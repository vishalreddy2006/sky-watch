// Enhanced Location API Service for precise location detection
export interface PreciseLocation {
  latitude: number;
  longitude: number;
  address: {
    display_name: string;
    city: string;
    state: string;
    country: string;
    postcode?: string;
    suburb?: string;
    road?: string;
  };
}

export class PreciseLocationAPI {
  // Get high-accuracy GPS coordinates
  static async getCurrentPreciseLocation(): Promise<{lat: number, lon: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by your browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true, // Use GPS for maximum accuracy
        timeout: 15000, // 15 seconds timeout
        maximumAge: 0 // No cached location - always get fresh
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Precise GPS Location:', {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy + ' meters'
          });
          
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Location access failed';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = 'Please allow location access to get weather for KL University area';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'GPS unavailable. Make sure location services are enabled';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out. Please try again';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    });
  }

  // Get detailed address from coordinates using multiple APIs
  static async getDetailedAddress(lat: number, lon: number): Promise<PreciseLocation> {
    // Try multiple geocoding services for best accuracy
    const geocodingServices = [
      {
        name: 'OpenStreetMap',
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        headers: { 'User-Agent': 'SkyWatch-Weather-App/1.0' }
      },
      {
        name: 'BigDataCloud',
        url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        headers: {}
      }
    ];

    for (const service of geocodingServices) {
      try {
        console.log(`Trying ${service.name} for address lookup...`);
        const response = await fetch(service.url, { headers: service.headers });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        let result: PreciseLocation | null = null;

        if (service.name === 'OpenStreetMap' && data.address) {
          result = {
            latitude: lat,
            longitude: lon,
            address: {
              display_name: data.display_name || '',
              city: data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || '',
              state: data.address.state || data.address.state_district || '',
              country: data.address.country || '',
              postcode: data.address.postcode || data.address.postal_code || '',
              suburb: data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.hamlet || '',
              road: data.address.road || data.address.highway || ''
            }
          };
        } else if (service.name === 'BigDataCloud' && data.locality) {
          result = {
            latitude: lat,
            longitude: lon,
            address: {
              display_name: data.locality + ', ' + data.principalSubdivision + ', ' + data.countryName,
              city: data.city || data.locality || '',
              state: data.principalSubdivision || '',
              country: data.countryName || '',
              postcode: data.postcode || '',
              suburb: data.localityInfo?.administrative?.[3]?.name || data.localityInfo?.administrative?.[4]?.name || '',
              road: ''
            }
          };
        }

        // Validate we have meaningful data
        if (result && result.address.city && result.address.city !== '' && !result.address.city.includes('Unknown')) {
          console.log(`Successfully got address from ${service.name}:`, result);
          return result;
        }
        
      } catch (error) {
        console.log(`${service.name} geocoding failed:`, error);
        continue;
      }
    }

    // Final fallback - use coordinates to determine approximate location
    console.log('All geocoding services failed, using coordinate-based fallback');
    let approximateLocation = 'Unknown Location';
    
    // Basic coordinate-based location detection for India
    if (lat >= 8.0 && lat <= 37.0 && lon >= 68.0 && lon <= 97.0) {
      // Rough coordinate-based city detection for major Indian regions
      if (lat >= 17.0 && lat <= 18.0 && lon >= 78.0 && lon <= 79.0) {
        approximateLocation = 'Hyderabad Area, Telangana, India';
      } else if (lat >= 12.8 && lat <= 13.2 && lon >= 77.4 && lon <= 77.8) {
        approximateLocation = 'Bangalore Area, Karnataka, India';
      } else if (lat >= 19.0 && lat <= 19.3 && lon >= 72.7 && lon <= 73.0) {
        approximateLocation = 'Mumbai Area, Maharashtra, India';
      } else if (lat >= 28.4 && lat <= 28.9 && lon >= 76.8 && lon <= 77.3) {
        approximateLocation = 'Delhi NCR Area, Delhi, India';
      } else {
        approximateLocation = `Location ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E, India`;
      }
    } else {
      approximateLocation = `Location ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`;
    }

    return {
      latitude: lat,
      longitude: lon,
      address: {
        display_name: approximateLocation,
        city: approximateLocation.split(',')[0],
        state: approximateLocation.includes(',') ? approximateLocation.split(',')[1]?.trim() || '' : '',
        country: approximateLocation.includes('India') ? 'India' : 'Unknown',
        postcode: '',
        suburb: '',
        road: ''
      }
    };
  }

  // Alternative using IP-based location as backup
  static async getIPLocation(): Promise<{lat: number, lon: number, city: string, region: string, country: string}> {
    const ipServices = [
      'https://ipapi.co/json/',
      'https://api.ipify.org?format=json', // Just for IP, then use another service
      'http://ip-api.com/json/'
    ];

    for (const serviceUrl of ipServices) {
      try {
        console.log(`Trying IP location service: ${serviceUrl}`);
        const response = await fetch(serviceUrl);
        const data = await response.json();
        
        let result = null;
        
        if (serviceUrl.includes('ipapi.co')) {
          result = {
            lat: parseFloat(data.latitude) || 0,
            lon: parseFloat(data.longitude) || 0,
            city: data.city || '',
            region: data.region || '',
            country: data.country_name || data.country || ''
          };
        } else if (serviceUrl.includes('ip-api.com')) {
          result = {
            lat: parseFloat(data.lat) || 0,
            lon: parseFloat(data.lon) || 0,
            city: data.city || '',
            region: data.regionName || data.region || '',
            country: data.country || ''
          };
        }
        
        if (result && result.lat !== 0 && result.lon !== 0 && result.city) {
          console.log('IP location successful:', result);
          return result;
        }
        
      } catch (error) {
        console.log(`IP service ${serviceUrl} failed:`, error);
        continue;
      }
    }

    console.log('All IP services failed, using default location');
    return {
      lat: 17.3850,
      lon: 78.4867,
      city: 'Hyderabad',
      region: 'Telangana',
      country: 'India'
    };
  }

  // Combined location detection with multiple fallbacks
  static async getMultiSourceLocation(): Promise<PreciseLocation> {
    try {
      // Try GPS first (most accurate)
      console.log('🎯 Attempting high-precision GPS location...');
      const gpsCoords = await this.getCurrentPreciseLocation();
      const detailedLocation = await this.getDetailedAddress(gpsCoords.lat, gpsCoords.lon);
      
      console.log('✅ GPS location successful:', detailedLocation);
      return detailedLocation;
      
    } catch (gpsError) {
      console.log('⚠️ GPS failed, trying IP-based location...');
      
      try {
        // Fallback to IP-based location
        const ipLocation = await this.getIPLocation();
        console.log('📍 IP location detected:', ipLocation);
        
        const detailedLocation = await this.getDetailedAddress(ipLocation.lat, ipLocation.lon);
        console.log('✅ IP location with address successful:', detailedLocation);
        return detailedLocation;
        
      } catch (ipError) {
        console.log('❌ All location methods failed, using geographic default');
        
        // Final fallback - use a sensible default based on typical usage
        return {
          latitude: 17.3850,
          longitude: 78.4867,
          address: {
            display_name: 'Hyderabad Metropolitan Area, Telangana, India',
            city: 'Hyderabad',
            state: 'Telangana', 
            country: 'India',
            suburb: 'Metropolitan Area',
            postcode: '500001'
          }
        };
      }
    }
  }

  // Format location for display with proper hierarchy
  static formatLocationDisplay(location: PreciseLocation): string {
    const { address } = location;
    const parts = [];
    
    // Add road/area if available
    if (address.road && address.road.trim()) {
      parts.push(address.road.trim());
    }
    
    // Add suburb/locality if available
    if (address.suburb && address.suburb.trim() && address.suburb !== address.city) {
      parts.push(address.suburb.trim());
    }
    
    // Add city (required)
    if (address.city && address.city.trim()) {
      parts.push(address.city.trim());
    }
    
    // Add pincode if available (prefix with PIN for clarity)
    if (address.postcode && address.postcode.trim()) {
      parts.push(`PIN ${address.postcode.trim()}`);
    }
    
    // Add state if available
    if (address.state && address.state.trim()) {
      parts.push(address.state.trim());
    }
    
    return parts.filter(part => part.length > 0).join(', ');
  }
}