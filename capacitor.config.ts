
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e54f623a75ea46fbaf07908da254cb56',
  appName: 'Maintenance Tracker',
  webDir: 'dist',
  server: {
    url: 'https://e54f623a-75ea-46fb-af07-908da254cb56.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
