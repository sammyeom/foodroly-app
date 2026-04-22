import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {
  generateHapticFeedback,
  getTossShareLink,
  share,
  InlineAd,
  useTopNavigation,
} from '@apps-in-toss/framework';
import { useBackEvent } from '@granite-js/react-native';
import { theme } from '../theme';
import type { ResultParams } from '../App';
import { BANNER_AD_GROUP_ID } from '../config/env';

interface ResultScreenProps {
  params: ResultParams;
  onRetry: () => void;
  onBack: () => void;
}

export default function ResultScreen({ params, onRetry, onBack }: ResultScreenProps) {
  const { result } = params;

  const backEvent = useBackEvent();
  useEffect(() => {
    const handler = () => onBack();
    backEvent.addEventListener(handler);
    return () => {
      backEvent.removeEventListener(handler);
    };
  }, [backEvent, onBack]);

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;

  const [isSharing, setIsSharing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      if (toastTimer.current != null) clearTimeout(toastTimer.current);
      setToastMsg(msg);
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      toastTimer.current = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setToastMsg(null));
      }, 2000);
    },
    [toastOpacity],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const emojiLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(emojiScale, {
          toValue: 1.15,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(emojiScale, {
          toValue: 1.0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    emojiLoop.start();

    void (async () => {
      try {
        await generateHapticFeedback({ type: 'success' });
      } catch {
        // 햅틱 실패는 조용히 처리
      }
    })();

    return () => {
      emojiLoop.stop();
      if (toastTimer.current != null) clearTimeout(toastTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const shareLink = await getTossShareLink('intoss://foodroly');
      await share({
        message: `오늘 뭐먹지? → ${result.emoji} ${result.name}!\n${shareLink}`,
      });
    } catch {
      showToast('공유하는 중 오류가 발생했어요');
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, result, showToast]);

  const { addAccessoryButton } = useTopNavigation();

  useEffect(() => {
    addAccessoryButton({
      id: 'share',
      title: '공유',
      icon: { name: 'icon-share-dots-mono' },
      onPress: () => {
        void handleShare();
      },
    });
  }, [addAccessoryButton, handleShare]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <Animated.Text
            style={[styles.emojiDecor, { transform: [{ scale: emojiScale }] }]}
          >
            🍽️
          </Animated.Text>

          <Animated.View
            style={[
              styles.resultCard,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <Text style={styles.resultLabel}>오늘의 메뉴</Text>
            <Text style={styles.resultText} numberOfLines={2} adjustsFontSizeToFit>
              {result.name}
            </Text>
            <Text style={styles.resultDesc}>{result.desc}</Text>
          </Animated.View>
        </View>

        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>🔄 다시 뽑기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, isSharing && styles.buttonDisabled]}
            onPress={handleShare}
            disabled={isSharing}
          >
            <Text style={styles.shareButtonText}>
              {isSharing ? '공유 중...' : '🔗 결과 공유하기'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {BANNER_AD_GROUP_ID ? (
            <View style={styles.inlineAdWrap}>
              <InlineAd adGroupId={BANNER_AD_GROUP_ID} theme="light" variant="card" />
            </View>
          ) : (
            <View style={styles.adBanner}>
              <Text style={styles.adBannerText}>📢 광고 영역</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {toastMsg != null && (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { opacity: toastOpacity }]}
        >
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { flexGrow: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  emojiDecor: { fontSize: 48, marginBottom: 8 },

  resultCard: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#1A1816',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: 8,
  },
  resultEmoji: { fontSize: 56, lineHeight: 64 },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textSub,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultText: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  resultDesc: {
    fontSize: 14,
    color: theme.textSub,
    fontWeight: '500',
    marginTop: 4,
  },

  buttonArea: { padding: 16, paddingBottom: 36, gap: 10 },
  retryButton: {
    height: 56,
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
  retryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  shareButton: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: theme.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: { color: theme.text, fontSize: 15, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },

  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 6,
  },
  adBanner: {
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.border,
    backgroundColor: theme.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adBannerText: {
    color: theme.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  inlineAdWrap: { borderRadius: 12, overflow: 'hidden' },

  toast: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
    backgroundColor: 'rgba(26,24,22,0.92)',
    maxWidth: '86%',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
