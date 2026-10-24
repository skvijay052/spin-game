# Spin Duel

A React Native + Expo starter for a premium-looking 1-vs-1 spin game. This initial build is a UI prototype: the spin result is local and is **not** authoritative multiplayer matchmaking.

## Android APK through GitHub Actions

Every push to `main`, pull request targeting `main`, or manual workflow dispatch runs `.github/workflows/android-apk.yml` on GitHub-hosted Ubuntu runners. The runner installs Node.js, Java 17, and Android SDK, generates the native Android project with Expo Prebuild, and builds an installable **debug APK** using Gradle. No Expo/EAS cloud build or Expo token is needed.

1. Open the repository's **Actions** tab.
2. Select **Spin Duel Android APK**.
3. Open the latest successful run.
4. Under **Artifacts**, download `spin-duel-debug-apk` and extract `app-debug.apk`.
5. Transfer the APK to an Android phone and install it. Android may ask you to allow installation from that file manager/browser.

## Local development

```bash
npm install
npx expo start
```

To generate the Android project locally, run `npx expo prebuild --platform android`. The CI workflow regenerates it on every run, so generated `android/` files are intentionally not required in the repository.

## Next steps

- Connect Supabase Auth and a database-backed matchmaking function.
- Store match outcomes and wallet/ledger changes on the server; never trust a client-generated winner.
- Add real multiplayer synchronization, match history, profile and wallet screens.
- Keep this version demo-only: virtual coins have no cash value, and there are no deposits, withdrawals, entry fees or cash prizes.

Never commit Supabase service-role keys, signing keys, or other secrets to the repository.
