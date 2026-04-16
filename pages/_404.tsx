import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotFoundPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>페이지를 찾을 수 없어요</Text>
      <Text style={styles.subtitle}>요청하신 페이지가 존재하지 않습니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAF8',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191F28',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B95A1',
  },
});
