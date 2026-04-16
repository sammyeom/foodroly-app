import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { generateHapticFeedback } from '@apps-in-toss/framework';
import Wheel from '../components/Wheel';
import { theme } from '../theme';
import {
  CATEGORIES,
  getMenusByCategory,
  type CategoryName,
  type Menu,
} from '../data/menus';
import type { WeatherRecommendation } from '../utils/weather';

interface HomeScreenProps {
  category: CategoryName;
  onCategoryChange: (category: CategoryName) => void;
  banner: WeatherRecommendation;
  spinCount: number;
  onSpinCountChange: (updater: (prev: number) => number) => void;
  onResult: (menu: Menu) => void;
}

export default function HomeScreen({
  category,
  onCategoryChange,
  banner,
  spinCount,
  onSpinCountChange,
  onResult,
}: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const cardMaxWidth = Math.min(width - 32, 380);
  const wheelSize = Math.min(cardMaxWidth - 36, 320);

  const [isSpinning, setIsSpinning] = React.useState<boolean>(false);

  const rotation = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);

  const menus = useMemo(() => getMenusByCategory(category), [category]);

  const handleSpin = useCallback(() => {
    if (isSpinning || menus.length === 0) return;
    setIsSpinning(true);

    const n = menus.length;
    const sliceDeg = 360 / n;
    const winnerIdx = Math.floor(Math.random() * n);

    const spins = 6;
    const delta = 360 * spins - (winnerIdx * sliceDeg);
    totalRotation.current += delta;

    rotation.setValue(totalRotation.current - delta);
    Animated.timing(rotation, {
      toValue: totalRotation.current,
      duration: 3000 + Math.random() * 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      try {
        await generateHapticFeedback({ type: 'success' });
      } catch {
        // 햅틱 실패는 조용히 처리
      }
      onSpinCountChange((c) => c + 1);
      setIsSpinning(false);
      const picked = menus[winnerIdx];
      if (picked != null) {
        setTimeout(() => onResult(picked), 350);
      }
    });
  }, [isSpinning, menus, onResult, onSpinCountChange, rotation]);

  const rotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { maxWidth: cardMaxWidth }]}>
          <View style={styles.adBanner}>
            <Text style={styles.adBannerText}>광고 영역</Text>
          </View>

          <View style={styles.weatherBanner}>
            <Text style={styles.weatherEmoji}>{banner.emoji}</Text>
            <Text style={styles.weatherText} numberOfLines={1}>
              {banner.text}
            </Text>
          </View>

          <Text style={styles.spinCounter}>
            오늘 돌린 횟수 <Text style={styles.spinCounterNum}>{spinCount}</Text>번
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pills}
          >
            {CATEGORIES.map((cat) => {
              const active = cat === category;
              return (
                <TouchableOpacity
                  key={cat}
                  disabled={isSpinning}
                  onPress={() => onCategoryChange(cat)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.wheelWrap, { width: wheelSize, height: wheelSize + 24 }]}>
            <View style={styles.pointer} />
            <Animated.View style={[rotateStyle]}>
              <Wheel size={wheelSize} menus={menus} />
            </Animated.View>
            <View style={[styles.wheelCenter, { top: (wheelSize + 24) / 2 - 28 }]}>
              <Text style={styles.wheelCenterText}>🍽️</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.btnPrimary, isSpinning && styles.btnDisabled]}
            onPress={handleSpin}
            disabled={isSpinning}
          >
            <Text style={styles.btnPrimaryText}>
              {isSpinning ? '두근두근...' : '🍽️ 뭐먹지?'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.adBanner, { marginTop: 16, marginBottom: 0 }]}>
            <Text style={styles.adBannerText}>광고 영역</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { alignItems: 'center', padding: 16, paddingBottom: 32 },
  card: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 28,
    padding: 18,
    paddingBottom: 24,
    shadowColor: '#1A1816',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    alignItems: 'stretch',
  },
  adBanner: {
    height: 58,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  adBannerText: { color: theme.textSub, fontSize: 12, fontWeight: '500' },

  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: theme.primarySoft,
    marginBottom: 10,
  },
  weatherEmoji: { fontSize: 16 },
  weatherText: { fontSize: 13, fontWeight: '700', color: theme.primary },

  spinCounter: {
    fontSize: 12,
    color: theme.textSub,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  spinCounterNum: { color: theme.primary, fontWeight: '900' },

  pills: { gap: 8, paddingVertical: 2, paddingRight: 4 },
  pill: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: theme.pillBg,
  },
  pillActive: { backgroundColor: theme.primary },
  pillText: { fontSize: 13, fontWeight: '700', color: theme.textSub },
  pillTextActive: { color: '#FFFFFF' },

  wheelWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  pointer: {
    position: 'absolute',
    top: 0,
    zIndex: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.primary,
  },
  wheelCenter: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.card,
    borderWidth: 4,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelCenterText: { fontSize: 22 },

  btnPrimary: {
    marginTop: 8,
    height: 54,
    borderRadius: 9999,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
});
