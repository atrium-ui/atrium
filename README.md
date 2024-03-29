<p align="center" style="text-align:cetner;">
  <p align="center" style="text-align:cetner;">
   <img width="150" height="150" src="docs/src/assets/atrium.png" alt="Logo">
  </p>
	<h1 align="center" style="text-align:cetner;"><b>Atrium Mono</b></h1>
	<p align="center" style="text-align:cetner;">
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

See [Usage](https://sv.pages.s-v.de/sv-frontend-library/mono/usage/) in the docs for instructions.

<br />

## Packages

### @sv/components

This package contains all component templates and the cli for use.

### @sv/elements

The elements package distributes all the custom-elements that are used in the components or external projects.
All elements share the same dependencies from the packages/elements/package.json.

<br />

## Development

### Prerequisites

See [./.mise.toml](./.mise.toml) for tools and versions used in this project.

- [task](https://taskfile.dev/)
- [bun](https://bun.sh/)

It is recomended to use [mise (formerly rtx)](https://github.com/jdxcode/mise) to automatically manage these tools.

### Getting Started

See all available commands:

```shell
task
```

Run dev server for docs website:

```shell
task docs
```

### Development

Watch and build packages:

```shell
task dev
```

Link packages from local repository in external project:

```shell
cd <project>
pnpm link <path_to_atrium>/mono/packages/<package_name>
```

This will link the local package to the project.
To unlink the package, run:

```shell
pnpm unlink <package_name>
```

### Building elements

Since all elements are written in TypeScript, they need to be compiled to JavaScript.
All the elements share the same build system. We use [tsup](https://tsup.egoist.dev/) to generate light weight bundles.

The tsup configuration is located in the package.json of each element.

<br/>

## Publishing packages

To create a new version of a package, run `task version` and follow the instructions of the cli.

After the changes done by the cli are committed and pushed, the CI will automatically publish the package(s) when merged into main, as well as build and deployed docs to gitlab pages.
