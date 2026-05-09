/**
 * Weather Forecast Service
 * ────────────────────────
 * OpenWeatherMap API for destination weather forecasts.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

class WeatherService {
  constructor() {
    this.apiKey = env.openWeatherApiKey;
  }

  async getForecast(lat, lng) {
    if (!this.apiKey) { logger.warn('OpenWeather not configured'); return null; }
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: { lat, lon: lng, appid: this.apiKey, units: 'metric', cnt: 40 },
        timeout: 10000,
      });

      if (!response.data?.list) return null;

      // Group by date and get daily summary
      const dailyMap = new Map();
      for (const entry of response.data.list) {
        const date = entry.dt_txt.split(' ')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { temps: [], humidity: [], descriptions: [], icons: [], wind: [], rain: [] });
        }
        const d = dailyMap.get(date);
        d.temps.push(entry.main.temp);
        d.humidity.push(entry.main.humidity);
        d.descriptions.push(entry.weather?.[0]?.description || '');
        d.icons.push(entry.weather?.[0]?.icon || '');
        d.wind.push(entry.wind?.speed || 0);
        d.rain.push(entry.pop || 0);
      }

      const forecast = [];
      for (const [date, data] of dailyMap) {
        forecast.push({
          date,
          tempMin: Math.round(Math.min(...data.temps)),
          tempMax: Math.round(Math.max(...data.temps)),
          feelsLike: Math.round(data.temps.reduce((a, b) => a + b, 0) / data.temps.length),
          humidity: Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length),
          description: data.descriptions[Math.floor(data.descriptions.length / 2)] || '',
          icon: data.icons[Math.floor(data.icons.length / 2)] || '',
          windSpeed: Math.round(Math.max(...data.wind) * 10) / 10,
          rainChance: Math.round(Math.max(...data.rain) * 100),
        });
      }

      return {
        forecast,
        summary: this._generateSummary(forecast),
        packingTips: this._generatePackingTips(forecast),
      };
    } catch (error) {
      logger.error('Weather API error:', error.message);
      return null;
    }
  }

  _generateSummary(forecast) {
    if (!forecast.length) return '';
    const avgTemp = Math.round(forecast.reduce((s, d) => s + (d.tempMax + d.tempMin) / 2, 0) / forecast.length);
    const maxRain = Math.max(...forecast.map(d => d.rainChance));
    return `Average temperature: ${avgTemp}°C. ${maxRain > 50 ? 'Rain likely — carry an umbrella.' : 'Mostly dry weather expected.'}`;
  }

  _generatePackingTips(forecast) {
    const tips = [];
    const avgTemp = forecast.reduce((s, d) => s + (d.tempMax + d.tempMin) / 2, 0) / forecast.length;
    if (avgTemp > 30) tips.push('Light, breathable clothing', 'Sunscreen and sunglasses', 'Hat for sun protection');
    else if (avgTemp > 20) tips.push('Light layers', 'Comfortable walking shoes');
    else if (avgTemp > 10) tips.push('Warm layers and jacket', 'Closed-toe shoes');
    else tips.push('Heavy winter clothing', 'Thermal innerwear', 'Gloves and beanie');
    if (forecast.some(d => d.rainChance > 40)) tips.push('Rain jacket or umbrella');
    return tips;
  }
}

module.exports = new WeatherService();
