# Pictaria — native mobile app (Capacitor webview)

The native app is a thin webview shell around the published Pictaria site
(`https://memory-tile-maker.lovable.app`). Content updates the moment you press
Update in Lovable — no new store build needed unless the shell itself changes.

The Android project is already generated in this repo under `android/`. You can
open it directly in Android Studio and build.

## Android quick start (on your PC)

Requirements:

- [Android Studio](https://developer.android.com/studio) (latest stable)
- Git
- Node.js + npm (or Bun)

```bash
# 1. Clone the repo
git clone <your-repo>
cd <repo>

# 2. Install dependencies
npm install

# 3. Make sure the Android platform is present
npm install @capacitor/android
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync to finish.
2. Choose a device or emulator.
3. Click **Run** (the green play button).

## Build a release APK / AAB

In Android Studio:

1. Go to **Build > Generate App Bundle / APK...**
2. Choose **Android App Bundle (.aab)** for Play Store, or **APK** for sideloading.
3. Create or select a signing keystore.
4. The output goes to `android/app/release/`.

To build from the command line:

```bash
cd android
./gradlew assembleRelease        # APK
./gradlew bundleRelease          # AAB for Play Store
```

The signed AAB/APK path will be printed when the build finishes.

## App icon & splash

```bash
npm install -D @capacitor/assets
# put a 1024x1024 icon.png and 2732x2732 splash.png in ./assets
npx cap assets generate
npx cap sync android
```

## Submitting to Google Play

1. Create a Google Play Developer account ($25 one-time).
2. In Play Console, create an app with the package name `app.lovable.pictaria`.
3. Upload the signed `app-release.aab` from `android/app/build/outputs/bundle/release/`.

Note: stores can reject apps that are only a website wrapper. Pictaria's puzzle
play, haptics and offline-friendly interactions help, and adding native haptics
(`@capacitor/haptics`) strengthens the case.

## Changing the URL the app loads

Edit `server.url` in `capacitor.config.ts`, then run:

```bash
npx cap sync android
```

## iOS (optional)

Requires a Mac + Xcode.

```bash
npm install @capacitor/ios
npx cap add ios
npx cap open ios
```

