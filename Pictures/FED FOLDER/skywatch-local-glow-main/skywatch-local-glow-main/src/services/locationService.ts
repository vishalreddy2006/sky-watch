// Location-based weather service
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Major Indian cities with coordinates for location-based matching
export const majorIndianCities = [
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lon: 77.1025 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lon: 78.4867 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lon: 80.3319 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lon: 72.9781 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lon: 73.1812 },
  { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lon: 77.4538 },
  { name: "Ludhiana", state: "Punjab", lat: 30.9010, lon: 75.8573 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lon: 78.0081 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lon: 73.7898 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lon: 77.3178 },
  { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lon: 77.7064 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022 }
];

export class LocationService {
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static findNearestCity(userLat: number, userLon: number) {
    let nearestCity = majorIndianCities[0];
    let minDistance = this.calculateDistance(userLat, userLon, nearestCity.lat, nearestCity.lon);

    for (const city of majorIndianCities) {
      const distance = this.calculateDistance(userLat, userLon, city.lat, city.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    return { city: nearestCity, distance: minDistance };
  }

  static async getCurrentPosition(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Location access failed';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    });
  }
}