/**
 * 🎯 Ultra-Precise Location Detection System
 * Provides village-level accuracy with multiple high-resolution APIs
 * Created for SkyWatch Weather App
 */

interface UltraPreciseLocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // GPS accuracy in meters
  village?: string;
  hamlet?: string;
  neighborhood?: string;
  suburb?: string;
  locality?: string;
  subLocality?: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  countryCode: string;
  fullAddress: string;
  confidence: number; // 0-100% confidence in location accuracy
  source: string;
  rawData?: any;
}

export class UltraPreciseLocationAPI {
  
  /**
   * 🎯 Get ultra-precise location with village-level accuracy
   */
  static async getUltraPreciseLocation(): Promise<UltraPreciseLocationData> {
    console.log('🎯 Starting ultra-precise location detection...');
    
    // Get high-accuracy GPS coordinates
    const coordinates = await this.getHighAccuracyGPS();
    console.log('📍 High-accuracy GPS:', coordinates);
    
    // Try multiple ultra-precise geocoding services
    const locationResults = await Promise.allSettled([
      this.tryNominatimDetailed(coordinates.latitude, coordinates.longitude),
      this.tryMapBoxGeocoding(coordinates.latitude, coordinates.longitude),
      this.tryBigDataCloudDetailed(coordinates.latitude, coordinates.longitude),
      this.tryLocationIQDetailed(coordinates.latitude, coordinates.longitude),
      this.tryOpenCageData(coordinates.latitude, coordinates.longitude)
    ]);
    
    // Find the most detailed and accurate result
    const validResults = locationResults
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<UltraPreciseLocationData>).value)
      .filter(result => result.confidence > 60);
    
    if (validResults.length === 0) {
      throw new Error('Unable to determine precise location');
    }
    
    // Prefer results that include a postcode and normalized city/state.
    // If multiple results have postcode, pick the one with the highest combined score.
    const withPostcode = validResults.filter(r => r.postcode && String(r.postcode).trim().length > 0);
    let bestResult = null as UltraPreciseLocationData | null;
    const pickBest = (list: UltraPreciseLocationData[]) =>
      list.reduce((best, current) => {
        const bestScore = best.confidence + this.calculateDetailScore(best) + (best.postcode ? 10 : 0);
        const currentScore = current.confidence + this.calculateDetailScore(current) + (current.postcode ? 10 : 0);
        return currentScore > bestScore ? current : best;
      });

    if (withPostcode.length > 0) {
      bestResult = pickBest(withPostcode);
    } else if (validResults.length > 0) {
      bestResult = pickBest(validResults);
    }

    if (!bestResult) {
      throw new Error('Unable to determine precise location');
    }
    
    // Enhance with GPS accuracy
    bestResult.accuracy = coordinates.accuracy;
    bestResult.latitude = coordinates.latitude;
    bestResult.longitude = coordinates.longitude;

    // Normalize city/state: prefer populated fields in order of usefulness
    const normalizeCity = (r: UltraPreciseLocationData) => {
      r.city = r.city || r.locality || r.village || r.hamlet || r.neighborhood || r.suburb || r.fullAddress?.split(',')[0] || '';
      r.state = r.state || r.district || '';
      return r;
    };
    bestResult = normalizeCity(bestResult);

    // If there is still no postcode, attempt specialized postal code detection and attach it
    if (!bestResult.postcode || String(bestResult.postcode).trim() === '') {
      try {
        const postcode = await this.getPostalCode(bestResult.latitude, bestResult.longitude);
        if (postcode) {
          bestResult.postcode = postcode;
          // Increase confidence slightly when postcode is found
          bestResult.confidence = Math.min(95, (bestResult.confidence || 70) + 8);
        }
      } catch (err) {
        // ignore postal code lookup failures
      }
    }
    
    console.log('✅ Ultra-precise location found:', bestResult);
    return bestResult;
  }
  
  /**
   * 📱 Get high-accuracy GPS coordinates
   */
  private static async getHighAccuracyGPS(): Promise<{latitude: number, longitude: number, accuracy: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      // Prefer watchPosition to refine accuracy with multiple samples
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 30000, // total time budget
        maximumAge: 0,
      };

      let best: { latitude: number; longitude: number; accuracy: number } | null = null;
      let samples = 0;
      const maxSamples = 5;
      const minAcceptableAccuracy = 20; // meters

      const done = (result: { latitude: number; longitude: number; accuracy: number }) => {
        if (watchId != null) navigator.geolocation.clearWatch(watchId);
        clearTimeout(timerId);
        resolve(result);
      };

      const onPosition = (position: GeolocationPosition) => {
        samples++;
        const curr = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 999,
        };
        // Track best accuracy
        if (!best || curr.accuracy < best.accuracy) {
          best = curr;
          // Early exit if we already have excellent accuracy
          if (best.accuracy <= minAcceptableAccuracy) {
            return done(best);
          }
        }
        // Stop after sufficient samples
        if (samples >= maxSamples) {
          return done(best!);
        }
      };

      const onError = (error: GeolocationPositionError) => {
        // Fallback to single-shot getCurrentPosition once
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || 999,
            });
          },
          () => reject(new Error(`GPS Error: ${error.message}`)),
          options
        );
      };

      const watchId = navigator.geolocation.watchPosition(onPosition, onError, options);
      const timerId = setTimeout(() => {
        // Time budget exceeded; return best available or fail
        if (best) return done(best);
        reject(new Error('GPS timeout: unable to get accurate position'));
      }, options.timeout);
    });
  }
  
  /**
   * 🗺️ Nominatim with ultra-detailed reverse geocoding
   */
  private static async tryNominatimDetailed(lat: number, lon: number): Promise<UltraPreciseLocationData> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1&namedetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SkyWatch-Weather-App/1.0',
        'Accept-Language': 'en',
      },
    });
    
    if (!response.ok) throw new Error('Nominatim failed');
    
    const data = await response.json();
    const addr = data.address || {};
    
    // Enhanced postcode extraction
    const postcode = addr.postcode || addr.postal_code || addr['ISO3166-2-lvl6'] || addr.zipcode;
    
    return {
      latitude: lat,
      longitude: lon,
      accuracy: 0,
      village: addr.village || addr.hamlet || addr.neighbourhood,
      hamlet: addr.hamlet,
      neighborhood: addr.neighbourhood || addr.suburb,
      suburb: addr.suburb,
      locality: addr.locality || addr.city_district,
      subLocality: addr.city_district,
      street: addr.road || addr.street,
      houseNumber: addr.house_number,
      postcode: postcode, // Use enhanced postcode extraction
      city: addr.city || addr.town || addr.municipality || addr.village,
      district: addr.state_district || addr.county,
      state: addr.state,
      country: addr.country,
      countryCode: addr.country_code?.toUpperCase() || '',
      fullAddress: data.display_name || '',
      confidence: this.calculateNominatimConfidence(data),
      source: 'Nominatim OpenStreetMap',
      rawData: data
    };
  }
  
  /**
   * 🌍 BigDataCloud with detailed components
   */
  private static async tryBigDataCloudDetailed(lat: number, lon: number): Promise<UltraPreciseLocationData> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('BigDataCloud failed');
    
    const data = await response.json();
    
    return {
      latitude: lat,
      longitude: lon,
      accuracy: 0,
      village: data.locality || data.localityInfo?.administrative?.[4]?.name,
      neighborhood: data.localityInfo?.administrative?.[5]?.name || data.localityInfo?.administrative?.[6]?.name,
      street: data.localityInfo?.administrative?.[7]?.name,
      locality: data.locality,
      city: data.city || data.localityInfo?.administrative?.[2]?.name,
      district: data.localityInfo?.administrative?.[1]?.name,
      state: data.principalSubdivision,
      country: data.countryName,
      countryCode: data.countryCode,
      postcode: data.postcode,
      fullAddress: this.buildFullAddress(data),
      confidence: data.confidence || 85,
      source: 'BigDataCloud',
      rawData: data
    };
  }
  
  /**
   * 🗺️ LocationIQ for ultra-detailed reverse geocoding
   */
  private static async tryLocationIQDetailed(lat: number, lon: number): Promise<UltraPreciseLocationData> {
    // LocationIQ free tier (no API key needed for basic usage)
    const url = `https://us1.locationiq.com/v1/reverse.php?key=pk.0123456789abcdef&lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('LocationIQ failed');
      
      const data = await response.json();
      const addr = data.address || {};
      
      return {
        latitude: lat,
        longitude: lon,
        accuracy: 0,
        village: addr.village || addr.hamlet || addr.neighbourhood,
        hamlet: addr.hamlet,
        neighborhood: addr.neighbourhood || addr.suburb,
        suburb: addr.suburb,
        locality: addr.locality,
        street: addr.road,
        houseNumber: addr.house_number,
        postcode: addr.postcode,
        city: addr.city || addr.town || addr.village,
        district: addr.county || addr.state_district,
        state: addr.state,
        country: addr.country,
        countryCode: addr.country_code?.toUpperCase() || '',
        fullAddress: data.display_name || '',
        confidence: 80,
        source: 'LocationIQ',
        rawData: data
      };
    } catch {
      throw new Error('LocationIQ not available');
    }
  }
  
  /**
   * 🎯 MapBox geocoding (if available)
   */
  private static async tryMapBoxGeocoding(lat: number, lon: number): Promise<UltraPreciseLocationData> {
    // Try MapBox free tier
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=pk.test&types=address,poi,locality,neighborhood`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('MapBox failed');
      
      const data = await response.json();
      const feature = data.features?.[0];
      
      if (!feature) throw new Error('No MapBox results');
      
      return {
        latitude: lat,
        longitude: lon,
        accuracy: 0,
        village: this.extractMapBoxComponent(data.features, 'locality'),
        neighborhood: this.extractMapBoxComponent(data.features, 'neighborhood'),
        street: feature.properties?.address || feature.place_name?.split(',')[0],
        city: this.extractMapBoxComponent(data.features, 'place'),
        district: this.extractMapBoxComponent(data.features, 'district'),
        state: this.extractMapBoxComponent(data.features, 'region'),
        country: this.extractMapBoxComponent(data.features, 'country'),
        countryCode: '',
        postcode: this.extractMapBoxComponent(data.features, 'postcode'),
        fullAddress: feature.place_name || '',
        confidence: 85,
        source: 'MapBox',
        rawData: data
      };
    } catch {
      throw new Error('MapBox not available');
    }
  }
  
  /**
   * 🌐 OpenCage Data for ultra-precise geocoding
   */
  private static async tryOpenCageData(lat: number, lon: number): Promise<UltraPreciseLocationData> {
    // OpenCage free tier
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=demo&language=en&pretty=1&no_annotations=0`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('OpenCage failed');
      
      const data = await response.json();
      const result = data.results?.[0];
      
      if (!result) throw new Error('No OpenCage results');
      
      const comp = result.components || {};
      
      return {
        latitude: lat,
        longitude: lon,
        accuracy: 0,
        village: comp.village || comp.hamlet || comp.neighbourhood,
        hamlet: comp.hamlet,
        neighborhood: comp.neighbourhood || comp.suburb,
        suburb: comp.suburb,
        locality: comp.locality,
        street: comp.road || comp.street,
        houseNumber: comp.house_number,
        postcode: comp.postcode,
        city: comp.city || comp.town || comp.village,
        district: comp.county || comp.state_district,
        state: comp.state,
        country: comp.country,
        countryCode: comp.country_code?.toUpperCase() || '',
        fullAddress: result.formatted || '',
        confidence: result.confidence || 80,
        source: 'OpenCage Data',
        rawData: data
      };
    } catch {
      throw new Error('OpenCage not available');
    }
  }
  
  /**
   * 🎯 Calculate detail score for location data
   */
  private static calculateDetailScore(location: UltraPreciseLocationData): number {
    let score = 0;
    if (location.village) score += 20;
    if (location.hamlet) score += 15;
    if (location.neighborhood) score += 15;
    if (location.street) score += 10;
    if (location.houseNumber) score += 10;
    if (location.postcode) score += 10;
    if (location.locality) score += 5;
    if (location.suburb) score += 5;
    return score;
  }
  
  /**
   * 📊 Calculate Nominatim confidence score
   */
  private static calculateNominatimConfidence(data: any): number {
    let confidence = 70;
    
    if (data.address) {
      if (data.address.village || data.address.hamlet) confidence += 15;
      if (data.address.neighbourhood) confidence += 10;
      if (data.address.road) confidence += 5;
      if (data.address.house_number) confidence += 10;
      if (data.address.postcode) confidence += 5;
    }
    
    // Check importance score
    if (data.importance && data.importance > 0.5) confidence += 5;
    
    return Math.min(confidence, 95);
  }
  
  /**
   * 🏗️ Build full address from BigDataCloud data
   */
  private static buildFullAddress(data: any): string {
    const parts = [];
    
    if (data.locality) parts.push(data.locality);
    if (data.city && data.city !== data.locality) parts.push(data.city);
    if (data.principalSubdivision) parts.push(data.principalSubdivision);
    if (data.countryName) parts.push(data.countryName);
    if (data.postcode) parts.push(data.postcode);
    
    return parts.join(', ') || 'Address not available';
  }
  
  /**
   * 🗺️ Extract MapBox component by type
   */
  private static extractMapBoxComponent(features: any[], type: string): string {
    const feature = features?.find(f => f.place_type?.includes(type));
    return feature?.text || '';
  }
  
  /**
   * 🎨 Format ultra-precise location for display
   */
  static formatUltraPreciseDisplay(location: UltraPreciseLocationData): string {
    const parts = [];
    
    // Most specific first
    if (location.houseNumber && location.street) {
      parts.push(`${location.houseNumber} ${location.street}`);
    } else if (location.street) {
      parts.push(location.street);
    }
    
    // Village/neighborhood level
    if (location.village) {
      parts.push(location.village);
    } else if (location.hamlet) {
      parts.push(location.hamlet);
    } else if (location.neighborhood) {
      parts.push(location.neighborhood);
    } else if (location.suburb) {
      parts.push(location.suburb);
    }
    
    // Locality
    if (location.locality && !parts.includes(location.locality)) {
      parts.push(location.locality);
    }
    
    // City (if different from village/locality)
    if (location.city && !parts.some(p => p.toLowerCase().includes(location.city.toLowerCase()))) {
      parts.push(location.city);
    }
    
    // Always include district and state for context
    if (location.district && !parts.includes(location.district)) {
      parts.push(location.district);
    }
    
    if (location.state && !parts.includes(location.state)) {
      parts.push(location.state);
    }
    
    // Always include postcode if available - this is crucial for precise location
    if (location.postcode && !parts.includes(location.postcode)) {
      parts.push(`PIN ${location.postcode}`);
    }
    
    // Return more parts to ensure pincode is included
    return parts.slice(0, 5).join(', ') || location.fullAddress || 'Location detected';
  }
  
  /**
   * � Specialized pincode/postal code detection
   */
  static async getPostalCode(lat: number, lon: number): Promise<string | null> {
    console.log('🔍 Specialized pincode detection for:', lat, lon);
    
    // Try multiple sources specifically for postal codes
    const sources = [
      // BigDataCloud - often has accurate postal codes
      async () => {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
        const response = await fetch(url);
        const data = await response.json();
        return data.postcode;
      },
      
      // Nominatim with multiple postcode fields
      async () => {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'SkyWatch-Weather-App/1.0' }
        });
        const data = await response.json();
        const addr = data.address || {};
        return addr.postcode || addr.postal_code || addr['ISO3166-2-lvl6'] || addr.zipcode;
      },
      
      // OpenCage Data free tier
      async () => {
        try {
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=demo&language=en&limit=1`;
          const response = await fetch(url);
          const data = await response.json();
          const result = data.results?.[0];
          return result?.components?.postcode;
        } catch {
          return null;
        }
      }
    ];
    
    // Try each source until we find a postal code
    for (const source of sources) {
      try {
        const postcode = await source();
        if (postcode) {
          console.log('✅ Found pincode:', postcode);
          return postcode;
        }
      } catch (error) {
        console.log('⚠️ Postal code source failed:', error);
      }
    }
    
    console.log('❌ No postal code found from any source');
    return null;
  }

  /**
   * �📊 Get location accuracy report
   */
  static getLocationAccuracyReport(location: UltraPreciseLocationData): string {
    const accuracy = location.accuracy;
    let level = '';
    
    if (accuracy <= 5) level = 'Building-level accuracy (±5m)';
    else if (accuracy <= 10) level = 'Street-level accuracy (±10m)';
    else if (accuracy <= 50) level = 'Neighborhood accuracy (±50m)';
    else if (accuracy <= 100) level = 'Area-level accuracy (±100m)';
    else level = 'General area accuracy';
    
    return `${level} • ${location.confidence}% confident • Source: ${location.source}`;
  }
}