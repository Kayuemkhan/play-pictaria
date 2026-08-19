import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.pictaria",
  appName: "Pictaria",
  // The native shell is a webview that loads the live Pictaria site,
  // so every Lovable update ships instantly without a new store build.
  webDir: "dist",
  server: {
    url: "https://play-pictaria.lovable.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    // Let people pinch to zoom the whole app in the native shell.
    zoomEnabled: true,
  },
  android: {
    allowMixedContent: false,
    zoomEnabled: true,
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f2f43",
    },
  },
};

export default config;
