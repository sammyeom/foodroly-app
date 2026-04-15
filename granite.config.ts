import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'mwomukji',
  plugins: [
    appsInToss({
      brand: {
        displayName: '뭐먹지?',
        primaryColor: '#FF6B35',
        icon: 'https://static.toss.im/icons/png/4x/icon-mwomukji.png',
      },
      permissions: [],
    }),
  ],
});
