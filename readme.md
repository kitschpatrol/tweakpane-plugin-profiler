<!-- title -->

# @kitschpatrol/tweakpane-plugin-profiler

<!-- /title -->

<!-- badges({ npmDownloads: true }) -->

[![NPM Package @kitschpatrol/tweakpane-plugin-profiler](https://img.shields.io/npm/v/@kitschpatrol/tweakpane-plugin-profiler.svg)](https://www.npmjs.com/package/@kitschpatrol/tweakpane-plugin-profiler)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)
[![CI](https://github.com/kitschpatrol/tweakpane-plugin-profiler/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/tweakpane-plugin-profiler/actions/workflows/ci.yml)
[![NPM Downloads @kitschpatrol/tweakpane-plugin-profiler](https://img.shields.io/npm/dm/@kitschpatrol/tweakpane-plugin-profiler)](https://www.npmjs.com/package/@kitschpatrol/tweakpane-plugin-profiler)

<!-- /badges -->

<!-- description -->

**Fork of tweakpane-plugin-profiler with build optimizations.**

<!-- /description -->

## Overview

This is a fork of [0b5vr's](https://github.com/0b5vr) [@0b5vr/tweakpane-plugin-profiler](https://github.com/0b5vr/tweakpane-plugin-profiler) with externalized dependencies.

This allows for smaller bundled file sizes in projects using multiple Tweakpane plugins.

It is published to NPM primarily for the [_Svelte Tweakpane UI_](https://kitschpatrol.com/svelte-tweakpane-ui) project, and will be kept in sync with the upstream version of the plugin, with minimal changes other than dependency externalization.

See the [upstream readme](https://github.com/0b5vr/tweakpane-plugin-profiler/blob/dev/README.md) for details on the original plugin and its usage.

## Fork changes

- Publishes as `@kitschpatrol/tweakpane-plugin-profiler` instead of `@0b5vr/tweakpane-plugin-profiler`.
- Adds a `/lite` export that imports `@tweakpane/core` instead of bundling it so projects can share one copy of `core` across multiple plugins.
- Exports public parameter types.
- Migrates the repository structure to align with the Tweakpane plugin template provided by [@kitschpatrol/create-project](https://github.com/kitschpatrol/create-project), which includes:
  - [pnpm](https://pnpm.io/) instead of npm for local development
  - [tsdown](https://tsdown.dev/) for bundling, type generation, and SCSS processing
  - [vite](https://vite.dev/) for live-reloading the demo project
  - [vitest](https://vitest.dev/) for automated tests
  - [ksc](https://github.com/kitschpatrol/shared-config) for linting and shared configuration
  - [chagent](https://github.com/kitschpatrol/chagent) for release notes

## Getting started

### Dependencies

The plugin requires [Tweakpane 4](https://www.npmjs.com/package/tweakpane).

If you're using the `/lite` export path of the plugin without a bundler, you'll need to provide the [@tweakpane/core](https://www.npmjs.com/package/@tweakpane/core) library as well.

If you're using Svelte 4 or 5 as a front-end library, take a look at [Svelte Tweakpane UI](https://kitschpatrol.com/svelte-tweakpane-ui), which wraps Tweakpane in a set of Svelte-friendly components, including the [`<Profiler>`](https://kitschpatrol.com/svelte-tweakpane-ui/docs/components/profiler) control from this plugin.

<!-- installation -->

### Installation

Add it to your project:

```sh
npm install @kitschpatrol/tweakpane-plugin-profiler
```

<!-- /installation -->

## Usage

```js
import * as TweakpanePluginProfiler from '@kitschpatrol/tweakpane-plugin-profiler'
import { Pane } from 'tweakpane'

const pane = new Pane()
pane.registerPlugin(TweakpanePluginProfiler)

pane.addBlade({ label: 'Timing', view: 'profiler' })
```

To share core through your bundler, import `@kitschpatrol/tweakpane-plugin-profiler/lite` instead.

## Implementation notes

The [Rollup](https://rollupjs.org) configuration provided in the [Tweakpane plugin template](https://github.com/tweakpane/plugin-template) does not externalize [`@tweakpane/core`](https://github.com/cocopon/tweakpane/tree/main/packages/core) as a production dependency.

Instead, it gets built into the single-file plugin artifact, which is what's published to NPM and imported by plugin consumers. This makes it easy to import as an ES module from a URL, but means that larger projects importing multiple Tweakpane plugins end up with duplicate copies of the `@tweakpane/core` code, adding about \~100 Kb to the final minified build for each plugin after the first.

Externalizing this dependency allows build tools like [vite](https://vite.dev) to share a single instance of the `@tweakpane/core` code across multiple plugins.

If you're not using a bundler, direct ESM imports from URLs can still work by defining the `@tweakpane/core` dependency in an [importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap).

## Versioning

In addition to the dependency externalization change, this fork also includes dependency updates. In an effort to stay in sync with future upstream versions, release version numbers are tagged with a "fork" suffix and an incrementing number.

This fork releases from `main`; upstream uses `dev`.

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/tweakpane-plugin-profiler/issues) are welcome and appreciated.

Please open an issue to discuss changes before submitting a pull request. Unsolicited PRs (especially AI-generated ones) are unlikely to be merged.

This repository uses [@kitschpatrol/shared-config](https://github.com/kitschpatrol/shared-config) (via its `ksc` CLI) for linting and formatting, plus [MDAT](https://github.com/kitschpatrol/mdat) for readme placeholder expansion.

<!-- /contributing -->

## License

Original plugin: [MIT](license.txt) © 0b5vr

Fork modifications: [MIT](license.txt) © [Eric Mika](https://ericmika.com)
