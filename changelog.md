# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2-fork.2] - 2026-11-11

### Added

- Add a `/lite` export and minified lite build that import `@tweakpane/core` for sharing across plugins.
- Export `ProfilerBladeApi` and `ProfilerBladePluginParams` types from the package entry.

### Changed

- Bundle `@tweakpane/core` in the default and minified builds; use `/lite` to retain externalized core imports.
- **Breaking:** Restrict package entry points to the root, `/lite`, and `/package.json`, consolidate declarations, and mark the package side-effect-free.
- **Breaking:** Raise the browser JavaScript build target from ES2015 to ES2022.
- **Breaking:** Restrict declared Node.js support to 18, 20, 22, 24, and 26 or newer.
- **Breaking:** Change `ProfilerBladeMeasureHandler` from an interface to a type alias, removing declaration-merging support.

### Fixed

- Skip legacy measure-handler warnings for blades belonging to other plugins.
- Apply hover highlighting to profiler bars only on devices that support hover.
- Report a clear error when `measureEnd()` is called without a matching `measureStart()`.
- Correct the exported `css` type to `string` instead of the stylesheet placeholder literal.

### Documentation

- Add installation and registration examples, explain bundled and `/lite` imports and core dependencies, and document contributor workflows.

### Maintenance

- Update the pinned pnpm version to 12.16.1.
- Update the GitHub release and release-note actions.
- Update npm publishing to obtain a one-time password through the 1Password CLI.
- Migrate JavaScript, SCSS, and declaration builds to `tsdown`, validate packages with `publint` and Are the Types Wrong, and serve the demo with Vite.
- Adopt `@kitschpatrol/shared-config` and `ksc` for linting and formatting, refactor internal modules, and refresh editor tasks.
- Add Vitest coverage for plugin registration, measurement APIs, rendering, disposal, and calculation utilities.
- Add build, lint, and test CI on Linux, macOS, and Windows.
- Add monthly and manually triggered dependency-update automation.
- Integrate `chagent` into release commits and build after version bumps before publishing.
- Refresh development dependencies and repository actions, and update the pinned pnpm version to 12.18.0.

## [0.4.2-fork.1] - 2026-10-15

### Documentation

- Document the `fork.N` versioning convention and refresh README package badges and reference links.

### Maintenance

- Refresh contributor dependencies with pnpm 12, TypeScript 6, and ESLint 10 flat configuration, and declare updated Node.js development requirements.
- Standardize pnpm build and cleanup tasks, add shx cleanup and mdat README generation and checks, and validate builds before publishing fork releases.
- Migrate Sass compilation to its modern API and make watch mode rebuild embedded CSS when stylesheets or their imports change.
- Add automated repository and website link checks.
- Add scheduled and manually triggered upstream fork maintenance.
- Modernize GitHub release and metadata workflows with pinned actions, explicit permissions, and default-branch tag validation.
- Credit fork modifications in the MIT license and add package maintainer metadata.

## [0.4.2-beta.3] - 2025-03-04

### Documentation

- Clarify that fork beta versions track the next upstream patch release, refine import-map guidance, and correct the package repository URL.

### Maintenance

- Update the declared `@tweakpane/core` runtime dependency to `^2.0.5`.
- Refresh development dependencies and move to pnpm 10, allow `@parcel/watcher` builds, and remove the pnpm engine restriction.
- Publish fork releases to npm's `latest` tag and update the release and repository-metadata workflows.

## [0.4.2-beta.2] - 2024-09-15

### Maintenance

- Add automated GitHub release creation from version tags on the main branch.
- Add a workflow that synchronizes GitHub repository metadata from `package.json`.

## [0.4.2-beta.1] - 2024-09-15

### Added

- Make the fork available as the public npm package `@kitschpatrol/tweakpane-plugin-profiler`.

### Changed

- **Breaking:** Externalize `@tweakpane/core` as a runtime dependency (`^2.0.4`) so bundlers can share it across plugins; direct browser imports now require an import map.
- **Breaking:** Declare Node.js 18 or newer as the package engine requirement.

### Documentation

- Explain the fork's dependency externalization, bundler and import-map usage, pnpm development, and beta versioning convention; update the demo to use an import map.

### Maintenance

- Move development to pnpm 9 and refresh build and lint dependencies, including Rollup 4, TypeScript 5.6, and migration to `@rollup/plugin-terser`.
- Add an npm release script using bumpp for release commits and tags.
- Remove the upstream GitHub Pages deployment workflow from the fork.

## [0.4.1] - 2023-11-10

### Added

- Add `measureAsync(name, fn)` for callbacks returning promises.

### Fixed

- **Breaking:** Close `measure()` scopes immediately after synchronous callbacks, restoring correct nesting and a `void` return type; asynchronous callers must use `measureAsync()`.

## [0.4.0] - 2023-11-10

### Added

- Add `measureStart(name)` and `measureEnd()` for manually delimited, nested timing scopes.

### Changed

- **Breaking:** Require Tweakpane 4 and adopt its plugin-bundle registration interface, including the `id`, `css`, and `plugins` exports.
- **Breaking:** Switch distribution from UMD to ES modules and move declarations to `dist/types`, removing the downleveled TypeScript 3.4 declaration bundle.
- **Breaking:** Make `measure()` await asynchronous callbacks and return `Promise<void>`, changing when measurement scopes close.
- **Breaking:** Replace measurement handlers' `measure(fn)` method with `measureStart()`, which returns a function producing a duration or duration promise.

### Documentation

- Update browser examples for Tweakpane 4 and ES module imports, and refresh the README screenshot.
- Expand the sandbox example to explain nested profiling and demonstrate manual start/end timing.

### Maintenance

- Modernize contributor builds with Dart Sass, updated TypeScript and ESLint dependencies, a local demo server, and automatic rebuilds during `npm version`.
- Migrate the demo deployment workflow to GitHub Pages artifact upload and deployment actions.
- Update the license copyright years through 2023.

## [0.3.0] - 2022-03-13

### Added

- Display multiple top-level measurements side by side, preserving their independent timing histories and showing their combined duration.

### Changed

- **Breaking:** Remove the path argument from measurement handlers; implementations now receive only the callback to measure.
- **Breaking:** Target ES2017 output, requiring runtimes that support native async functions.

### Maintenance

- Refactor profiling to reuse measurement caches and construct display entries during refresh.
- Use cross-platform quoting in development scripts and remove generated declaration directories during cleanup.

## [0.2.0] - 2021-09-28

### Added

- Add `calcMode` with `frame`, `mean`, and `median` display modes.

### Changed

- **Breaking:** Change the default timing aggregation from median to mean.
- **Breaking:** Rename the `medianBufferSize` option to `bufferSize` for the shared aggregation history.

### Documentation

- Fix the README screenshot URL so it resolves outside the repository checkout.

## [0.1.2] - 2021-08-28

### Documentation

- Add an editable browser sandbox with Ctrl+S and Ctrl+R rerun shortcuts, and correct its hosted script URLs.
- Add a profiler screenshot, npm badge, and sandbox link to the README.

### Maintenance

- Add GitHub Pages build and deployment automation for the release branch.
- Correct the license copyright attribution to 0b5vr and rename the license file to `LICENSE`.

## [0.1.1] - 2021-08-28

### Added

- Ship TypeScript declarations, including a downleveled declaration bundle for TypeScript 3.4.

### Maintenance

- Remove the npm test script and automatic prepublish lint hook.

## [0.1.0] - 2021-08-22

### Added

- Introduce a Tweakpane 3 profiler blade with named, nested `measure()` calls, a color-coded timing chart, total duration, and hover tooltips showing measurement paths and durations.
- Display rolling median timings with configurable history size, refresh interval, target duration, label, units, and numeric precision.
- Export `ProfilerBladePlugin` and its `plugin` alias, plus `ProfilerBladeDefaultMeasureHandler`; support replaceable measurement handlers whose timing results may be promises.
- Provide regular and minified UMD bundles under `@0b5vr/tweakpane-plugin-profiler`, exposing the `TweakpaneProfilerBladePlugin` browser global.

### Documentation

- Add browser setup and measurement examples covering plugin registration, blade creation, animation-loop profiling, and nested measurements.

### Maintenance

- Establish the TypeScript, Rollup, Sass, linting, development-watch, and cross-platform cleanup toolchain.

[0.1.0]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/releases/tag/v0.1.0
[0.1.1]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/v0.1.0...v0.1.1
[0.1.2]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/v0.1.1...v0.1.2
[0.2.0]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/v0.1.2...v0.2.0
[0.3.0]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/v0.2.0...v0.3.0
[0.4.0]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/v0.3.0...v0.4.0
[0.4.1]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/v0.4.0...v0.4.1
[0.4.2-beta.1]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/v0.4.1...0.4.2-beta.1
[0.4.2-beta.2]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/0.4.2-beta.1...0.4.2-beta.2
[0.4.2-beta.3]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/0.4.2-beta.2...0.4.2-beta.3
[0.4.2-fork.1]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/0.4.2-beta.3...0.4.2-fork.1
[0.4.2-fork.2]: https://github.com/kitschpatrol/tweakpane-plugin-profiler/compare/0.4.2-fork.1...0.4.2-fork.2
