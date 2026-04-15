import { WEATHER_API_KEY as ENV_WEATHER_API_KEY } from '@env';
import type { CategoryName } from '../data/menus';

export const WEATHER_API_KEY = ENV_WEATHER_API_KEY ?? '';

// 서울 기본 좌표 (위치 권한 미사용 시 폴백)
const FALLBACK_LAT = 37.5665;
const FALLBACK_LON = 126.9780;

export interface WeatherRecommendation {
  emoji: string;
  text: string;
  category: CategoryName;
}

export const DEFAULT_BANNER: WeatherRecommendation = {
  emoji: '🌤️',
  text: '오늘은 아무거나 좋아요',
  category: '전체',
};

interface OpenWeatherResponse {
  weather?: Array<{ main?: string }>;
  main?: { temp?: number };
}

export function recommendFromWeather(w: OpenWeatherResponse): WeatherRecommendation {
  const main = w.weather?.[0]?.main ?? '';
  const temp = w.main?.temp;

  if (main === 'Rain' || main === 'Drizzle' || main === 'Thunderstorm') {
    return { emoji: '🌧️', text: '비 오는 날엔 따뜻한 국물🍲', category: '국물' };
  }
  if (main === 'Snow') {
    return { emoji: '❄️', text: '눈 오는 날엔 따뜻한 국물🍲', category: '국물' };
  }
  if (typeof temp === 'number' && temp >= 28) {
    return { emoji: '☀️', text: '더운 날엔 가볍게🥗', category: '건강식' };
  }
  if (typeof temp === 'number' && temp <= 5) {
    return { emoji: '🥶', text: '추운 날엔 고기 한 점🥩', category: '고기' };
  }
  return DEFAULT_BANNER;
}

export async function fetchWeatherRecommendation(): Promise<WeatherRecommendation> {
  if (!WEATHER_API_KEY) return DEFAULT_BANNER;
  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${FALLBACK_LAT}&lon=${FALLBACK_LON}` +
      `&appid=${WEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) return DEFAULT_BANNER;
    const data = (await res.json()) as OpenWeatherResponse;
    return recommendFromWeather(data);
  } catch {
    return DEFAULT_BANNER;
  }
}
