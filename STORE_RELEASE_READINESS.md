# Khadam Store Release Readiness

## Current verified artifacts

- Android installable APK:
  `android/app/build/outputs/apk/debug/app-debug.apk`
- Android Play Store bundle:
  `android/app/build/outputs/bundle/release/app-release.aab`
- Emulator verification screenshot:
  `dist/khadam-bundled-apk.png`

## Verified on this machine

- Android Studio opened successfully.
- Android emulator `Medium_Phone_API_36` booted successfully.
- Emulator data partition was resized to 12 GB so the APK can install.
- APK installed successfully with `adb install -r`.
- APK launched successfully with `adb shell monkey -p net.khdm.app 1`.
- Startup logcat review found no fatal startup crash after the JS bundle was included.
- The app opened to the native login screen without Metro.

## Passing commands

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
npm run doctor
npx expo export --platform android --output-dir dist\android-phase2
npx expo export --platform ios --output-dir dist\ios-phase2
cd android
gradlew.bat assembleDebug --no-daemon --console=plain
gradlew.bat bundleRelease --no-daemon --console=plain
```

## Android store requirements still needing owner credentials

Google Play requires an Android App Bundle for new apps and Play App Signing. The local `.aab` exists, but a real release upload still needs:

- Google Play Console developer account access.
- A created app record for package `net.khdm.app`.
- Play App Signing accepted for the app.
- A production upload key/keystore or EAS-managed Android credentials.
- Store listing metadata, screenshots, privacy policy URL, data safety form, content rating, target audience, and release notes.
- Manual first upload if using EAS Submit later, because Google requires the first app upload before API-based submissions can work.

Recommended command after credentials are ready:

```powershell
eas build --platform android --profile production
eas submit --platform android --profile production
```

For the local artifact:

```powershell
eas submit --platform android --path .\android\app\build\outputs\bundle\release\app-release.aab
```

## iOS store requirements still needing owner credentials

An iOS App Store/TestFlight build cannot be completed locally on this Windows machine without Apple/EAS credentials. It needs:

- Apple Developer Program membership.
- App Store Connect app record for bundle ID `net.khdm.app`.
- iOS distribution certificate and provisioning profile, or EAS-managed iOS credentials.
- App privacy questionnaire, screenshots, support URL, marketing URL if used, description, keywords, age rating, and review contact information.
- TestFlight processing and App Review submission.

Recommended commands after credentials are ready:

```powershell
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## Product completeness warning

The app is technically buildable and installable, but not yet product-complete for public store release. Several native screens are still migration placeholders and the full web feature set is not yet ported. Do not submit to production review until every phase in `../REACT_NATIVE_MIGRATION_PLAN.md` is complete and verified with real API accounts.
