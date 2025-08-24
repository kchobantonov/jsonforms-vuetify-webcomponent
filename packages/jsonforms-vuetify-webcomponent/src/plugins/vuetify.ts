import { createVuetify, type Blueprint, type ThemeDefinition } from 'vuetify';
import { md1, md2, md3 } from 'vuetify/blueprints';

import { bg, de, en } from 'vuetify/locale';

// just make sure that the locales are loaded

import { useAppStore } from '@/store';
import { faIconAliases, mdiIconAliases } from '@jsonforms/vue-vuetify';
import { watch } from 'vue';
import { fa, aliases as faAliases } from 'vuetify/iconsets/fa';
import { mdi, aliases as mdiAliases } from 'vuetify/iconsets/mdi';

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export function getCustomThemes(blueprint: string) {
  const getThemeColors = (blueprint: string) => {
    switch (blueprint) {
      case 'md1':
        return (md1.theme as any).themes.light.colors;
      case 'md2':
        return (md2.theme as any).themes.light.colors;
      default:
        return (md3.theme as any).themes.light.colors;
    }
  };

  const customThemes: (ThemeDefinition & { name: string })[] = [
    {
      name: 'light',
      dark: false,
      colors: getThemeColors(blueprint),
    },
    {
      name: 'dark',
      dark: true,
      colors: {
        primary: '#2196F3',
        secondary: '#54B6B2',
        error: '#CF6679',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
      },
    },
  ];

  return customThemes;
}

function toIconSetAliases(iconset: string) {
  // we can add vue-vuetify icons setoverrides here if needed or use the default provided base on the iconset

  if (iconset === 'fa') {
    // override vuetify calendar to use fa-regular calendar instead of fa-solid
    return {
      ...{ ...faAliases, ...{ calendar: 'far fa-calendar' } },
      ...faIconAliases,
    };
  }

  // default
  return { ...mdiAliases, ...mdiIconAliases };
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
  const theme = {
    defaultTheme: appStore.dark ? 'dark' : 'light',
    themes: getCustomThemes(appStore.blueprint).reduce(
      (acc: Record<string, ThemeDefinition>, current) => {
        acc[current.name] = current;
        return acc;
      },
      {},
    ),
  };

  return createVuetify({
    components,
    directives,
    blueprint: toBlueprint(appStore.blueprint),
    locale: {
      locale: appStore.locale,
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
    theme: theme,
  });
}

export function buildVuetify() {
  const appStore = useAppStore();
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
