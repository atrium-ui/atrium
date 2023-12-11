---
group: "docs"
icon: "carbon:share"
title: "Concept"
---

This library includes web components and templates designed to be independent of any specific framework for use in website creation. We make a distinction between Components and Elements:

## Components

Components serve as a **template** for a specific use case including styling and behavior.
They are styled using [TailwindCSS](https://tailwindcss.com/). This allows us to build components that are highly customizable and compact without keeping a dependency on external CSS files.

Components can have dependencies on other packages, though when "using" a component you do not import the component itself, but a copy of it. This copy can be freely changed and styled. In the same way, that makes it possible to update or change the component without breaking the websites that use it.

Inspired by https://ui.shadcn.com/.

## Elements

Elements are the smallest elements more complex components can be broken down to. Things like the opening and closing mechanic of an accordion, excluding the title, content or any styling.

They are built as WebComponents and can be used in any Framework or just a HTML file.

#### Lit

We use the lit library to simplify development of WebComponents. It provides fast html template rendering and some reactive state.

[https://lit.dev/docs/](https://lit.dev/docs/)

#### Support

[Can I use](https://caniuse.com/mdn-api_window_customelements) Support for WebComponents exists in major browsers since around 2018.

![Support table](../../assets/support.jpg)

[More information here](https://www.webcomponents.org/)
