import React from 'react';
import { PageNavbar } from '@toss/tds-react-native';
import AppNavigator from '../src/App';

export default function IndexPage() {
  return (
    <>
      <PageNavbar preference={{ type: 'showAlways' }} />
      <AppNavigator />
    </>
  );
}
