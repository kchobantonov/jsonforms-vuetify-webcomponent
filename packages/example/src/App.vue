<template>
  <v-fade-transition mode="out-in">
    <router-view />
  </v-fade-transition>
</template>

<script lang="ts">
export default { name: 'App' };
</script>

<style scoped>
@import '~@jsonforms/vue2-vuetify/lib/jsonforms-vue2-vuetify.esm.css';
@import '~@chobantonov/jsonforms-vuetify-renderers/lib/jsonforms-vuetify-renderers.esm.css';
</style>
