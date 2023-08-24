---
group: 'docs'
icon: 'carbon:template'
title: 'Development'
---

# Development

## Lit

We use the lit library to simplify development of WebComponents. It provieds fast html template rendering and reactive state.

[https://lit.dev/docs/](https://lit.dev/docs/)

## Useful VSCode addons

- [eslint](vscode:extension/dbaeumer.vscode-eslint)
- [prettier](vscode:extension/esbenp.prettier-vscode)
- [lit-plugin](vscode:extension/runem.lit-plugin)


## Create a new component

Run `pnpm new` in root to initialise a new component.



## Branches

### `main`
is a publish branch for production versions.

### `develop`
is the main development branch wich also publishes pre-release versions.
It will be merged into `main` when a new production version will be published.

### `component/<component-id>`
is a feature branch for a single component. Theses will be merged into `develop`;

