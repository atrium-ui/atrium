# Mono

This repository contains a collection of framework agnostic and functional web-components.

### Prerequisites

- rtx

You can also use [this](https://github.com/luckydye/build-utils) scripts to install all requirements.

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

## Components

All components are located in the components/ directory.
Since _customElements_ is a native api, components can use any framework/library that outputs Custom-Elements.

**Dependencies**

Dependencies that are required only in development can be added in each component under _"devDependencies"_. External dependencies that are not bundled into dist files need to be added to the root pacakge.json under _"dependencies"_.

**Development**

While developing or testing new components, the visual docs build on [Histoire](https://histoire.dev/) can be used to preview the component in the browser.
Every component has a _stories/_.story.vue\* file that contains required markup and even styling.
