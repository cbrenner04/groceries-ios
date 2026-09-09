# Groceries iOS

Personal iPhone test app that packages the existing Groceries React client in a Capacitor shell.
It uses the production API at `https://cjb-groceries.herokuapp.com`.
Edits in this app change your real grocery data.

## Latest follow-up: sharing without a spinner

Sharing now uses a static, non-pulsing placeholder while its data loads, with a screen-reader loading
status. The spinner is removed from the sharing sheet only; other loading states and sharing behavior
are unchanged. This supersedes the earlier notes about leaving the sharing spinner in place.

Verification: 29 focused tests pass, including loading, successful fetch, failed fetch, draft preservation,
and sheet behavior. TypeScript, scoped ESLint/Prettier, the production web build, signed iOS build, and
signature verification pass. The shared client changes remain local and are not part of this repository.
This build was installed on the paired iPhone on September 9, 2026 (UTC). Automatic launch was blocked
because the phone was locked. Opening the app and checking the sharing placeholder remain user phone checks.

## Earlier follow-up: Edit List and the keyboard

The user reports that item editing is improved and sharing is acceptable, but Edit List on the Lists
page opens behind the keyboard. That form is fetched before the sheet opens, so its first field is
available for the sheet's existing autofocus immediately.

Only the Edit List sheet now opts into keyboard avoidance: its position and maximum height follow
the visible viewport as the keyboard opens, pans, and closes. The update does not reset form state or
refocus inputs. Other sheets and the sharing spinner are unchanged. Sharing explicitly shows a spinner
while fetching sharing details; the Lists route uses skeleton cards for its loading state.

Verification: 160 tests across eight focused suites pass, including keyboard-size changes, production
sheet animation, draft/focus preservation, listener cleanup, and the actual ListsContainer edit form.
TypeScript, scoped ESLint/Prettier, production web build, signed iOS build, and signature verification pass.
Existing Vite environment/chevron warnings remain. Device keyboard positioning still needs user confirmation.
The keyboard-fix build was installed and launched on the paired iPhone on September 9, 2026 (UTC).

Phone check: from Lists, edit a list, confirm its name is visible above the keyboard without dragging
the sheet, then type and save. Hide/reopen the keyboard and verify the form stays reachable.
The shared client changes remain local; this repository records the shell and verification notes only.
Apple enrollment/domain association remain deferred.

Implementation reference: [VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport).

## Requirements

- macOS with Xcode 26 or later and its iOS platform support installed.
- Node 22 or later and npm.
- The sibling `groceries-client` checkout with its dependencies already installed.
- An Apple Account added in Xcode, and a trusted iPhone with Developer Mode enabled when requested.

This Mac was checked with Xcode 26.6 and Node 24.13.0. Xcode detected Chris's paired iPhone 15.

## Build the web app

From `groceries-client`:

```sh
VITE_API_BASE=https://cjb-groceries.herokuapp.com npm run build
```

This runs the existing TypeScript check and Vite build. It writes only the generated `build/` directory.
The iOS app receives a snapshot of this compiled client; website deployments do not update an installed app.

## Prepare the iOS app

From `groceries-ios`, install the shell dependencies once:

```sh
npm install --cache .npm-cache
```

Copy the client build:

```sh
npm run copy:web
```

On first setup only, generate the native project:

```sh
npx cap add ios
```

Sync and open the project:

```sh
npm run sync:ios
npm run open:ios
```

After client changes, repeat the client build, `copy:web`, `sync:ios`, and the Xcode run.
The copy command replaces only the generated `www/` directory after validating its input.
The native project uses Swift Package Manager and bundles the web assets locally.
Capacitor's native HTTP support carries the client's existing Axios requests without a server CORS change.

## Install on your iPhone

1. In Xcode Settings, add your Apple Account under Accounts or Apple Accounts if it is not already present.
2. Open the App target's Signing & Capabilities pane. Enable automatic signing and select your development team.
3. Keep the bundle identifier `com.christopherbrenner.groceries`.
4. Connect and unlock your iPhone, accepting Trust prompts on the phone and Mac if requested.
5. If Xcode asks, enable Settings > Privacy & Security > Developer Mode on the phone and follow its restart prompts.
6. Select Chris's iPhone as the run destination and choose Product > Run.
7. If iOS requests developer trust, follow its instructions under Settings > General > VPN & Device Management.

A free Personal Team supports testing on your own phone. Its provisioning expires after seven days,
so you may need to rebuild and reinstall through Xcode. No App Store or TestFlight release is configured.

## Check the build without signing

From `groceries-ios`:

```sh
node --check scripts/copy-web.mjs
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath .build \
  CODE_SIGNING_ALLOWED=NO build
```

An unsigned build verifies compilation; it does not verify installation, login, or on-phone behavior.

## Phone smoke test

Use your own credentials in the app. Choose a grocery item you are comfortable changing in production.

- [ ] Sign in and open an existing list.
- [ ] Edit the chosen item and confirm the saved value after leaving and reopening the list.
- [ ] Background the app and resume it; check the list and login state.
- [ ] Fully terminate and relaunch the app; record whether you must sign in again and verify the saved item.
- [ ] Open the keyboard and check that fields and actions remain reachable.
- [ ] Scroll a long list and check the top controls and bottom navigation around the screen edges.
- [ ] Check light and dark appearance against the website.
- [ ] Temporarily disable networking, try opening a list, and check the failure message and recovery after reconnecting.
- [ ] Sign out and confirm that authenticated screens are no longer accessible.

The existing client stores authentication in session storage. Relaunching after termination may require signing in.
Persistent credentials, offline editing, native features, and UI fixes are outside this initial proof of concept.
Report any issues before changing the existing client or service.

## References

- [Implementation spec](../specs/ios-personal-device-proof-of-concept.md)
- [Capacitor environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Capacitor native HTTP](https://capacitorjs.com/docs/apis/http)
- [Apple personal-device testing](https://developer.apple.com/help/account/basics/about-your-developer-account)

## Verification status

Verified on September 8, 2026:

- Capacitor core, CLI, and iOS resolved to matching version 8.5.1.
- The existing client passed its TypeScript check and production build.
- Copied entry assets exist, and compiled JavaScript contains the production API URL rather than staging.
- The copy script passed Node's syntax check.
- Both the unsigned device build and the signed development build succeeded.
- The resulting app passed code-signature verification.
- Xcode's device tools confirmed installation and launch on Chris's paired iPhone 15 running iOS 26.6.1.
- The client repository had no tracked-file changes.

Login, authenticated requests, saved edits, relaunch behavior, and visual/keyboard checks are pending user testing.
Successful installation and launch do not establish those results.

The existing client build emitted warnings about `NODE_ENV` in its environment file and an unresolved
`${chevronSvg}` asset reference; neither prevented the build. Existing client files were left unchanged.
The npm audit reported three moderate advisories in the CLI's `xcode`/`uuid` development dependency chain;
it did not report vulnerabilities in the runtime packages. No dependency overrides or audit fixes were applied.

Xcode builds and device access required execution outside the filesystem sandbox to use Apple SDK services,
package caches, signing identities, and the paired phone. Those operations completed successfully.

## First-test follow-up — September 9, 2026

Implemented [the approved follow-up spec](../specs/ios-first-test-follow-up.md).

The first phone test reported edit/share forms resetting, duplicate renders, intermittent blank routes,
content scrolling behind the brand bar, and a fresh login after terminating the app.

This update binds the animated route tree to its location and stabilizes the edit/share close callbacks.
The login fields now expose `username` and `current-password` autocomplete hints. Session storage is unchanged.
The app icon now reuses `groceries-client/public/apple-touch-icon.png`; the existing 180 by 180 pixel image
was resized to the asset catalog's 1024 by 1024 pixels without changing its artwork. It remains an upscaled image.

Verification completed:

- The route regressions failed before the fix, detecting a duplicate destination mount and an intermediate mount.
- The sheet regressions failed before the fix: an edited value reverted and a sharing selection was lost.
- All 165 tests in the 10 scoped suites passed after the fixes, including the four new regressions.
- Scoped formatting, TypeScript, ESLint, and the production client build passed.
- The signed iPhone build and code-signature verification passed.
- Device tools confirmed installation and launch of the updated app on Chris's paired iPhone 15.
- Client changes remain local; this workflow did not deploy the website or modify the backend.

Pending phone checks:

- [ ] Edit a field, wait at least 10 seconds through two default polling intervals, and save once; check that it keeps the draft.
- [ ] Share a list and check that the selection and entered email are not reset during updates.
- [ ] Switch quickly between Templates, Invite, and Lists; check for duplicate renders or blank screens.
- [ ] Scroll lists/items and check the Groceries brand bar for the reported overlap.
- [ ] Confirm the grocery-bag icon and test the login password chooser.

The intermittent blanks and header overlap remain unresolved until confirmed on the phone.
No header CSS was changed. Component-test success does not establish the visual result on iOS.

Automatic matching of credentials saved for `groceries-app.com` is still pending. The installed app uses a
free Personal Team, which does not support Associated Domains. The future association setup needs a capable
developer membership, an app entitlement, the matching Capacitor hostname, and a valid HTTPS AASA document
on the website. The user's password-manager choice and paid-membership availability are still unconfirmed.
# Edit-form follow-up and GitHub handoff

This status note supersedes earlier open-issue notes below: the user confirmed the other two fixes;
only the edit forms still needed attention. Apple enrollment and domain/password-manager association
remain deferred. No additional route, header, or safe-area changes were made in this follow-up.

The sibling `groceries-client` now confines sheet dragging to the grip, disables drag momentum,
snaps nondismissing drags back into place, removes competing CSS transform transitions, and portals
the sheet outside the animated page. These client edits are local and are **not included in this
iOS repository**. A fresh checkout must use the updated client source before rebuilding web assets.

Verification: 41 tests across six focused suites pass, including draft preservation, sheet interaction,
navigation, and login hints. TypeScript, scoped ESLint/Prettier, the production web build, the signed
iPhone build, and signature verification pass. Existing Vite environment/chevron warnings remain.
The follow-up build was installed and launched on the paired iPhone on September 9, 2026 (UTC).
Real iPhone keyboard, scrolling, and drag behavior still require user confirmation; synthetic pointer
and configuration tests are not a substitute for device testing.

GitHub remote: `git@github.com:cbrenner04/groceries-ios.git`. Only the iOS shell is being published;
generated web bundles, build products, signing credentials, and other repositories are excluded.

Phone check: open an item, edit a field, scroll, show/hide the keyboard, wait, and save once. Confirm
the draft stays intact and the sheet stays steady. Also check grip-only dismissal and sharing.

---
