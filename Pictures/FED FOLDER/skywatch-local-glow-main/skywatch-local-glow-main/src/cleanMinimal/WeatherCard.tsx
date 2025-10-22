import React, { useEffect, useState } from 'react'

type Props = { coords: { lat: number; lon: number } | null }

export default function WeatherCard({ coords }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [temp, setTemp] = useState<number | null>(null)

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Weather fetch failed')
      const data = await res.json()
      setTemp(Math.round(data.current_weather.temperature))
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (coords) fetchWeather(coords.lat, coords.lon)
  }, [coords])

  return (
    <div className="card">
      <div className="card-title">Current Temperature</div>
      {loading && <div>Loading…</div>}
      {error && <div className="error">{error}</div>}
      {temp !== null && <div className="temp">{temp}°C</div>}
      {!coords && <div className="hint">Enable location or edit coordinates in code</div>}
    </div>
  )
}
