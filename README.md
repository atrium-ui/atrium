<p align="center">
  <p align="center">
   <img width="150" height="150" src="docs/src/assets/atrium.png" alt="Logo">
  </p>
	<h1 align="center"><b>Atrium Mono</b></h1>
	<p align="center">
    A collection of framework agnostic and functional web-components and templates for building Websites.
    <br />
    <br />
    <a href="https://sv.pages.s-v.de/sv-frontend-library/mono/">Docs</a> ·
    <a href="https://gitlab.s-v.de/sv/sv-frontend-library/mono/-/packages">Packages</a>
    <br />
  </p>
</p>
<br />

## Use in other projects

See [Installation](https://sv.pages.s-v.de/sv-frontend-library/mono/guides/installation/) in the docs for instructions.

<br />

## Packages

### @sv/mono

This package contains all components and templates. It is also used for tooling and development, for example, the cli is located here.

### @sv/elements

The elements package distributes all the custom-elements that are used in the components or external projects.

### @sv/cli

This package is **not** published. It contains the cli which is used from the **@sv/mono** package and only contains executable JavaScript.

**Dependencies**

All elements share the same dependencies from the [elements/package.json](elements/package.json).

<br />

## Development

### Prerequisites

See [./.rtx.toml](./.rtx.toml) for tools and versions used in this project.

Currently:

- [task](https://taskfile.dev/)
- [pnpm](https://pnpm.io/)
- [bun](https://bun.sh/)

They can be installed using [rtx](https://github.com/jdxcode/rtx) with `rtx install` in the root directory of this project.
This will also happen automatically when running `task docs` for the first time.

### Getting Started

Run dev server for docs website:

```shell
task docs
```

See all available commands:

```shell
task -l
```

### Quick setup

```
git clone git@gitlab.s-v.de:sv-components/mono.git && cd mono && task docs
```

### Building elements

Since all elements are written in TypeScript, they need to be compiled to JavaScript.
All the elements share the same build system. We use [tsup](https://tsup.egoist.dev/) to generate light weight bundles.

The tsup configuration is located in the package.json of each element.

### Publishing packages

Package publishing is handled by the CI. Currently, it is not possible to publish packages individually, all packages are published at once.

The **develop** branch always publishes a prerelease packages. When developing features, it is recommended to work in a feature branch and merge into develop to release prerelease (rc) packages.

Allowed branch names include:

- `feature/*`
- `fix/*`

When it is time to release a new version, create a merge request from **develop** into **main**.

When develop is merged into the **main** branch, the docs will be automatically built and deployed to pages.
That pipeline will also give the options to publish a _patch_ or _minor_ release of the packages.

Requirements:

- `develop` pipeline must be completed before main can publish
