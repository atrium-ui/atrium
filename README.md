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

This package contains all elements and components. It is also used for tooling and development, for example, the cli run from here.

### @sv/elements

The elements package distributes all the custom-elements that are used in the components or external projects.

**Dependencies**

All elements share the same dependencies from the [elements/package.json](elements/package.json).

### @sv/cli

This package is **not** published. It contains the cli which is used by the **@sv/mono** package and only contains executable JavaScript.

### @sv/components

This package is **not** published. It contains all the component templates that will be copied by the cli.

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

<br/>

## Publishing packages

New versions should always be created from the **develop** branch.

To create a new version of a package, run `task version` and follow the instructions of the cli.

After the changes done by the cli are committed and pushed, the CI will automatically publish the package(s).

When develop is merged into the **main** branch, the docs will be automatically built and deployed to pages.
