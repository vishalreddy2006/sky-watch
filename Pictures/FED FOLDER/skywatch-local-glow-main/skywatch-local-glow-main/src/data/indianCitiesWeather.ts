export interface CityWeatherData {
  name: string;
  state: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvi: number;
  description: string;
  icon: string;
}

export const indianCities: CityWeatherData[] = [
  // Andhra Pradesh
  { name: "Visakhapatnam", state: "Andhra Pradesh", temp: 30, humidity: 75, windSpeed: 5.2, pressure: 1010, uvi: 8, description: "partly cloudy", icon: "02d" },
  { name: "Vijayawada", state: "Andhra Pradesh", temp: 33, humidity: 68, windSpeed: 4.8, pressure: 1011, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Tirupati", state: "Andhra Pradesh", temp: 31, humidity: 70, windSpeed: 4.5, pressure: 1012, uvi: 8, description: "few clouds", icon: "02d" },
  
  // Arunachal Pradesh
  { name: "Itanagar", state: "Arunachal Pradesh", temp: 24, humidity: 80, windSpeed: 3.2, pressure: 1008, uvi: 6, description: "light rain", icon: "10d" },
  { name: "Tawang", state: "Arunachal Pradesh", temp: 15, humidity: 75, windSpeed: 4.0, pressure: 1005, uvi: 5, description: "scattered clouds", icon: "03d" },
  
  // Assam
  { name: "Guwahati", state: "Assam", temp: 28, humidity: 82, windSpeed: 3.5, pressure: 1009, uvi: 7, description: "moderate rain", icon: "10d" },
  { name: "Dibrugarh", state: "Assam", temp: 27, humidity: 85, windSpeed: 3.8, pressure: 1008, uvi: 6, description: "light rain", icon: "09d" },
  
  // Bihar
  { name: "Patna", state: "Bihar", temp: 35, humidity: 62, windSpeed: 4.2, pressure: 1011, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Gaya", state: "Bihar", temp: 34, humidity: 65, windSpeed: 4.0, pressure: 1012, uvi: 9, description: "few clouds", icon: "02d" },
  
  // Chhattisgarh
  { name: "Raipur", state: "Chhattisgarh", temp: 32, humidity: 68, windSpeed: 4.5, pressure: 1011, uvi: 8, description: "partly cloudy", icon: "02d" },
  { name: "Bilaspur", state: "Chhattisgarh", temp: 31, humidity: 70, windSpeed: 4.2, pressure: 1010, uvi: 8, description: "scattered clouds", icon: "03d" },
  
  // Goa
  { name: "Panaji", state: "Goa", temp: 29, humidity: 78, windSpeed: 5.5, pressure: 1010, uvi: 8, description: "partly cloudy", icon: "02d" },
  { name: "Margao", state: "Goa", temp: 28, humidity: 80, windSpeed: 5.2, pressure: 1009, uvi: 7, description: "few clouds", icon: "02d" },
  
  // Gujarat
  { name: "Ahmedabad", state: "Gujarat", temp: 36, humidity: 55, windSpeed: 5.0, pressure: 1012, uvi: 10, description: "clear sky", icon: "01d" },
  { name: "Surat", state: "Gujarat", temp: 34, humidity: 65, windSpeed: 4.8, pressure: 1011, uvi: 9, description: "few clouds", icon: "02d" },
  { name: "Vadodara", state: "Gujarat", temp: 35, humidity: 58, windSpeed: 4.5, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  
  // Haryana
  { name: "Chandigarh", state: "Haryana", temp: 32, humidity: 60, windSpeed: 4.0, pressure: 1013, uvi: 8, description: "clear sky", icon: "01d" },
  { name: "Gurugram", state: "Haryana", temp: 34, humidity: 58, windSpeed: 4.2, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Faridabad", state: "Haryana", temp: 33, humidity: 62, windSpeed: 4.0, pressure: 1012, uvi: 8, description: "few clouds", icon: "02d" },
  
  // Himachal Pradesh
  { name: "Shimla", state: "Himachal Pradesh", temp: 18, humidity: 65, windSpeed: 3.5, pressure: 1008, uvi: 6, description: "partly cloudy", icon: "02d" },
  { name: "Manali", state: "Himachal Pradesh", temp: 15, humidity: 70, windSpeed: 3.8, pressure: 1005, uvi: 5, description: "scattered clouds", icon: "03d" },
  { name: "Dharamshala", state: "Himachal Pradesh", temp: 20, humidity: 68, windSpeed: 3.2, pressure: 1007, uvi: 6, description: "few clouds", icon: "02d" },
  
  // Jharkhand
  { name: "Ranchi", state: "Jharkhand", temp: 30, humidity: 72, windSpeed: 3.8, pressure: 1010, uvi: 8, description: "scattered clouds", icon: "03d" },
  { name: "Jamshedpur", state: "Jharkhand", temp: 32, humidity: 70, windSpeed: 4.0, pressure: 1011, uvi: 8, description: "partly cloudy", icon: "02d" },
  
  // Karnataka
  { name: "Bengaluru", state: "Karnataka", temp: 27, humidity: 65, windSpeed: 4.2, pressure: 1012, uvi: 7, description: "partly cloudy", icon: "02d" },
  { name: "Mysuru", state: "Karnataka", temp: 28, humidity: 68, windSpeed: 3.8, pressure: 1011, uvi: 7, description: "few clouds", icon: "02d" },
  { name: "Mangaluru", state: "Karnataka", temp: 29, humidity: 80, windSpeed: 5.0, pressure: 1010, uvi: 8, description: "scattered clouds", icon: "03d" },
  { name: "Hubballi", state: "Karnataka", temp: 31, humidity: 62, windSpeed: 4.5, pressure: 1011, uvi: 8, description: "clear sky", icon: "01d" },
  
  // Kerala
  { name: "Thiruvananthapuram", state: "Kerala", temp: 28, humidity: 82, windSpeed: 4.5, pressure: 1009, uvi: 7, description: "light rain", icon: "10d" },
  { name: "Kochi", state: "Kerala", temp: 29, humidity: 80, windSpeed: 4.8, pressure: 1010, uvi: 7, description: "partly cloudy", icon: "02d" },
  { name: "Kozhikode", state: "Kerala", temp: 28, humidity: 78, windSpeed: 5.0, pressure: 1009, uvi: 7, description: "scattered clouds", icon: "03d" },
  
  // Madhya Pradesh
  { name: "Bhopal", state: "Madhya Pradesh", temp: 33, humidity: 60, windSpeed: 4.0, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Indore", state: "Madhya Pradesh", temp: 34, humidity: 58, windSpeed: 4.2, pressure: 1011, uvi: 9, description: "few clouds", icon: "02d" },
  { name: "Gwalior", state: "Madhya Pradesh", temp: 35, humidity: 55, windSpeed: 4.5, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  
  // Maharashtra
  { name: "Mumbai", state: "Maharashtra", temp: 30, humidity: 75, windSpeed: 5.5, pressure: 1011, uvi: 8, description: "partly cloudy", icon: "02d" },
  { name: "Pune", state: "Maharashtra", temp: 29, humidity: 68, windSpeed: 4.8, pressure: 1012, uvi: 8, description: "clear sky", icon: "01d" },
  { name: "Nagpur", state: "Maharashtra", temp: 34, humidity: 62, windSpeed: 4.2, pressure: 1011, uvi: 9, description: "few clouds", icon: "02d" },
  { name: "Nashik", state: "Maharashtra", temp: 31, humidity: 65, windSpeed: 4.5, pressure: 1012, uvi: 8, description: "clear sky", icon: "01d" },
  
  // Manipur
  { name: "Imphal", state: "Manipur", temp: 25, humidity: 78, windSpeed: 3.5, pressure: 1008, uvi: 6, description: "light rain", icon: "10d" },
  
  // Meghalaya
  { name: "Shillong", state: "Meghalaya", temp: 22, humidity: 85, windSpeed: 4.0, pressure: 1007, uvi: 5, description: "moderate rain", icon: "10d" },
  { name: "Cherrapunji", state: "Meghalaya", temp: 20, humidity: 90, windSpeed: 4.5, pressure: 1006, uvi: 4, description: "heavy rain", icon: "09d" },
  
  // Mizoram
  { name: "Aizawl", state: "Mizoram", temp: 23, humidity: 80, windSpeed: 3.8, pressure: 1007, uvi: 6, description: "light rain", icon: "10d" },
  
  // Nagaland
  { name: "Kohima", state: "Nagaland", temp: 22, humidity: 82, windSpeed: 3.5, pressure: 1007, uvi: 6, description: "scattered clouds", icon: "03d" },
  
  // Odisha
  { name: "Bhubaneswar", state: "Odisha", temp: 32, humidity: 72, windSpeed: 4.8, pressure: 1010, uvi: 8, description: "partly cloudy", icon: "02d" },
  { name: "Cuttack", state: "Odisha", temp: 31, humidity: 75, windSpeed: 4.5, pressure: 1010, uvi: 8, description: "scattered clouds", icon: "03d" },
  { name: "Puri", state: "Odisha", temp: 29, humidity: 80, windSpeed: 5.2, pressure: 1009, uvi: 7, description: "few clouds", icon: "02d" },
  
  // Punjab
  { name: "Amritsar", state: "Punjab", temp: 33, humidity: 58, windSpeed: 4.0, pressure: 1013, uvi: 8, description: "clear sky", icon: "01d" },
  { name: "Ludhiana", state: "Punjab", temp: 32, humidity: 62, windSpeed: 3.8, pressure: 1012, uvi: 8, description: "few clouds", icon: "02d" },
  { name: "Jalandhar", state: "Punjab", temp: 31, humidity: 65, windSpeed: 3.5, pressure: 1013, uvi: 8, description: "clear sky", icon: "01d" },
  
  // Rajasthan
  { name: "Jaipur", state: "Rajasthan", temp: 36, humidity: 45, windSpeed: 5.0, pressure: 1013, uvi: 10, description: "clear sky", icon: "01d" },
  { name: "Udaipur", state: "Rajasthan", temp: 34, humidity: 50, windSpeed: 4.5, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Jodhpur", state: "Rajasthan", temp: 38, humidity: 40, windSpeed: 5.5, pressure: 1014, uvi: 10, description: "clear sky", icon: "01d" },
  { name: "Jaisalmer", state: "Rajasthan", temp: 40, humidity: 35, windSpeed: 6.0, pressure: 1015, uvi: 11, description: "clear sky", icon: "01d" },
  
  // Sikkim
  { name: "Gangtok", state: "Sikkim", temp: 18, humidity: 75, windSpeed: 3.2, pressure: 1006, uvi: 5, description: "scattered clouds", icon: "03d" },
  
  // Tamil Nadu
  { name: "Chennai", state: "Tamil Nadu", temp: 32, humidity: 72, windSpeed: 5.2, pressure: 1010, uvi: 9, description: "partly cloudy", icon: "02d" },
  { name: "Coimbatore", state: "Tamil Nadu", temp: 30, humidity: 68, windSpeed: 4.5, pressure: 1011, uvi: 8, description: "few clouds", icon: "02d" },
  { name: "Madurai", state: "Tamil Nadu", temp: 33, humidity: 65, windSpeed: 4.8, pressure: 1011, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Tiruchirappalli", state: "Tamil Nadu", temp: 34, humidity: 62, windSpeed: 4.2, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  
  // Telangana
  { name: "Hyderabad", state: "Telangana", temp: 32, humidity: 65, windSpeed: 4.5, pressure: 1012, uvi: 8, description: "clear sky", icon: "01d" },
  { name: "Warangal", state: "Telangana", temp: 33, humidity: 68, windSpeed: 4.2, pressure: 1011, uvi: 9, description: "few clouds", icon: "02d" },
  { name: "Nizamabad", state: "Telangana", temp: 34, humidity: 62, windSpeed: 4.0, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  
  // Tripura
  { name: "Agartala", state: "Tripura", temp: 28, humidity: 82, windSpeed: 3.5, pressure: 1008, uvi: 7, description: "light rain", icon: "10d" },
  
  // Uttar Pradesh
  { name: "Lucknow", state: "Uttar Pradesh", temp: 35, humidity: 58, windSpeed: 4.2, pressure: 1012, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Kanpur", state: "Uttar Pradesh", temp: 36, humidity: 55, windSpeed: 4.5, pressure: 1013, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Agra", state: "Uttar Pradesh", temp: 34, humidity: 60, windSpeed: 4.0, pressure: 1012, uvi: 9, description: "few clouds", icon: "02d" },
  { name: "Varanasi", state: "Uttar Pradesh", temp: 35, humidity: 62, windSpeed: 4.2, pressure: 1011, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Noida", state: "Uttar Pradesh", temp: 33, humidity: 58, windSpeed: 4.0, pressure: 1013, uvi: 8, description: "clear sky", icon: "01d" },
  
  // Uttarakhand
  { name: "Dehradun", state: "Uttarakhand", temp: 28, humidity: 65, windSpeed: 3.5, pressure: 1010, uvi: 7, description: "partly cloudy", icon: "02d" },
  { name: "Nainital", state: "Uttarakhand", temp: 20, humidity: 70, windSpeed: 3.2, pressure: 1008, uvi: 6, description: "scattered clouds", icon: "03d" },
  { name: "Haridwar", state: "Uttarakhand", temp: 32, humidity: 60, windSpeed: 3.8, pressure: 1011, uvi: 8, description: "clear sky", icon: "01d" },
  
  // West Bengal
  { name: "Kolkata", state: "West Bengal", temp: 32, humidity: 75, windSpeed: 4.8, pressure: 1010, uvi: 8, description: "partly cloudy", icon: "02d" },
  { name: "Darjeeling", state: "West Bengal", temp: 16, humidity: 78, windSpeed: 3.5, pressure: 1005, uvi: 5, description: "scattered clouds", icon: "03d" },
  { name: "Siliguri", state: "West Bengal", temp: 28, humidity: 80, windSpeed: 3.8, pressure: 1008, uvi: 7, description: "light rain", icon: "10d" },
  
  // Union Territories
  { name: "New Delhi", state: "Delhi", temp: 34, humidity: 55, windSpeed: 4.5, pressure: 1013, uvi: 9, description: "clear sky", icon: "01d" },
  { name: "Puducherry", state: "Puducherry", temp: 30, humidity: 78, windSpeed: 5.0, pressure: 1010, uvi: 8, description: "partly cloudy", icon: "02d" },
  { name: "Port Blair", state: "Andaman and Nicobar", temp: 28, humidity: 85, windSpeed: 4.5, pressure: 1008, uvi: 7, description: "light rain", icon: "10d" },
  { name: "Daman", state: "Dadra and Nagar Haveli and Daman and Diu", temp: 32, humidity: 70, windSpeed: 5.2, pressure: 1011, uvi: 8, description: "few clouds", icon: "02d" },
  { name: "Leh", state: "Ladakh", temp: 12, humidity: 45, windSpeed: 4.0, pressure: 1000, uvi: 8, description: "clear sky", icon: "01d" },
  { name: "Srinagar", state: "Jammu and Kashmir", temp: 22, humidity: 60, windSpeed: 3.5, pressure: 1009, uvi: 7, description: "few clouds", icon: "02d" },
  { name: "Jammu", state: "Jammu and Kashmir", temp: 30, humidity: 62, windSpeed: 3.8, pressure: 1011, uvi: 8, description: "clear sky", icon: "01d" },
];

export const generateWeatherData = (city: CityWeatherData) => {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    current: {
      dt: now,
      temp: city.temp,
      humidity: city.humidity,
      pressure: city.pressure,
      wind_speed: city.windSpeed,
      uvi: city.uvi,
      weather: [{ icon: city.icon, description: city.description }],
    },
    hourly: Array.from({ length: 12 }, (_, i) => ({
      dt: now + (i + 1) * 3600,
      temp: city.temp + Math.random() * 4 - 2,
      weather: [{ icon: city.icon, description: city.description }],
      pop: Math.random() * 0.3,
    })),
    daily: Array.from({ length: 7 }, (_, i) => ({
      dt: now + i * 86400,
      temp: { 
        max: city.temp + 3 + Math.random() * 2, 
        min: city.temp - 5 - Math.random() * 2 
      },
      weather: [{ icon: city.icon, description: city.description }],
    })),
    timezone_offset: 19800, // IST offset
  };
};
