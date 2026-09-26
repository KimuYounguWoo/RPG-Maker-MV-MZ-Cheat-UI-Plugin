# Changelog

## v1.0.4

### Fixed

- Preserve number, string, boolean, array, object, and null variable types.
- Prevent God Mode from calling the removed `saveCheatSettings` method.
- Compare NW.js and release versions by numeric segments.
- Wait for quick save/load completion and report failures accurately.
- Use engine-aware settings paths and migrate legacy MZ settings.
- Recover from malformed settings JSON and create settings directories safely.
- Validate actor stats, item quantities, health values, and teleport coordinates.
- Pass the wheel event explicitly when adapting RPG Maker input handlers.

### Changed

- Bundle Vuetify and Material Design Icons styles for offline use.
- Check for updates only when requested from the General panel.
- MZ releases no longer replace the game's `js/main.js`.
- Release archives are generated as ZIP files by a working-directory-independent build.

### Development

- Add tests for semantic version comparison and typed variable conversion.
