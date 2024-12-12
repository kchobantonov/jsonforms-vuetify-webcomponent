<script setup lang="ts">
import { computed, inject, ref, watch, type InjectionKey, type Ref } from 'vue';
import ExampleAppBar from './components/ExampleAppBar.vue';
import ExampleDrawer from './components/ExampleDrawer.vue';
import ExampleSettings from './components/ExampleSettings.vue';

import ExampleView from './views/ExampleView.vue';
import HomeView from './views/HomeView.vue';

import type { DefaultsInstance } from 'vuetify';
import { getCustomThemes } from './plugins/vuetify';
import { useAppStore } from './store';

const appStore = useAppStore();

const example = computed(() =>
  appStore.examples.find((ex) => ex.name === appStore.exampleName),
);

const theme = computed(() => {
  const theme = getCustomThemes(appStore.blueprint).filter(
    (t) => t.name === appStore.theme,
  );
  if (theme && theme[0] && theme[0].dark === appStore.dark) {
    return theme[0].name;
  }

  return appStore.dark ? 'dark' : 'light';
});

const appKey = ref(1);
const DefaultsSymbol: InjectionKey<Ref<DefaultsInstance>> =
  Symbol.for('vuetify:defaults');

const vuetifyDefaults = inject(DefaultsSymbol);

watch(
  () => vuetifyDefaults,
  () => {
    // force app refresh on vuetifyDefaults changes
    appKey.value = appKey.value + 1;
  },
  {
    deep: true,
  },
);
</script>

<template>
  <v-locale-provider :rtl="appStore.rtl" :locale="appStore.jsonforms.locale">
    <v-theme-provider :theme="theme">
      <v-app :key="appKey">
        <example-app-bar></example-app-bar>
        <example-drawer></example-drawer>
        <example-settings></example-settings>
        <Suspense>
          <v-main>
            <example-view v-if="example" :example="example"></example-view>
            <home-view v-else></home-view>
          </v-main>
        </Suspense>
      </v-app>
    </v-theme-provider>
  </v-locale-provider>
</template>

<style>
@import '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css';
@import '@chobantonov/jsonforms-vuetify-renderers/lib/jsonforms-vuetify-renderers.css';
</style>
