---
group: 'docs'
icon: 'carbon:template'
title: 'Development'
---

# Development

WIP

- lit and alternatives
- VSCode addon
- Histoire story
- Versioning
- Testing
- default styles
- SSR

## Common Problems

- How to handle sub dependencies of primitive components
  - Import directly as external dependency
- Double .defines of components
  - Sub-dependencies should not be built into bundles
- Vue warning Failed to resolve component
  - vue compiler options
- Semantics
  - Extending native tags problem: https://github.com/lit/lit-element/issues/661
- Dependencies are not compiled (like "lorem-ipsum") try:
  - Vite config optimizeDeps
