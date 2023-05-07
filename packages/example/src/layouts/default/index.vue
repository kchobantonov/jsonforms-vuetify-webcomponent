<template>
  <v-app :dark="dark">
    <default-app-bar v-if="!formonly" />

    <default-drawer v-if="!formonly" />

    <default-view />
  </v-app>
</template>

<script lang="ts">
import { sync } from 'vuex-pathify';

export default {
  name: 'DefaultLayout',

  components: {
    DefaultAppBar: () => import('./AppBar'),
    DefaultDrawer: () => import('./Drawer'),
    DefaultView: () => import('./View'),
  },
  computed: {
    dark: sync('app/vuetify@theme.dark'),

    formonly(): boolean {
      return this.$route.query?.view === 'form-only';
    },
  },
  watch: {
    dark(newVal) {
      this.$vuetify.theme.dark = newVal;
    },
  },
  created() {
    this.$vuetify.theme.dark = this.dark;
  },
};
</script>
