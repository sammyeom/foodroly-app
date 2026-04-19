import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { useDialog } from '@toss/tds-react-native';
import Wheel from '../components/Wheel';
import { theme } from '../theme';
import {
  CATEGORIES,
  getMenusByCategory,
  type CategoryName,
  type Menu,
} from '../data/menus';
import type { WeatherRecommendation } from '../utils/weather';
import { FREE_SPINS_PER_DAY, BANNER_AD_GROUP_ID } from '../config/env';
import { showRewardedAd, preloadRewardedAd } from '../utils/ads';
import { InlineAd } from '@apps-in-toss/framework';

interface HomeScreenProps {
  category: CategoryName;
  onCategoryChange: (category: CategoryName) => void;
  banner: WeatherRecommendation;
  spinCount: number;
  onSpinCountChange: (updater: (prev: number) => number) => void;
  adsWatchedToday: number;
  onAdWatched: () => void;
  onResult: (menu: Menu) => void;
}

export default function HomeScreen({
  category,
  onCategoryChange,
  banner,
  spinCount,
  onSpinCountChange,
  adsWatchedToday,
  onAdWatched,
  onResult,
}: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const cardMaxWidth = Math.min(width - 32, 380);
  const wheelSize = Math.min(cardMaxWidth - 36, 320);

  const dialog = useDialog();

  const [isSpinning, setIsSpinning] = React.useState<boolean>(false);
  const [isLoadingAd, setIsLoadingAd] = React.useState<boolean>(false);

  useEffect(() => {
    preloadRewardedAd();
  }, []);

  const rotation = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);

  const menus = useMemo(() => getMenusByCategory(category), [category]);

  const quota = FREE_SPINS_PER_DAY + adsWatchedToday;
  const spinsLeft = Math.max(0, quota - spinCount);
  const needsAd = spinCount >= quota;

  const runSpin = useCallback(() => {
    if (menus.length === 0) return;
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
  }, [menus, onResult, onSpinCountChange, rotation]);

  const handleSpin = useCallback(async () => {
    if (isSpinning || isLoadingAd || menus.length === 0) return;

    if (!needsAd) {
      runSpin();
      return;
    }

    const confirmed = await dialog.openConfirm({
      title: '오늘의 무료 스핀을 모두 썼어요',
      description: '광고를 보고 1번 더 돌려볼까요?',
      leftButton: '다음에',
      rightButton: '광고 보고 1회 추가',
    });

    if (!confirmed) return;

    setIsLoadingAd(true);
    try {
      const { rewarded } = await showRewardedAd();
      if (!rewarded) {
        await dialog.openAlert({
          title: '광고 시청이 완료되지 않았어요',
          description: '잠시 후 다시 시도해주세요.',
        });
        return;
      }
      onAdWatched();
      runSpin();
    } catch {
      await dialog.openAlert({
        title: '광고를 불러오지 못했어요',
        description: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsLoadingAd(false);
    }
  }, [isSpinning, isLoadingAd, menus.length, needsAd, runSpin, onAdWatched, dialog]);

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
          <TouchableOpacity
            activeOpacity={0.75}
            disabled={isSpinning}
            onPress={() => onCategoryChange(banner.category)}
            style={styles.weatherBanner}
          >
            <Text style={styles.weatherEmoji}>{banner.emoji}</Text>
            <Text style={styles.weatherText} numberOfLines={1}>
              {banner.text}
            </Text>
          </TouchableOpacity>

          <Text style={styles.spinCounter}>
            오늘 돌린 횟수 <Text style={styles.spinCounterNum}>{spinCount}</Text>번
            {'  ·  '}
            {needsAd ? (
              <Text style={styles.spinCounterAd}>광고 보고 1회 추가</Text>
            ) : (
              <Text>
                남은 무료 스핀 <Text style={styles.spinCounterNum}>{spinsLeft}</Text>회
              </Text>
            )}
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
            style={[styles.btnPrimary, (isSpinning || isLoadingAd) && styles.btnDisabled]}
            onPress={handleSpin}
            disabled={isSpinning || isLoadingAd}
          >
            <Text style={styles.btnPrimaryText}>
              {isSpinning
                ? '두근두근...'
                : isLoadingAd
                ? '광고 불러오는 중...'
                : needsAd
                ? '📺 광고 보고 1번 더 돌리기'
                : '🍽️ 뭐먹지?'}
            </Text>
          </TouchableOpacity>

          {BANNER_AD_GROUP_ID ? (
            <View style={styles.inlineAdWrap}>
              <InlineAd adGroupId={BANNER_AD_GROUP_ID} theme="light" variant="card" />
            </View>
          ) : (
            <View style={[styles.adBanner, { marginTop: 16, marginBottom: 0 }]}>
              <Text style={styles.adBannerText}>광고 영역</Text>
            </View>
          )}
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
  inlineAdWrap: { marginTop: 16, borderRadius: 16, overflow: 'hidden' },

  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
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
  spinCounterAd: { color: theme.primary, fontWeight: '800' },

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
