<script setup lang="ts">
import { ref } from 'vue';
import { useScriptTag } from '@vueuse/core';

const location = './js/vuetify-json-forms.js';
const loading = ref(true);

useScriptTag(
  location,
  // on script tag loaded.
  (_el: HTMLScriptElement) => {
    loading.value = false;
  },
  { type: 'module' },
);
</script>

<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      rounded
      height="6"
    ></v-progress-linear>
    <vuetify-json-forms v-else v-bind="$attrs"></vuetify-json-forms>
  </div>
</template>
