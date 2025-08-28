import { createVuetify, type Blueprint } from 'vuetify';
import { md1, md2, md3 } from 'vuetify/blueprints';

import '@fortawesome/fontawesome-free/css/all.css';
import '@mdi/font/css/materialdesignicons.css';

import { bg, de, en } from 'vuetify/locale';
import 'vuetify/styles';
// just make sure that the locales are loaded

import { faIconAliases, mdiIconAliases } from '@jsonforms/vue-vuetify';
import { watch } from 'vue';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { fa, aliases as faAliases } from 'vuetify/iconsets/fa';
import { mdi, aliases as mdiAliases } from 'vuetify/iconsets/mdi';
import { aliases as appFaAliases } from '../icons/fa';
import { aliases as appMdiAliases } from '../icons/mdi';
import { useAppStore } from '../store';
import { themes } from './themes';

function toIconSetAliases(iconset: string) {
  // we can add vue-vuetify icons setoverrides here if needed or use the default provided base on the iconset

  if (iconset === 'fa') {
    // override vuetify calendar to use fa-regular calendar instead of fa-solid
    return {
      ...{ ...faAliases, ...{ calendar: 'far fa-calendar' } },
      ...faIconAliases,
      ...appFaAliases,
    };
  }

  // default
  return { ...mdiAliases, ...mdiIconAliases, ...appMdiAliases };
}

function toBlueprint(value: string): Blueprint {
  if (value === 'md1') {
    return md1;
  }
  if (value === 'md2') {
    return md2;
  }
  if (value === 'md3') {
    return md3;
  }
  // default
  return md1;
}

function createVuetifyInstance(appStore: ReturnType<typeof useAppStore>) {
  const defaults = appStore.variant
    ? {
        VField: {
          variant: appStore.variant,
        },
        VTextField: {
          variant: appStore.variant,
        },
        VCombobox: {
          variant: appStore.variant,
        },
        VSelect: {
          variant: appStore.variant,
        },
        VAutocomplete: {
          variant: appStore.variant,
        },
        VTextarea: {
          variant: appStore.variant,
        },
        VNumberInput: {
          variant: appStore.variant,
        },
        VDateInput: {
          variant: appStore.variant,
        },
        VCheckbox: { color: 'primary' },
      }
    : {
        VCheckbox: { color: 'primary' },
      };

  let defaultTheme = appStore.theme;
  const themeNames = [
    ...['light', 'dark', 'system'],
    ...Object.keys(themes ?? {}),
  ];

  if (!themeNames.includes(defaultTheme)) {
    defaultTheme =
      appStore.dark === undefined ? 'system' : appStore.dark ? 'dark' : 'light';
  }

  appStore.theme = defaultTheme;

  return createVuetify({
    components,
    directives,
    blueprint: toBlueprint(appStore.blueprint),
    locale: {
      locale: appStore.jsonforms.locale,
      fallback: 'en',
      messages: { en, bg, de },
    },
    icons: {
      defaultSet: appStore.iconset, // Set the default icon set
      sets: {
        mdi,
        fa,
      },
      aliases: toIconSetAliases(appStore.iconset),
    },
    theme: {
      defaultTheme: defaultTheme,
      themes: themes,
    },
    defaults: defaults,
  });
}

export function buildVuetify() {
  const appStore = useAppStore();
  const vuetify = createVuetifyInstance(appStore);

  watch(
    () => appStore.jsonforms.locale,
    (locale: string) => {
      vuetify.locale.current.value = locale;
    },
  );

  // Watch for changes in the variant and update Vuetify
  watch(
    () => appStore.variant,
    (variant: string, oldVariant: string) => {
      if (variant !== oldVariant) {
        if (variant) {
          vuetify.defaults.value = {
            ...vuetify.defaults.value,
            VField: {
              ...vuetify.defaults.value?.VField,
              variant: variant,
            },
            VTextField: {
              ...vuetify.defaults.value?.VTextField,
              variant: variant,
            },
            VCombobox: {
              ...vuetify.defaults.value?.VCombobox,
              variant: variant,
            },
            VSelect: {
              ...vuetify.defaults.value?.VSelect,
              variant: variant,
            },
            VAutocomplete: {
              ...vuetify.defaults.value?.VAutocomplete,
              variant: variant,
            },
            VTextarea: {
              ...vuetify.defaults.value?.VTextarea,
              variant: variant,
            },
            VNumberInput: {
              ...vuetify.defaults.value?.VNumberInput,
              variant: variant,
            },
            VDateInput: {
              ...vuetify.defaults.value?.VDateInput,
              variant: variant,
            },
          };
        } else {
          delete vuetify.defaults.value?.VField?.variant;
          delete vuetify.defaults.value?.VTextField?.variant;
          delete vuetify.defaults.value?.VCombobox?.variant;
          delete vuetify.defaults.value?.VSelect?.variant;
          delete vuetify.defaults.value?.VAutocomplete?.variant;
          delete vuetify.defaults.value?.VTextarea?.variant;
          delete vuetify.defaults.value?.VNumberInput?.variant;
          delete vuetify.defaults.value?.VDateInput?.variant;
        }
      }
    },
  );

  return vuetify;
}

export default buildVuetify;
