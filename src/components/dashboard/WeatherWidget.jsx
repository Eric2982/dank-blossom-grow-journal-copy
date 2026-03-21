import React, { useState } from "react";
import { Cloud, Droplets, MapPin, RefreshCw, AlertCircle } from "lucide-react";

const WMO_CODES = {
  0: { label: "Clear Sky", emoji: "☀️" },
  1: { label: "Mainly Clear", emoji: "🌤️" },
  2: { label: "Partly Cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Icy Fog", emoji: "🌫️" },
  51: { label: "Light Drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Heavy Drizzle", emoji: "🌧️" },
  61: { label: "Light Rain", emoji: "🌧️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Heavy Rain", emoji: "🌧️" },
  71: { label: "Light Snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Heavy Snow", emoji: "❄️" },
  80: { label: "Rain Showers", emoji: "🌦️" },
  81: { label: "Rain Showers", emoji: "🌧️" },
  82: { label: "Violent Showers", emoji: "⛈️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  99: { label: "Thunderstorm", emoji: "⛈️" },
};

export default function WeatherWidget({ indoorTemp, indoorHumidity }) {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [error, setError] = useState("");

  const fetchWeather = async (lat, lon) => {
    setStatus("loading");
    try {
      const [weatherRes, geoRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
        ),
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        ),
      ]);

      const weatherData = await weatherRes.json();
      const geoData = await geoRes.json();

      setWeather(weatherData.current);
      setLocation(
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        geoData.address?.county ||
        "Your Location"
      );
      setStatus("success");
    } catch {
      setError("Failed to load weather data.");
      setStatus("error");
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError("Location access denied. Please allow location to see weather.");
        setStatus("error");
      }
    );
  };

  const wmo = WMO_CODES[weather?.weather_code] || { label: "Unknown", emoji: "🌡️" };

  const TempDiff = ({ indoor, outdoor, label }) => {
    if (indoor == null || outdoor == null) return null;
    const diff = Math.round(indoor - outdoor);
    const color = Math.abs(diff) <= 5 ? "text-emerald-400" : Math.abs(diff) <= 15 ? "text-yellow-400" : "text-red-400";
    return (
      <div className="text-xs text-center">
        <div className={`font-medium ${color}`}>
          {diff > 0 ? `+${diff}` : diff}°F
        </div>
        <div className="text-white/30">{label}</div>
      </div>
    );
  };

  if (status === "idle") {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Outdoor Weather</p>
            <p className="text-white/40 text-xs">Compare indoor vs outdoor conditions</p>
          </div>
        </div>
        <button
          onClick={requestLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors text-xs font-medium"
        >
          <MapPin className="w-3 h-3" /> Enable
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
        <p className="text-white/50 text-sm">Fetching weather…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-white/60 text-xs">{error}</p>
        </div>
        <button onClick={requestLocation} className="text-sky-400 hover:text-sky-300 text-xs underline shrink-0">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-white/60 text-sm">{location}</span>
        </div>
        <button onClick={requestLocation} className="text-white/20 hover:text-white/50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Outdoor stats */}
        <div className="flex items-center gap-4">
          <div className="text-4xl">{wmo.emoji}</div>
          <div>
            <div className="text-2xl font-light text-white">
              {Math.round(weather.temperature_2m)}°F
            </div>
            <div className="text-white/40 text-xs mt-0.5">{wmo.label}</div>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Droplets className="w-3 h-3 text-sky-400" />
              {weather.relative_humidity_2m}% RH
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="text-white/30">💨</span>
              {Math.round(weather.wind_speed_10m)} mph
            </div>
          </div>
        </div>

        {/* Indoor vs Outdoor diff */}
        {(indoorTemp != null || indoorHumidity != null) && (
          <div className="flex items-center gap-4 border-l border-white/5 pl-4">
            <div className="text-center">
              <div className="text-xs text-white/30 mb-1">Indoor</div>
              <div className="flex items-center gap-3">
                {indoorTemp != null && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">{Math.round(indoorTemp)}°F</div>
                    <div className="text-xs text-white/30">Temp</div>
                  </div>
                )}
                {indoorHumidity != null && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">{Math.round(indoorHumidity)}%</div>
                    <div className="text-xs text-white/30">Humidity</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <TempDiff indoor={indoorTemp} outdoor={weather.temperature_2m} label="Δ Temp" />
              <TempDiff indoor={indoorHumidity} outdoor={weather.relative_humidity_2m} label="Δ Hum" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}