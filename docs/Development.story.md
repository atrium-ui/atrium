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
- [Prettier ESLint](vscode:extension/rvest.vs-code-prettier-eslint)
- [lit-plugin](vscode:extension/runem.lit-plugin)


## Branches

### `dev`
is a published branch for development versions.

### `main`
is a publish branch for production versions.

### `develop`
is a development branch. This branch will be merged into `main` when a new production version will be published.

### `component/<component-id>`
is a feature branch for a single component. Theses will be merged into `develop`;
