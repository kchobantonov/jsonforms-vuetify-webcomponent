import { createVuetify } from 'vuetify';

// just make sure that the locales are loaded

import { type AppStore } from '@/store';
import { watch } from 'vue';
import { createVuetifyOptions } from './options';

function createVuetifyInstance(appStore: AppStore) {
  return createVuetify(createVuetifyOptions(appStore));
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
