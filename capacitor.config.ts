import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tiar430.agented',
  appName: 'AI Agent',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1e40af",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerStyle: "large",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1e40af'
    },
    App: {
      appendUserAgent: "AI-Agent/1.0.0"
    }
  }
};

export default config;