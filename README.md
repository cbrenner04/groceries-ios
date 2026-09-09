# Groceries iOS

An iPhone app that packages the existing Groceries React client in a Capacitor shell.
The UI lives in the sibling `groceries-client` repository; this repository owns the native iOS project
and the workflow for bundling the client.

The app uses the production API at `https://cjb-groceries.herokuapp.com`.
Actions in the app change real grocery data.

## Requirements

- macOS with Xcode 26 or later and its iOS platform support.
- Node 22 or later and npm.
- A sibling `groceries-client` checkout with its dependencies installed.
- An Apple Account configured in Xcode.
- For device testing, a trusted iPhone with Developer Mode enabled.

## Development workflow

Build the web app from `groceries-client`:

```sh
VITE_API_BASE=https://cjb-groceries.herokuapp.com npm run build
```

From `groceries-ios`, install the locked dependencies on first setup:

```sh
npm ci
```

Copy the client build, sync the native project, and open Xcode:

```sh
npm run copy:web
npm run sync:ios
npm run open:ios
```

The native project is checked in; do not run `cap add ios` for an existing checkout.
It uses Swift Package Manager. Capacitor's native HTTP support carries the client's Axios requests.

After changing the client, repeat its production build, then `copy:web`, `sync:ios`, and the Xcode run.
The app bundles a snapshot of the client; website deployments do not update an installed app.
Use the client branch you intend to test before building.

## Run on an iPhone

1. Add your Apple Account in Xcode Settings.
2. Open the App target's Signing & Capabilities pane, enable automatic signing, and select your team.
3. Keep the bundle identifier `com.christopherbrenner.groceries`.
4. Connect and unlock your iPhone, accepting Trust prompts.
5. Enable Developer Mode if prompted, including any required restart.
6. Select the iPhone as the run destination and choose Product > Run.
7. If prompted, trust the development app under Settings > General > VPN & Device Management.

Personal Team provisioning is short-lived; rebuild and reinstall when it expires.
App Store and TestFlight distribution are not configured.

## Build checks

From `groceries-ios`, after copying and syncing the web build:

```sh
node --check scripts/copy-web.mjs
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath .build \
  CODE_SIGNING_ALLOWED=NO build
```

An unsigned build checks compilation, not installation or on-device behavior.
Run the relevant client tests in `groceries-client` before packaging UI changes.

On the phone, check sign-in, editing and saving, sharing, keyboard visibility, scrolling, and relaunch behavior.
Use your own credentials and data you are comfortable changing in production.

## Repository layout

- `capacitor.config.json`: app identity, web asset directory, and native HTTP configuration.
- `scripts/copy-web.mjs`: validates and copies the sibling client's `build/` into `www/`.
- `ios/`: native Xcode project, Swift Package Manager integration, and app assets.
- `www/`, `.build/`, and synced native web assets: generated outputs, excluded from Git.

The copy command replaces only the generated `www/` directory.
Do not commit generated bundles, signing credentials, provisioning profiles, or user-specific Xcode state.

## Authentication

Authentication follows the shared client's session-storage behavior, so a full app termination may require
signing in again. Automatic password-manager association with `groceries-app.com` is not configured.
Credentials should be entered in the app, never stored in this repository.
