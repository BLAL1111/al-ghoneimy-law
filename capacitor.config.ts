import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elghoneimy.lawyer',
  appName: 'الغنيمي للمحاماة',
  webDir: 'out',
  server: {
    // ✅ بدل ما نبني static، نوجّه للموقع الحقيقي على Vercel
    url: 'https://al-ghoneimy-law-sp96.vercel.app',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4f46e5",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#4f46e5",
    },
  },
};

export default config;