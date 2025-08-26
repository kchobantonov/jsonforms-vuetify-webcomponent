import { createVuetify, type ThemeDefinition } from 'vuetify';

// just make sure that the locales are loaded

import { useAppStore, type AppStore } from '@/store';
import { watch } from 'vue';
import { fa } from 'vuetify/iconsets/fa';
import { mdi } from 'vuetify/iconsets/mdi';
import { createVuetifyOptions } from './options';

function createVuetifyInstance(appStore: AppStore) {
  return createVuetify(createVuetifyOptions(appStore.vuetifyOptions));
}

export function buildVuetify(appStore: AppStore) {
  const vuetify = createVuetifyInstance(appStore);

  watch(
    () => appStore.locale,
    (locale: string) => {
      vuetify.locale.current.value = locale;
    },
  );

  return vuetify;
}

export default buildVuetify;
