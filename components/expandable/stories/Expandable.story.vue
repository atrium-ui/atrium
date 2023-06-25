<script lang="ts" setup>
import { paragraph } from "txtgen";
import "../src/index.js";
import "../../select/src/index.js";
</script>

<template>
  <Story group="primitives" icon-color="#8B5CF6">
    <Variant title="Accordion">
      <sv-expandable class="accordion" data-id="three">
        <div slot="toggle">
          <button class="accordion-title">
            <div class="headline">
              <span>Toggle</span>
            </div>
            <div class="accordion-collapse-icon">
              <svg
                class="plus-icon"
                width="16px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M8.6,20v-8.5H0V8.6h8.6V0h2.9v8.6H20v2.9h-8.6V20H8.6z" />
              </svg>
              <svg
                class="minus-icon"
                width="16px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M0,11.5V8.6h20v2.9H0z" />
              </svg>
            </div>
          </button>
        </div>

        <div class="accordion-content">
          {{ paragraph(6) }}
        </div>
      </sv-expandable>
    </Variant>

    <Variant title="Accordion (exclusive)">
      <sv-select activeAttribute="opened">
        <sv-expandable class="accordion" data-id="three">
          <div slot="toggle">
            <button class="accordion-title">
              <div class="headline">
                <span>Toggle</span>
              </div>
              <div class="accordion-collapse-icon">
                <svg
                  class="plus-icon"
                  width="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.6,20v-8.5H0V8.6h8.6V0h2.9v8.6H20v2.9h-8.6V20H8.6z" />
                </svg>
                <svg
                  class="minus-icon"
                  width="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M0,11.5V8.6h20v2.9H0z" />
                </svg>
              </div>
            </button>
          </div>
          <div class="accordion-content">
            {{ paragraph(6) }}
          </div>
        </sv-expandable>

        <sv-expandable class="accordion" data-id="three">
          <div slot="toggle">
            <button class="accordion-title">
              <div class="headline">
                <span>Toggle</span>
              </div>
              <div class="accordion-collapse-icon">
                <svg
                  class="plus-icon"
                  width="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.6,20v-8.5H0V8.6h8.6V0h2.9v8.6H20v2.9h-8.6V20H8.6z" />
                </svg>
                <svg
                  class="minus-icon"
                  width="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M0,11.5V8.6h20v2.9H0z" />
                </svg>
              </div>
            </button>
          </div>
          <div class="accordion-content">
            {{ paragraph(6) }}
          </div>
        </sv-expandable>
      </sv-select>
    </Variant>

    <Variant title="text">
      <p>
        {{ paragraph(4) }}
      </p>

      <sv-expandable direction="up" data-id="one">
        <p>
          {{ paragraph(4) }}
        </p>

        <button slot="toggle">toggle</button>
      </sv-expandable>
    </Variant>

    <Variant title="list">
      <ul>
        <li>
          Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
        </li>
        <li>
          Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
        </li>
        <li>
          Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
        </li>
      </ul>

      <sv-expandable direction="up" data-id="two">
        <ul>
          <li>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
          </li>
          <li>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
          </li>
          <li>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
          </li>
          <li>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
          </li>
          <li>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
          </li>
          <li>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
          </li>
          <li>
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes
          </li>
        </ul>

        <button slot="toggle">toggle</button>
      </sv-expandable>
    </Variant>
  </Story>
</template>

<style lang="scss" scoped>
button {
  display: block;
  text-align: center;
  margin: 10px auto;
}

ul {
  margin: 0;
}

.accordion {
  margin-top: 4px;
  background: #eee;
  border-radius: 6px;

  .accordion-title {
    all: unset;
    cursor: pointer;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 1.125em;
    transition: background 0.12s ease-out;
    width: 100%;
    box-sizing: border-box;

    &:focus {
      outline: 2px auto black;
      outline-offset: 1px;
    }

    &:focus,
    &:hover {
      background: rgb(230, 230, 230);
    }

    &:active {
      transition: none;
      background: rgb(235, 235, 235);
    }
  }

  .accordion-content {
    white-space: pre-line;
    text-transform: none;
    padding: 10px 20px 30px 20px;
  }

  .accordion-collapse-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    opacity: 0.75;
  }

  .minus-icon,
  .plus-icon {
    position: absolute;
    transition: opacity 0.2s ease, transform 0.2s ease 0.02s;
  }

  &:not([opened]) .plus-icon {
    transform: rotate(90deg);
  }
  &:not([opened]) .minus-icon {
    transform: rotate(90deg);
  }
  &[opened] .plus-icon {
    opacity: 0;
  }
}
</style>

<docs lang="md">
# expandable

A more basic element of an accordion that only includes the animation and scroll behavios for expandable content.

## Properties

```typescript
<sv-expandable
  opened: boolean;
  direction: "up" | "down";
/>
```
</docs>
