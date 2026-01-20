<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import { computed, type VNode } from "vue";

const variants = {
  default: [
    "group w-full resize-y rounded-md border border-zinc-200 bg-transparent leading-normal px-3 py-1 hover:border-zinc-400",
    "outline-hidden focus-within:ring-2 focus-within:ring-[currentColor]",
  ],
  error: ["border-red-600"],
};

const props = defineProps<{
  class?: string | string[];
  autofocus?: boolean;
  placeholder?: string;
  prefix?: VNode | string;
  suffix?: VNode | string;
  name?: string;
  id?: string;
  value?: string;
  type?: string;
  error?: string;
  required?: boolean;
  autocomplete?: string;
  minlength?: number;
  readonly?: boolean;
  multiline?: boolean;
}>();

const emit = defineEmits<{
  invalid: [e: Event];
  input: [e: Event];
  change: [e: Event];
  keydown: [e: KeyboardEvent];
  keyup: [e: KeyboardEvent];
}>();

const containerClass = computed(() =>
  twMerge(
    "flex",
    variants.default,
    props.error && variants.error,
    props.multiline && "mt-4 min-h-10 px-5 lg:px-2",
    props.class,
  )
);

function handleInvalid(e: Event) {
  emit("invalid", e);
}

function handleInput(e: Event) {
  emit("input", e);
}

function handleChange(e: Event) {
  emit("change", e);
}

function handleKeydown(e: KeyboardEvent) {
  emit("keydown", e);
}

function handleKeyup(e: KeyboardEvent) {
  emit("keyup", e);
}
</script>

<template>
  <div>
    <div :class="containerClass">
      <slot />

      <component :is="prefix" v-if="prefix" />

      <textarea
        v-if="multiline"
        :rows="6"
        :id="id"
        :name="name"
        :autofocus="autofocus"
        :readonly="readonly"
        :required="required || undefined"
        :placeholder="placeholder"
        class="m-0 flex-1 border-none bg-transparent p-0 outline-hidden"
        :value="value"
        @change="handleChange"
        @input="handleInput"
        @invalid="handleInvalid"
      />
      <input
        v-else
        :type="type"
        :id="id"
        :name="name"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :readonly="readonly"
        :required="required || undefined"
        :placeholder="placeholder"
        class="m-0 flex-1 border-none bg-transparent p-0 outline-hidden"
        :minlength="minlength"
        :value="value"
        @change="handleChange"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @input="handleInput"
        @invalid="handleInvalid"
      />

      <component :is="suffix" v-if="suffix" />
    </div>

    <div v-if="error" class="pt-2 text-md text-yellow">
      <label>{{ error }}</label>
    </div>
  </div>
</template>