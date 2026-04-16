import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Storage } from '@apps-in-toss/framework';
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';
import type { Menu, CategoryName } from './data/menus';
import {
  DEFAULT_BANNER,
  fetchWeatherRecommendation,
  type WeatherRecommendation,
} from './utils/weather';

export interface ResultParams {
  result: Menu;
}

type Screen =
  | { name: 'home' }
  | { name: 'result'; params: ResultParams };

const STORAGE_KEYS = {
  spinCount: 'foodroly.spinCount',
  category: 'foodroly.category',
  spinDay: 'foodroly.spinDay',
  adsWatchedToday: 'foodroly.adsWatchedToday',
} as const;

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function AppNavigator() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const [category, setCategory] = useState<CategoryName>('전체');
  const [banner, setBanner] = useState<WeatherRecommendation>(DEFAULT_BANNER);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(0);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedSpin, savedCategory, savedDay, savedAds, rec] = await Promise.all([
        Storage.getItem(STORAGE_KEYS.spinCount).catch(() => null),
        Storage.getItem(STORAGE_KEYS.category).catch(() => null),
        Storage.getItem(STORAGE_KEYS.spinDay).catch(() => null),
        Storage.getItem(STORAGE_KEYS.adsWatchedToday).catch(() => null),
        fetchWeatherRecommendation(),
      ]);
      if (cancelled) return;

      const today = getTodayKey();
      const isSameDay = savedDay === today;

      if (isSameDay && savedSpin != null) {
        const parsed = parseInt(savedSpin, 10);
        if (Number.isFinite(parsed) && parsed >= 0) setSpinCount(parsed);
      } else {
        setSpinCount(0);
        void Storage.setItem(STORAGE_KEYS.spinDay, today).catch(() => {});
      }

      if (isSameDay && savedAds != null) {
        const parsedAds = parseInt(savedAds, 10);
        if (Number.isFinite(parsedAds) && parsedAds >= 0) setAdsWatchedToday(parsedAds);
      } else {
        setAdsWatchedToday(0);
      }

      setBanner(rec);
      setCategory(savedCategory != null ? (savedCategory as CategoryName) : rec.category);
      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    void Storage.setItem(STORAGE_KEYS.spinCount, String(spinCount)).catch(() => {});
    void Storage.setItem(STORAGE_KEYS.spinDay, getTodayKey()).catch(() => {});
  }, [spinCount]);

  useEffect(() => {
    if (!hydrated.current) return;
    void Storage.setItem(STORAGE_KEYS.adsWatchedToday, String(adsWatchedToday)).catch(() => {});
  }, [adsWatchedToday]);

  useEffect(() => {
    if (!hydrated.current) return;
    void Storage.setItem(STORAGE_KEYS.category, category).catch(() => {});
  }, [category]);

  const goToResult = useCallback((result: Menu) => {
    setScreen({ name: 'result', params: { result } });
  }, []);

  const goHome = useCallback(() => {
    setScreen({ name: 'home' });
  }, []);

  const incrementAdsWatched = useCallback(() => {
    setAdsWatchedToday((n) => n + 1);
  }, []);

  switch (screen.name) {
    case 'home':
      return (
        <HomeScreen
          category={category}
          onCategoryChange={setCategory}
          banner={banner}
          spinCount={spinCount}
          onSpinCountChange={setSpinCount}
          adsWatchedToday={adsWatchedToday}
          onAdWatched={incrementAdsWatched}
          onResult={goToResult}
        />
      );
    case 'result':
      return (
        <ResultScreen
          params={screen.params}
          onRetry={goHome}
          onBack={goHome}
        />
      );
  }
}
