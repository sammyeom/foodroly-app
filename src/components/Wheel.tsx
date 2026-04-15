import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Menu } from '../data/menus';
import { theme } from '../theme';

interface WheelProps {
  size: number;
  menus: Menu[];
}

/**
 * 원형 배치 룰렛.
 * n개의 메뉴 칩을 원주 위에 균등 배치하고,
 * 전체를 회전해서 상단 포인터에 오는 항목이 당첨됨.
 */
export default function Wheel({ size, menus }: WheelProps) {
  const n = menus.length;
  const radius = size / 2;
  const itemRadius = radius * 0.72;
  const chipSize = Math.max(56, Math.floor(size * 0.22));

  const items = useMemo(() => {
    if (n === 0) return [];
    const step = 360 / n;
    return menus.map((menu, i) => {
      const deg = -90 + step * i; // 12시에서 시작
      const rad = (deg * Math.PI) / 180;
      const x = radius + itemRadius * Math.cos(rad) - chipSize / 2;
      const y = radius + itemRadius * Math.sin(rad) - chipSize / 2;
      const color = theme.sliceColors[i % theme.sliceColors.length] ?? theme.primary;
      return { menu, x, y, color };
    });
  }, [menus, n, radius, itemRadius, chipSize]);

  return (
    <View style={[styles.wheel, { width: size, height: size, borderRadius: radius }]}>
      {/* 방사 라인 */}
      {Array.from({ length: n }).map((_, i) => {
        const deg = (360 / n) * i;
        return (
          <View
            key={`line-${i}`}
            pointerEvents="none"
            style={[
              styles.line,
              {
                width: 2,
                height: radius,
                left: radius - 1,
                top: 0,
                transform: [
                  { translateY: radius },
                  { rotate: `${deg}deg` },
                  { translateY: -radius / 2 },
                ],
              },
            ]}
          />
        );
      })}

      {/* 메뉴 칩 */}
      {items.map((it, i) => (
        <View
          key={`chip-${i}`}
          style={[
            styles.chip,
            {
              width: chipSize,
              height: chipSize,
              borderRadius: chipSize / 2,
              left: it.x,
              top: it.y,
              backgroundColor: it.color,
            },
          ]}
        >
          <Text style={styles.emoji}>{it.menu.emoji}</Text>
          <Text style={styles.label} numberOfLines={1}>
            {it.menu.name.length > 4 ? `${it.menu.name.slice(0, 3)}…` : it.menu.name}
          </Text>
        </View>
      ))}

      {/* 외곽 링 */}
      <View
        pointerEvents="none"
        style={[styles.ring, { width: size, height: size, borderRadius: radius }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    backgroundColor: theme.card,
    position: 'relative',
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    backgroundColor: theme.border,
    opacity: 0.4,
  },
  chip: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22, lineHeight: 26 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  ring: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 4,
    borderColor: theme.primarySoft,
  },
});
