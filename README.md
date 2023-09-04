# Mono

This repository contains a collection of framework agnostic and functional web-components.

### Prerequisites

- rtx
- task

You can use [this](https://github.com/luckydye/build-utils) scripts to install task with rtx.

## Getting Started

Install all dependencies:
`task setup`

Dev watch build of all packages and visual docs:
`task dev`

### Other commands

Build all packages:
`task build`

Init new component:
`task new`

**Dependencies**

Dependencies that are required only in development can be added in each component under _"devDependencies"_. External dependencies that are not bundled into dist files need to be added to the root pacakge.json under _"dependencies"_.

**Development**

N/A
