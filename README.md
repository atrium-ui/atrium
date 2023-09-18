# Atrium Mono

This repository contains a collection of framework agnostic and functional web-components.

### Prerequisites

Used versions of tools are pinned in [.rtx.toml](.rtx.toml) and can be installed using [rtx](https://github.com/jdxcode/rtx) with `rtx install` in the root directory of this project.

## Getting Started

Install all dependencies:
`task setup`

Run dev server for docs website:
`task docs`

### Other commands

Build all packages:
`task build`

Build docs:
`task docs:build`

Init new component:
`task new`

**Dependencies**

Dependencies that are required only in development can be added in each component under _"devDependencies"_. External dependencies that are not bundled into dist files need to be added to the root pacakge.json under _"dependencies"_.

**Development**

N/A
