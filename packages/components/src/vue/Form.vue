<script setup lang="ts">
import { ref } from "vue";
import "@sv/elements/transition";
import "@sv/elements/form";
import Button from "./Button.vue";
import { twMerge } from "tailwind-merge";

const props = defineProps<{
  submitLabel?: string;
  submitClass?: string;
}>();

const emit = defineEmits<{
  submit: [data: FormData];
}>();

const error = ref<string>();
const success = ref<string>();
const loading = ref(false);

async function handleSubmit(e: Event) {
  const form = e.currentTarget as HTMLFormElement;

  e.preventDefault();
  e.stopPropagation();

  loading.value = true;

  try {
    const data = new FormData(form);
    emit("submit", data);
    error.value = undefined;
  } catch (err: unknown) {
    error.value = String(err);
    console.error(error.value);
  } finally {
    loading.value = false;
  }
}

function setSuccess(message: string) {
  success.value = message;
}

function setError(message: string) {
  error.value = message;
}

defineExpose({ setSuccess, setError });
</script>

<template>
  <div>
    <div v-if="success">
      <h2>Success</h2>
      <p>{{ success }}</p>
    </div>

    <form v-else @submit="handleSubmit">
      <div class="flex flex-col gap-4">
        <slot />
      </div>

      <Button
        type="submit"
        :class="twMerge('mt-8 overflow-hidden', props.submitClass)"
      >
        <a-transition>
          <div class="flex items-center gap-2">
            <span>{{ submitLabel || "Submit" }}</span>
            <span v-if="loading" class="loading-indicator flex-none" />
          </div>
        </a-transition>
      </Button>
    </form>

    <div v-if="error" class="text-red-600">
      <p>{{ error }}</p>
    </div>
  </div>
</template>