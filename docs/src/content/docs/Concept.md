---
group: "docs"
icon: "carbon:share"
title: "Concept"
---

We differentiate between Elements and Components.

## Components

Components serve as a **template** for a specific use case including styling and behavior.
They are styled using [TailwindCSS](https://tailwindcss.com/). This allows us to build components that are highly customizable and compact without keeping a dependency on external CSS files.

Components can have dependencies on other packages, though when "using" a component you do not import the component itself, but a copy of it. This copy can be freely changed and styled.

Inspired by https://ui.shadcn.com/.

## Elements

Elements are the smallest elements more complex components can be broken down to. Things like the opening and closing mechanic of an accordion, excluding the title, content or any styling.

They are built as WebComponents and can be used in any Framework or just a HTML file.

#### Lit

We use the lit library to simplify development of WebComponents. It provides fast html template rendering and some reactive state.

[https://lit.dev/docs/](https://lit.dev/docs/)

#### Support

[Can I use](https://caniuse.com/mdn-api_window_customelements) Support for WebComponents exists in major browsers since around 2018.

![Support table](./images/support.jpg)

[More information here](https://www.webcomponents.org/)