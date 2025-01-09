import { IconSymbol } from '@jsonforms/vue-vuetify';
import { computed, inject } from 'vue';

import { aliases as faIconAliases } from './fa';
export * from './icons';
import { aliases as mdiIconAliases } from './mdi';
import type { IconAliases } from './icons';

export const useIcons = () => {
  const iconSet = computed<IconAliases>(() => {
    const icons = inject(IconSymbol);
    if (!icons) throw new Error('Missing Vuetify Icons provide!');

    let result = mdiIconAliases;
    const overrides = icons.aliases;

    if (icons.defaultSet === 'fa') {
      result = faIconAliases;
    }

    return overrides ? { ...result, ...overrides } : result;
  });

  return {
    current: iconSet,
  };
};
