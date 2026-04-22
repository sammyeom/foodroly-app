import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'foodroly',
  plugins: [
    appsInToss({
      appType: 'general',
      brand: {
        displayName: '뭐먹지',
        primaryColor: '#FF6B35',
        icon: 'https://static.toss.im/appsintoss/33673/e85afa6c-375c-4786-b639-e64610fedcd6.png',
      },
      permissions: [],
      navigationBar: {
        withBackButton: true,
        withHomeButton: true,
      },
    }),
  ],
});
