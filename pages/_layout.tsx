import React, { type PropsWithChildren } from 'react';
import { View } from 'react-native';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      {children}
    </View>
  );
}
