# Project description for Agents

A curated collection of Libraries, Custom-Elements and
Components for different Frameworks for building high quality websites.

## Project Structure

- /packages/components

This package contains all component templates and the cli for use.

- /packages/elements

The elements package distributes all the custom-elements that are used in the components or external projects.
All elements share the same dependencies from the packages/elements/package.json.

- /docs

Documentation website based on astro

## Arcitecture

Components are copy-paste templates for a specific use case including styling and behavior. They are styled using TailwindCSS and written as JSX functional components. This allows us to build components that are highly customizable and compact without keeping a dependency on external CSS files.

To keep the amount of logic in Components small, Elements are built as unstyled custom-elements using Lit which makes them framework agnostic, so they can be reused within many requirements and with any framework.

## Dev environment tips

We use gotask for a common interface to run scripts. 
All available tasks can be found in the /Taskfile.yml in the root of the project.

## Documentation Guidelines

### Components

Doc pages for components should consist of a couple sections in given order:

- Description of component
- Examples
  - Elements in stories should be centerd in the frame
  - Examples shold reflect some common usecase
  - They need to look good
  - 
- "Guidelines" for usage
- "Accessibility" things to consider and features
- "References" links

### Elements

Documentation of elements are more technical, describing the interface of an element.

Doc pages for components should consist of a couple sections in given order:

- Description of element
- Featured example
- Accessibility features
- How to use it with examples
- Customization options
- Type Documentation
