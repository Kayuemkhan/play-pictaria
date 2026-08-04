#!/usr/bin/env bash
set -euo pipefail

# Pictaria Android APK build helper
# Run this on a machine with Android Studio installed (it provides the SDK).
# Usage:
#   ./build-apk.sh              # builds a debug APK
#   ./build-apk.sh release      # builds a signed release APK (needs env vars below)
#
# Release signing env vars:
#   KEYSTORE_PATH     path to your .jks keystore
#   KEYSTORE_PASSWORD keystore password
#   KEY_ALIAS         key alias inside the keystore
#   KEY_PASSWORD      key password (defaults to KEYSTORE_PASSWORD)

BUILD_TYPE="${1:-debug}"

command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install it first."; exit 1; }
command -v java >/dev/null 2>&1 || { echo "Java is required. Android Studio bundles a JDK."; exit 1; }

if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
  echo "Usage: ./build-apk.sh [debug|release]"
  exit 1
fi

# Prefer bun, fall back to npm/npx
if command -v bun >/dev/null 2>&1; then
  PKG_RUN="bun run"
  CAP="bunx cap"
else
  PKG_RUN="npm run"
  CAP="npx cap"
fi

echo "==> Installing dependencies..."
if command -v bun >/dev/null 2>&1; then
  bun install
else
  npm install
fi

echo "==> Building web assets..."
$PKG_RUN build

echo "==> Adding Android project if missing..."
if [ ! -d "android" ]; then
  $CAP add android
fi

echo "==> Syncing Capacitor config..."
$CAP sync android

cd android

if [ "$BUILD_TYPE" = "release" ]; then
  if [ -z "${KEYSTORE_PATH:-}" ] || [ -z "${KEYSTORE_PASSWORD:-}" ] || [ -z "${KEY_ALIAS:-}" ]; then
    echo "Release build requires KEYSTORE_PATH, KEYSTORE_PASSWORD, and KEY_ALIAS."
    exit 1
  fi

  echo "==> Building signed release APK..."
  ./gradlew assembleRelease \
    -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
    -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
    -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
    -Pandroid.injected.signing.key.password="${KEY_PASSWORD:-$KEYSTORE_PASSWORD}"

  APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
  echo "==> Building debug APK..."
  ./gradlew assembleDebug

  APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

if [ ! -f "$APK_PATH" ]; then
  echo "APK was not created at the expected path: $APK_PATH"
  exit 1
fi

FULL_APK_PATH="$(pwd)/$APK_PATH"
echo ""
echo "✅ APK ready:"
echo "   $FULL_APK_PATH"
echo ""
echo "Install it on an Android device with:"
echo "   adb install \"$FULL_APK_PATH\""
