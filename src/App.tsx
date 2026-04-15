import React, { useEffect, useState } from 'react';
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

export default function AppNavigator() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const [category, setCategory] = useState<CategoryName>('전체');
  const [banner, setBanner] = useState<WeatherRecommendation>(DEFAULT_BANNER);
  const [spinCount, setSpinCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rec = await fetchWeatherRecommendation();
      if (cancelled) return;
      setBanner(rec);
      setCategory(rec.category);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function goToResult(result: Menu) {
    setScreen({ name: 'result', params: { result } });
  }

  function goHome() {
    setScreen({ name: 'home' });
  }

  switch (screen.name) {
    case 'home':
      return (
        <HomeScreen
          category={category}
          onCategoryChange={setCategory}
          banner={banner}
          spinCount={spinCount}
          onSpinCountChange={setSpinCount}
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
