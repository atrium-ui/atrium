---
group: "docs"
icon: "carbon:assembly-reference"
title: "Installation"
---

### Configure package registry

Update or create .npmrc file located next to the package.json file with the following content:

```ini
# .npmrc
@sv:registry=https://gitlab.s-v.de/api/v4/packages/npm/
'//gitlab.s-v.de/api/v4/:_authToken'="glpat-rBdzRF98KUSWGRAyuGoj"
```

More information about the Gitlab Package Registry can be found [here](https://docs.gitlab.com/ee/user/packages/npm_registry/#install-from-the-instance-level).

### Install packages

```bash
npm i @sv/mono @sv/elements
```
