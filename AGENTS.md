# Groceries iOS

Follow the parent project rules and the active spec:
`../specs/ios-first-test-follow-up.md`.

This repository packages the existing Groceries client for personal iPhone testing.
Keep the React UI and API contracts in their existing repositories. Do not add native UI,
change authentication, or modify sibling source files as part of this proof of concept.

## Authorized workflow

Run each command from the repository specified by the active spec, one repository at a time.

- `npm install --cache .npm-cache`
- `npm run copy:web`
- `npx cap add ios`
- `npm run sync:ios`
- `node --check scripts/copy-web.mjs`
- `xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath .build CODE_SIGNING_ALLOWED=NO build`
- `npm run open:ios`
- Read-only dependency, Git status, generated-output, build, and device checks needed to verify the spec.
- Development signing, build, installation, and launch on Chris's paired iPhone, as authorized by the spec.

`node_modules/`, `.npm-cache/`, `.build/`, `www/`, and Capacitor-generated native assets are build outputs.
The `ios/` source tree comes from the Capacitor 8 Swift Package Manager template.
Only development signing settings may be hand-edited in the generated Xcode project.

Use the production API: `https://cjb-groceries.herokuapp.com`.
The user enters credentials and performs the production-data smoke test.
Do not store credentials, commit, push, or publish without further instructions.
