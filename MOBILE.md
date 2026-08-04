# Pictaria — native mobile app (Capacitor webview)

The native app is a thin webview shell around the published Pictaria site
(`https://memory-tile-maker.lovable.app`). Content updates the moment you press
Update in Lovable — no new store build needed unless the shell itself changes.

## One-time setup (on your own machine)

Requires a Mac + Xcode for iOS, and Android Studio for Android.

```bash
git clone <your-repo>
cd <repo>
npm install

# create the native projects
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# keep native projects in sync with capacitor.config.ts
npx cap sync
```

## Run it

```bash
npx cap open ios      # then press Run in Xcode
npx cap open android  # then press Run in Android Studio
```

## App icon & splash

```bash
npm install -D @capacitor/assets
# put a 1024x1024 icon.png and 2732x2732 splash.png in ./assets
npx cap assets generate
```

## Submitting to the stores

- iOS: Xcode > Product > Archive > Distribute App (needs an Apple Developer account, $99/yr).
- Android: Android Studio > Build > Generate Signed Bundle (needs a Play Console account, $25 one-time).

Note: stores can reject apps that are only a website wrapper. Pictaria's puzzle
play, haptics and offline-friendly interactions help, and adding native haptics
(`@capacitor/haptics`) strengthens the case.

## Changing the URL the app loads

Edit `server.url` in `capacitor.config.ts`, then run `npx cap sync`.
