import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.robi.ritikaai',
  appName: 'Ritika AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allows connecting to local Termux backend http://127.0.0.1:8000
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
