import React from 'react';
import { PageNavbar } from '@toss/tds-react-native';
import { createRoute } from '@granite-js/react-native';
import AppNavigator from '../src/App';

export const Route = createRoute('/', {
  validateParams: (params: unknown) => params,
  component: IndexPage,
});

function IndexPage() {
  return (
    <>
      <PageNavbar preference={{ type: 'showAlways' }} />
      <AppNavigator />
    </>
  );
}
