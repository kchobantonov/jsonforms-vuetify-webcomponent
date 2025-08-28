import type { VuetifyOptions as VuetifyCreateOptions } from 'vuetify';
import { mergeDeep } from 'vuetify/lib/util/helpers.mjs';

import { md1, md2, md3 } from 'vuetify/blueprints';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { aliases as faAliases, fa } from 'vuetify/iconsets/fa';

import DayJsAdapter from '@date-io/dayjs';
import dayjsBg from 'dayjs/locale/bg';
import dayjsDe from 'dayjs/locale/de';
import dayjsEn from 'dayjs/locale/en';
import dayjsEs from 'dayjs/locale/es';
import dayjsFr from 'dayjs/locale/fr';

import { bg, de, en, es, fr } from 'vuetify/locale';
import { faIconAliases, mdiIconAliases } from '@jsonforms/vue-vuetify';
import type { AppStore } from '@/store';

export const defaultVuetifyOptions: VuetifyOptions = {
  'color-schema': 'system',
  components,
  directives,
  theme: {
    defaultTheme: 'system', // note that internally vuetify will handle that
  },
  icons: {
    defaultSet: 'mdi',
    aliases: { ...aliases, ...mdiIconAliases },
    sets: {
      mdi,
      fa,
    },
  },
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: {
      bg,
      de,
      en,
      es,
      fr,
    },
  },
};

export interface VuetifyOptions
  extends Omit<VuetifyCreateOptions, 'blueprint'> {
  // Blueprint can be actual Blueprint object or string reference
  blueprint?: VuetifyCreateOptions['blueprint'] | 'md1' | 'md2' | 'md3';
  'color-schema'?: 'light' | 'dark' | 'system';
}

export interface Blueprint extends Omit<VuetifyCreateOptions, 'blueprint'> {}

export function createVuetifyOptions(appStore: AppStore): VuetifyCreateOptions {
  const options = appStore.vuetifyOptions;
  if (options.icons?.defaultSet) {
    // inject icons
    switch (options.icons.defaultSet) {
      case 'mdi':
        options.icons.aliases = {
          ...aliases,
          ...mdiIconAliases,
          ...(options.icons.aliases ?? {}),
        };
        break;
      case 'fa':
        options.icons.aliases = {
          ...{ ...faAliases, ...{ calendar: 'far fa-calendar' } },
          ...faIconAliases,
          ...(options.icons.aliases ?? {}),
        };
        break;
      default:
        if (!options.icons.sets?.[options.icons.defaultSet])
          console.warn(`Unknown iconSet: ${options.icons.defaultSet}`);
    }
  }

  const vuetifyOptions = mergeDeep(
    defaultVuetifyOptions,
    options,
  ) as VuetifyOptions;

  if (vuetifyOptions.blueprint !== undefined) {
    vuetifyOptions.blueprint = resolveBlueprint(vuetifyOptions.blueprint);
  }

  if (vuetifyOptions.date?.adapter) {
    vuetifyOptions.date.adapter = resolveDateAdapter(
      vuetifyOptions.date.adapter,
    );
    if (
      vuetifyOptions.date.adapter === DayJsAdapter &&
      vuetifyOptions.date.locale === undefined
    ) {
      vuetifyOptions.date.locale = {
        dayjsBg,
        dayjsDe,
        dayjsEn,
        dayjsEs,
        dayjsFr,
      };
    }
  }

  if (typeof vuetifyOptions.theme === 'object') {
    if (vuetifyOptions.theme.defaultTheme) {
      const themeNames = [
        ...['light', 'dark', 'system'],
        ...Object.keys(vuetifyOptions.theme.themes ?? {}),
      ];

      if (!themeNames.includes(vuetifyOptions.theme.defaultTheme)) {
        vuetifyOptions.theme.defaultTheme =
          appStore.dark === undefined
            ? 'system'
            : appStore.dark
              ? 'dark'
              : 'light';
      }
    }
  }
  return vuetifyOptions as VuetifyCreateOptions;
}

export function resolveBlueprint(
  blueprint: string | Blueprint,
): Blueprint | undefined {
  if (typeof blueprint === 'object') {
    return blueprint;
  }

  try {
    switch (blueprint) {
      case 'md1':
        return md1;
      case 'md2':
        return md2;
      case 'md3':
        return md3;
      default:
        console.warn(`Unknown blueprint: ${blueprint}`);
        return undefined;
    }
  } catch (error) {
    console.error(`Failed to load blueprint ${blueprint}:`, error);
    return undefined;
  }
}

export function resolveDateAdapter(adapter: string | any): any {
  if (typeof adapter === 'object') {
    return adapter;
  }

  try {
    switch (adapter) {
      case 'dayjs':
        return DayJsAdapter;
      // TODO: to add more if needed
      default:
        console.warn(`Unknown date adapter: ${adapter}`);
        return undefined;
    }
  } catch (error) {
    console.error(`Failed to load date adapter ${adapter}:`, error);
    return undefined;
  }
}

export function isValidVuetifyOptions(value: any): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  if (typeof value === 'object') {
    return true; // Allow any object structure
  }

  return false;
}
