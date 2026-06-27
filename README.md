# LOS – League of Singles

A competitive basketball app for 1v1 through 5v5 games. Features AI ref, AI coach, training programs, wagering, rank system, leaderboard with divisions, court map, Pro membership, and Find Friends.

## Requirements

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli eas-cli`
- For iOS builds: macOS + Xcode
- For Android builds: Android Studio

## Getting started

```bash
npm install        # or: yarn / pnpm install
npx expo start     # starts Metro bundler + shows QR code
```

Scan the QR code with **Expo Go** (iOS/Android) to run on your phone instantly.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Metro bundler (Expo Go / web) |
| `npm run ios` | Build and open in iOS Simulator |
| `npm run android` | Build and open in Android Emulator |
| `npm run web` | Open in browser |
| `npm run typecheck` | Run TypeScript checks |

## Publishing with EAS

### One-time setup

1. Create a free account at [expo.dev](https://expo.dev)
2. Log in: `eas login`
3. Link the project: `eas init` (updates `extra.eas.projectId` in `app.json`)

### Build for testing (internal distribution)

```bash
# iOS Simulator build
eas build --profile development --platform ios

# Android APK
eas build --profile preview --platform android
```

### Build for the App Store / Play Store

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Submit to stores

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## Project structure

```
app/              # Expo Router screens
  (tabs)/         # Bottom-tab screens (Home, Play, Courts, Ranks, Train, Profile)
  friends.tsx     # Find Friends screen
  game/[id].tsx   # Game detail / tape screen
components/       # Shared UI components
constants/        # Colors, rank thresholds, theme
hooks/            # useColors, useUserStore, etc.
assets/           # Icons, images
app.json          # Expo config (bundle ID, scheme, permissions)
eas.json          # EAS build profiles
```

## Bundle identifiers

| Platform | ID |
|---|---|
| iOS | `com.los.leagueofsingles` |
| Android | `com.los.leagueofsingles` |
| Deep link scheme | `los://` |
