import React, { useEffect, useState } from 'react'
import WeatherCard from './WeatherCard'

export default function App() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    // Try to get browser location, but not required
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => setCoords(null),
        { enableHighAccuracy: false }
      )
    }
  }, [])

  return (
    <div className="app">
      <header className="header">SkyWatch — Clean</header>
      <main className="main">
        <WeatherCard coords={coords} />
      </main>
    </div>
  )
}
