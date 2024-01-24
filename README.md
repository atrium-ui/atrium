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

See [./.rtx.toml](./.rtx.toml) for tools and versions used in this project.

- [task](https://taskfile.dev/)
- [bun](https://bun.sh/)

They can be installed using [mise (formerly rtx)](https://github.com/jdxcode/mise) with `mise install` in the root directory of this project.
This will also happen automatically when running `task docs` for the first time.

### Quick setup (optional)

```shell
git clone git@gitlab.s-v.de:sv/sv-frontend-library/mono.git && cd mono && task docs
```

### Getting Started

See all available commands:

```shell
task
```

Run dev server for docs website:

```shell
task docs
```

### Development with external projects

Watch and build packages:

```shell
task dev
```

Install packages from local mono in external project:

```shell
cd <external_project>
npm install --save <local_path>/mono/packages/<package_name>
```

### Building elements

Since all elements are written in TypeScript, they need to be compiled to JavaScript.
All the elements share the same build system. We use [tsup](https://tsup.egoist.dev/) to generate light weight bundles.

The tsup configuration is located in the package.json of each element.

<br/>

## Publishing packages

To create a new version of a package, run `task version` and follow the instructions of the cli.

After the changes done by the cli are committed and pushed, the CI will automatically publish the package(s) when merged into main.

When develop is merged into the **main** branch, the docs will be automatically built and deployed to pages.
