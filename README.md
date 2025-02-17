<p align="center">
  <img width="180px" height="auto" src="docs/assets/atrium-dark.png" alt="atrium header">
</p>

<p align="center" style="text-align:cetner;">
	<h1 align="center" style="text-align:cetner;"><b>Atrium</b></h1>
	<p align="center" style="text-align:cetner;">
    A curated collection of libraries, Custom-elements and components for different frameworks for building websites.
    <br />
  </p>
</p>

## Packages

### @atrium-ui/components

This package contains all component templates and the cli for use.

### @atrium-ui/elements

The elements package distributes all the custom-elements that are used in the components or external projects.
All elements share the same dependencies from the packages/elements/package.json.

<br />

## Development

### Prerequisites

See [./.mise.toml](./.mise.toml) for tools and versions used in this project.

- [task](https://taskfile.dev/)
- [bun](https://bun.sh/)

It is recomended to use [mise](https://github.com/jdxcode/mise) to automatically manage these tools.

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
Most of the elements share the same build system. We use [tsup](https://tsup.egoist.dev/) to generate light weight bundles.

The tsup configuration is located in the package.json of each element.

<br/>

## Publishing packages

This project uses [Knope](https://knope.tech/) for creating releases. Packages are automatically versioned using [Conventional commits](https://knope.tech/reference/concepts/conventional-commits/) or [Changeset](https://knope.tech/reference/concepts/changeset/).

Example commit to bump the elements package by a minor version when merged into main:

```bash
git commit -m "feat(elements): some change notes"
```

Scopes for each package are define in [./knope.toml](./knope.toml). Commits without scope will version **all** packages.

To create a new version of multiple packages at once, run `task version` and follow the instructions of the cli to create a [Changeset](https://knope.tech/reference/concepts/changeset/).

After all changes are committed and merged into main, the CI will automatically version and publish the package(s), as well as build and deployed docs to gitlab pages.
