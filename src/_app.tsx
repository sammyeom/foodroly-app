import { AppsInToss } from '@apps-in-toss/framework';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { InitialProps } from '@granite-js/react-native';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      {children}
    </View>
  );
}

export default AppsInToss.registerApp(AppContainer, { context });
