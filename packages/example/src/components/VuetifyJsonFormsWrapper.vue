<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      rounded
      height="6"
    ></v-progress-linear>
    <v-alert outlined type="error" v-else-if="error !== undefined">
      <strong>Unable to load vuetify-json-forms webcomponent</strong><br />
    </v-alert>
    <vuetify-json-forms v-else v-bind="$attrs"></vuetify-json-forms>
  </div>
</template>

<script lang="ts">
import { useScriptTag } from '@vueuse/core';

export default {
  name: 'vuetify-json-forms-wrapper',
  data() {
    return {
      location: './js/vuetify-json-forms.min.js',
      loading: true,
      error: undefined,
    };
  },
  methods: {
    loadVuetifyJsonForms() {
      useScriptTag(this.location, (el: HTMLScriptElement) => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loadVuetifyJsonForms();
  },
};
</script>
