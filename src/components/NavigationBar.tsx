import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { theme } from '../theme';

interface NavigationBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;
const NAV_BAR_HEIGHT = 56;

export default function NavigationBar({ title, subtitle, onBack, rightElement }: NavigationBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {onBack != null && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={styles.hitSlop}>
              <Text style={styles.backIcon}>{'‹'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle != null && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>

        <View style={styles.right}>{rightElement}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.bg,
    paddingTop: STATUS_BAR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  bar: {
    height: NAV_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  left: { width: 48, alignItems: 'flex-start', justifyContent: 'center' },
  right: { width: 48, alignItems: 'flex-end', justifyContent: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: theme.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 11, fontWeight: '500', color: theme.textSub, marginTop: 1 },
  backButton: { padding: 4 },
  backIcon: { fontSize: 28, color: theme.text, lineHeight: 32, fontWeight: '300' },
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
});
