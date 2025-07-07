import { IconSymbol, useIcons as baseUseIcons } from '@jsonforms/vue-vuetify';
import { computed, inject } from 'vue';

import { aliases as faIconAliases } from './fa';
export * from './icons';
import { aliases as mdiIconAliases } from './mdi';
import type { IconAliases } from './icons';
import type { IconAliases as BaseIconAliases } from '@jsonforms/vue-vuetify';

export const useIcons = () => {
  const iconSet = computed<IconAliases & BaseIconAliases>(() => {
    const icons = inject(IconSymbol);
    if (!icons) throw new Error('Missing Vuetify Icons provide!');

    let result = mdiIconAliases;
    const base = baseUseIcons().current.value;

    if (icons.defaultSet === 'fa') {
      result = faIconAliases;
    }

    return { ...base, ...result };
  });

  return {
    current: iconSet,
  };
};
