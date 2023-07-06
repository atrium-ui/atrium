# Mono

This repository contains a collection of framework agnostic and functional web-components.

## Getting Started

Install all dependencies:
`pnpm i`

Dev watch build of all packages and visual docs:
`pnpm dev`

### Other commands

Build all packages:
`pnpm build`

Init new component:
`pnpm new`


## Components

All components are located in the components/ directory.
Since *customElements* is a native api, components can use any framework/library that outputs Custom-Elements.

**Dependencies**

Dependencies that are required only in development can be added in each component under *"devDependencies"*. External dependencies that are not bundled into dist files need to be added to the root pacakge.json under *"dependencies"*.

**Development**

While developing or testing new components, the visual docs build on [Histoire](https://histoire.dev/) can be used to preview the component in the browser.
Every component has a *stories/*.story.vue* file that contains required markup and even styling.
